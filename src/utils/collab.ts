/**
 * Collaborative editing utilities for Sunsama task notes
 *
 * These functions create and update Yjs-based collaborative snapshots
 * compatible with Sunsama's real-time editing system.
 *
 * IMPORTANT: Task notes use XmlFragment → XmlElement('paragraph') → XmlText,
 * NOT Y.Text directly — using Y.Text breaks Sunsama UI sync.
 */

import * as Y from 'yjs';
import { parseMarkdownToBlocks } from './conversion.js';
import type { DocumentBlock, FormattedSegment } from './conversion.js';
import type { CollabSnapshot } from '../types/api.js';

/**
 * Helper to insert text segments into a text node that's already in the document
 */
function insertSegmentsIntoTextNode(
  textNode: Y.XmlText,
  segments: FormattedSegment[],
  codeBlock = false
): void {
  let offset = 0;
  for (const segment of segments) {
    const attrs = codeBlock ? { code: true } : (segment.attributes as Record<string, unknown>);
    textNode.insert(offset, segment.text, attrs || undefined);
    offset += segment.text.length;
  }
}

/**
 * Inserts document blocks into a Yjs XmlFragment
 *
 * Creates the proper XML element hierarchy for Sunsama's rich text editor,
 * including paragraphs, blockquotes, horizontal rules, and text with formatting marks.
 */
function insertBlocksIntoFragment(fragment: Y.XmlFragment, blocks: DocumentBlock[]): void {
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph': {
        const paragraph = new Y.XmlElement('paragraph');
        fragment.push([paragraph]);
        const textNode = new Y.XmlText();
        paragraph.insert(0, [textNode]);
        if (block.segments) {
          insertSegmentsIntoTextNode(textNode, block.segments);
        }
        break;
      }

      case 'blockquote': {
        const blockquote = new Y.XmlElement('blockquote');
        fragment.push([blockquote]);

        if (block.children) {
          for (const child of block.children) {
            if (child.type === 'paragraph' && child.segments) {
              const paragraph = new Y.XmlElement('paragraph');
              blockquote.push([paragraph]);
              const textNode = new Y.XmlText();
              paragraph.insert(0, [textNode]);
              insertSegmentsIntoTextNode(textNode, child.segments);
            }
          }
        }
        break;
      }

      case 'horizontalRule': {
        const hr = new Y.XmlElement('horizontalRule');
        fragment.push([hr]);
        break;
      }

      case 'codeBlock': {
        const paragraph = new Y.XmlElement('paragraph');
        fragment.push([paragraph]);
        const textNode = new Y.XmlText();
        paragraph.insert(0, [textNode]);
        if (block.segments) {
          insertSegmentsIntoTextNode(textNode, block.segments, true);
        }
        break;
      }

      case 'bulletList': {
        const bulletList = new Y.XmlElement('bulletList');
        fragment.push([bulletList]);

        if (block.items) {
          for (const item of block.items) {
            const listItem = new Y.XmlElement('listItem');
            bulletList.push([listItem]);
            const paragraph = new Y.XmlElement('paragraph');
            listItem.push([paragraph]);
            const textNode = new Y.XmlText();
            paragraph.insert(0, [textNode]);
            insertSegmentsIntoTextNode(textNode, item.segments);
          }
        }
        break;
      }

      case 'orderedList': {
        const orderedList = new Y.XmlElement('orderedList');
        fragment.push([orderedList]);
        if (block.start !== undefined && block.start !== 1) {
          orderedList.setAttribute('start', String(block.start));
        }

        if (block.items) {
          for (const item of block.items) {
            const listItem = new Y.XmlElement('listItem');
            orderedList.push([listItem]);
            const paragraph = new Y.XmlElement('paragraph');
            listItem.push([paragraph]);
            const textNode = new Y.XmlText();
            paragraph.insert(0, [textNode]);
            insertSegmentsIntoTextNode(textNode, item.segments);
          }
        }
        break;
      }
    }
  }

  // If no blocks were added, create an empty paragraph
  if (fragment.length === 0) {
    const paragraph = new Y.XmlElement('paragraph');
    fragment.push([paragraph]);
    const textNode = new Y.XmlText();
    paragraph.insert(0, [textNode]);
  }
}

/**
 * Creates a collaborative editing snapshot for task notes using Yjs
 *
 * Always creates a collabSnapshot even for empty notes to match UI behavior
 * and enable future note updates.
 *
 * @param taskId - The task ID (used to construct the Yjs document name)
 * @param notes - The notes content in Markdown format (can be empty)
 * @returns CollabSnapshot object with Yjs-generated state
 */
export function createCollabSnapshot(taskId: string, notes: string): CollabSnapshot {
  const docName = `tasks/notes/${taskId}`;

  const ydoc = new Y.Doc();
  const fragment = ydoc.getXmlFragment('default');

  // Wrap in transaction to batch operations and avoid Yjs warnings
  ydoc.transact(() => {
    if (notes) {
      const blocks = parseMarkdownToBlocks(notes);
      insertBlocksIntoFragment(fragment, blocks);
    } else {
      // Create empty paragraph for empty notes
      const paragraph = new Y.XmlElement('paragraph');
      fragment.push([paragraph]);
      const textNode = new Y.XmlText();
      paragraph.insert(0, [textNode]);
    }
  });

  // Encode the state vector (compact representation of document state)
  const stateVector = Y.encodeStateVector(ydoc);
  const base64StateVector = Buffer.from(stateVector).toString('base64');

  // Encode the full document state as an update
  const stateUpdate = Y.encodeStateAsUpdate(ydoc);
  const base64Update = Buffer.from(stateUpdate).toString('base64');

  return {
    state: {
      version: 'v1_sv',
      docName,
      clock: 0,
      value: base64StateVector,
    },
    updates: [
      {
        version: 'v1',
        action: 'update',
        docName,
        clock: 0,
        value: base64Update,
      },
    ],
  };
}

/**
 * Creates an updated collaborative editing snapshot based on existing state
 *
 * Takes an existing collaborative snapshot and creates a new one with updated
 * content, properly handling the Yjs document state and incrementing version clocks.
 *
 * @param existingSnapshot - The existing collaborative snapshot from the task
 * @param newContent - The new content to apply (Markdown format)
 * @returns Updated CollabSnapshot object
 */
export function createUpdatedCollabSnapshot(
  existingSnapshot: CollabSnapshot,
  newContent: string
): CollabSnapshot {
  const ydoc = new Y.Doc();

  // Try to apply existing updates to preserve collaborative state
  try {
    for (const update of existingSnapshot.updates) {
      if (update.value) {
        const updateBuffer = Buffer.from(update.value, 'base64');
        Y.applyUpdate(ydoc, updateBuffer);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Could not apply existing collaborative state, creating fresh document:', error);
  }

  const fragment = ydoc.getXmlFragment('default');

  // Wrap in transaction to batch operations and avoid Yjs warnings
  ydoc.transact(() => {
    // Clear existing content
    if (fragment.length > 0) {
      fragment.delete(0, fragment.length);
    }

    if (newContent) {
      const blocks = parseMarkdownToBlocks(newContent);
      insertBlocksIntoFragment(fragment, blocks);
    } else {
      // Create empty paragraph for empty content
      const paragraph = new Y.XmlElement('paragraph');
      fragment.push([paragraph]);
      const textNode = new Y.XmlText();
      paragraph.insert(0, [textNode]);
    }
  });

  // Encode the state vector (compact representation)
  const stateVector = Y.encodeStateVector(ydoc);
  const base64StateVector = Buffer.from(stateVector).toString('base64');

  // Encode the updated document state as an update
  const updatedState = Y.encodeStateAsUpdate(ydoc);
  const base64Update = Buffer.from(updatedState).toString('base64');

  // UI keeps clock at 0 and replaces updates array with single new update
  return {
    state: {
      ...existingSnapshot.state,
      clock: 0, // Keep clock at 0 (matching UI behavior)
      value: base64StateVector,
    },
    updates: [
      // Replace with single new update (not accumulating)
      {
        version: 'v1',
        action: 'update',
        docName: existingSnapshot.state.docName,
        clock: 0,
        value: base64Update,
      },
    ],
  };
}
