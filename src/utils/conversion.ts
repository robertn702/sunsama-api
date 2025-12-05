/**
 * HTML ↔ Markdown Conversion Utilities
 *
 * This module provides utilities for converting between HTML and Markdown formats.
 * It uses specialized libraries for optimal performance:
 * - Turndown for HTML → Markdown conversion
 * - Marked for Markdown → HTML conversion
 *
 * These utilities are particularly useful for Sunsama API task notes and comments
 * where content can be provided in either format and needs conversion to the other.
 */

import { marked, type Token, type Tokens } from 'marked';
import TurndownService from 'turndown';
import { z } from 'zod';
import { SunsamaAuthError } from '../errors/index.js';

/**
 * Decodes common HTML entities back to their original characters.
 * This is needed because marked's lexer HTML-encodes some characters.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * Yjs formatting attributes for rich text
 */
export interface YjsTextAttributes {
  bold?: true;
  italic?: true;
  link?: { href: string };
  underline?: true;
  strikethrough?: true;
  code?: true;
}

/**
 * Represents a segment of text with optional formatting attributes
 */
export interface FormattedSegment {
  /** The text content */
  text: string;
  /** Formatting attributes (e.g., bold, italic, link) */
  attributes?: YjsTextAttributes;
}

/**
 * Block types supported by Sunsama's editor
 */
export type BlockType =
  | 'paragraph'
  | 'blockquote'
  | 'horizontalRule'
  | 'codeBlock'
  | 'bulletList'
  | 'orderedList';

/**
 * Represents a list item in a bullet or ordered list
 */
export interface ListItem {
  /** Content segments for the list item */
  segments: FormattedSegment[];
}

/**
 * Represents a block-level element in the document
 */
export interface DocumentBlock {
  /** The type of block */
  type: BlockType;
  /** Content segments (for paragraph, codeBlock) */
  segments?: FormattedSegment[];
  /** Nested blocks (for blockquote) */
  children?: DocumentBlock[];
  /** List items (for bulletList, orderedList) */
  items?: ListItem[];
  /** Start number for ordered lists */
  start?: number;
}

/**
 * Configuration options for HTML to Markdown conversion
 */
export interface HtmlToMarkdownOptions {
  /** Whether to preserve HTML tags that don't have Markdown equivalents */
  preserveHtml?: boolean;
  /** Whether to use GitHub Flavored Markdown features */
  gfm?: boolean;
  /** Custom rules for specific HTML elements */
  customRules?: Record<string, unknown>;
  /** Whether to keep links as-is or convert to reference style */
  linkStyle?: 'inlined' | 'referenced';
  /** Whether to preserve line breaks from HTML */
  br?: string;
}

/**
 * Configuration options for Markdown to HTML conversion
 */
export interface MarkdownToHtmlOptions {
  /** Whether to sanitize HTML output for security */
  sanitize?: boolean;
  /** Whether to enable GitHub Flavored Markdown features */
  gfm?: boolean;
  /** Whether to break on single line breaks */
  breaks?: boolean;
  /** Custom renderer options */
  renderer?: unknown;
}

/**
 * Combined options for bidirectional conversion
 */
export interface ConversionOptions {
  htmlToMarkdown?: HtmlToMarkdownOptions;
  markdownToHtml?: MarkdownToHtmlOptions;
}

/**
 * Validation schema for HTML input
 */
const htmlInputSchema = z.string().trim().min(1, 'HTML content cannot be empty');

/**
 * Validation schema for Markdown input
 */
const markdownInputSchema = z.string().trim().min(1, 'Markdown content cannot be empty');

/**
 * Default configuration for Turndown (HTML → Markdown)
 */
const defaultTurndownOptions: HtmlToMarkdownOptions = {
  preserveHtml: false,
  gfm: true,
  linkStyle: 'inlined',
  br: '\n',
};

/**
 * Default configuration for Marked (Markdown → HTML)
 */
const defaultMarkedOptions: MarkdownToHtmlOptions = {
  sanitize: true,
  gfm: true,
  breaks: true,
};

/**
 * Initialize Turndown service with configuration
 */
function createTurndownService(options: HtmlToMarkdownOptions = {}): TurndownService {
  const config = { ...defaultTurndownOptions, ...options };
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: config.linkStyle as 'inlined' | 'referenced',
    linkReferenceStyle: 'full',
    br: config.br,
  });

  // Add GitHub Flavored Markdown support
  if (config.gfm) {
    // Support for strikethrough
    turndownService.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: function (content) {
        return '~~' + content + '~~';
      },
    });

    // Support for task lists
    turndownService.addRule('taskListItems', {
      filter: function (node: Node) {
        return (
          node.nodeName === 'LI' &&
          (node as Element).querySelector &&
          (node as Element).querySelector('input[type="checkbox"]') !== null
        );
      },
      replacement: function (content, node: Node) {
        const checkbox = (node as Element).querySelector
          ? (node as Element).querySelector('input[type="checkbox"]')
          : null;
        const isChecked = checkbox && (checkbox as HTMLInputElement).checked;
        return (isChecked ? '- [x] ' : '- [ ] ') + content;
      },
    });
  }

  // Apply custom rules if provided
  if (config.customRules) {
    Object.entries(config.customRules).forEach(([name, rule]) => {
      turndownService.addRule(name, rule as never);
    });
  }

  return turndownService;
}

/**
 * Initialize Marked with configuration
 */
function configureMarked(options: MarkdownToHtmlOptions = {}): void {
  const config = { ...defaultMarkedOptions, ...options };

  marked.setOptions({
    gfm: config.gfm,
    breaks: config.breaks,
    // Note: sanitize option is deprecated in newer versions of marked
    // We'll handle sanitization separately if needed
  });

  if (config.renderer) {
    marked.use({ renderer: config.renderer });
  }
}

/**
 * Converts HTML content to Markdown format
 *
 * @param html - The HTML content to convert
 * @param options - Configuration options for conversion
 * @returns The converted Markdown content
 * @throws SunsamaAuthError if input validation fails
 *
 * @example
 * ```typescript
 * const html = '<h1>Hello World</h1><p>This is <strong>bold</strong> text.</p>';
 * const markdown = htmlToMarkdown(html);
 * console.log(markdown); // "# Hello World\n\nThis is **bold** text."
 * ```
 */
export function htmlToMarkdown(html: string, options: HtmlToMarkdownOptions = {}): string {
  try {
    // Validate input
    htmlInputSchema.parse(html);

    // Create Turndown service with options
    const turndownService = createTurndownService(options);

    // Convert HTML to Markdown
    const markdown = turndownService.turndown(html);

    // Clean up the result (remove excessive whitespace)
    return markdown.trim().replace(/\n{3,}/g, '\n\n');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new SunsamaAuthError(`HTML to Markdown conversion failed: ${error.message}`);
    }
    throw new SunsamaAuthError(
      `HTML to Markdown conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Converts Markdown content to HTML format
 *
 * @param markdown - The Markdown content to convert
 * @param options - Configuration options for conversion
 * @returns The converted HTML content
 * @throws SunsamaAuthError if input validation fails
 *
 * @example
 * ```typescript
 * const markdown = '# Hello World\n\nThis is **bold** text.';
 * const html = markdownToHtml(markdown);
 * console.log(html); // "<h1>Hello World</h1>\n<p>This is <strong>bold</strong> text.</p>"
 * ```
 */
export function markdownToHtml(markdown: string, options: MarkdownToHtmlOptions = {}): string {
  try {
    // Validate input
    markdownInputSchema.parse(markdown);

    // Configure Marked with options
    configureMarked(options);

    // Convert Markdown to HTML
    const html = marked.parse(markdown);

    // Return the result (marked.parse returns a Promise<string> in some versions, but string in others)
    return typeof html === 'string' ? html : html.toString();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new SunsamaAuthError(`Markdown to HTML conversion failed: ${error.message}`);
    }
    throw new SunsamaAuthError(
      `Markdown to HTML conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * This is a basic implementation - consider using a dedicated library like DOMPurify for production
 *
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Basic HTML sanitization - remove script tags and dangerous attributes
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');

  // Clean up any extra spaces left behind after removing attributes
  sanitized = sanitized.replace(/\s+>/g, '>').replace(/<\s+/g, '<');

  return sanitized;
}

/**
 * Utility function to safely convert between HTML and Markdown with validation
 *
 * @param content - The content to convert
 * @param fromFormat - Source format ('html' or 'markdown')
 * @param toFormat - Target format ('html' or 'markdown')
 * @param options - Conversion options
 * @returns Converted content
 * @throws SunsamaAuthError if conversion fails or formats are invalid
 *
 * @example
 * ```typescript
 * const html = '<p>Hello <strong>world</strong></p>';
 * const markdown = convertContent(html, 'html', 'markdown');
 * console.log(markdown); // "Hello **world**"
 *
 * const convertedBack = convertContent(markdown, 'markdown', 'html');
 * console.log(convertedBack); // "<p>Hello <strong>world</strong></p>"
 * ```
 */
export function convertContent(
  content: string,
  fromFormat: 'html' | 'markdown',
  toFormat: 'html' | 'markdown',
  options: ConversionOptions = {}
): string {
  if (fromFormat === toFormat) {
    return content; // No conversion needed
  }

  if (fromFormat === 'html' && toFormat === 'markdown') {
    return htmlToMarkdown(content, options.htmlToMarkdown);
  }

  if (fromFormat === 'markdown' && toFormat === 'html') {
    const html = markdownToHtml(content, options.markdownToHtml);
    return options.markdownToHtml?.sanitize !== false ? sanitizeHtml(html) : html;
  }

  throw new SunsamaAuthError(`Invalid conversion format: ${fromFormat} to ${toFormat}`);
}

/**
 * Parses inline tokens from marked and converts them to formatted segments
 * with Yjs-compatible attributes
 *
 * @param tokens - Array of marked inline tokens
 * @param inheritedAttributes - Attributes inherited from parent elements
 * @returns Array of formatted segments with text and attributes
 * @internal
 */
function parseInlineTokens(
  tokens: Token[],
  inheritedAttributes: YjsTextAttributes = {}
): FormattedSegment[] {
  const segments: FormattedSegment[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const textToken = token as Tokens.Text;
        // Handle text tokens that may have nested tokens (from inline parsing)
        if ('tokens' in textToken && textToken.tokens && textToken.tokens.length > 0) {
          segments.push(...parseInlineTokens(textToken.tokens, inheritedAttributes));
        } else {
          const attrs =
            Object.keys(inheritedAttributes).length > 0 ? inheritedAttributes : undefined;
          segments.push({ text: decodeHtmlEntities(textToken.text), attributes: attrs });
        }
        break;
      }

      case 'strong': {
        const strongToken = token as Tokens.Strong;
        const newAttrs = { ...inheritedAttributes, bold: true as const };
        if ('tokens' in strongToken && strongToken.tokens && strongToken.tokens.length > 0) {
          segments.push(...parseInlineTokens(strongToken.tokens, newAttrs));
        } else {
          segments.push({ text: decodeHtmlEntities(strongToken.text), attributes: newAttrs });
        }
        break;
      }

      case 'em': {
        const emToken = token as Tokens.Em;
        const newAttrs = { ...inheritedAttributes, italic: true as const };
        if ('tokens' in emToken && emToken.tokens && emToken.tokens.length > 0) {
          segments.push(...parseInlineTokens(emToken.tokens, newAttrs));
        } else {
          segments.push({ text: decodeHtmlEntities(emToken.text), attributes: newAttrs });
        }
        break;
      }

      case 'link': {
        const linkToken = token as Tokens.Link;
        // Sunsama expects link as a nested object with href property
        const newAttrs = { ...inheritedAttributes, link: { href: linkToken.href } };
        if ('tokens' in linkToken && linkToken.tokens && linkToken.tokens.length > 0) {
          segments.push(...parseInlineTokens(linkToken.tokens, newAttrs));
        } else {
          segments.push({ text: decodeHtmlEntities(linkToken.text), attributes: newAttrs });
        }
        break;
      }

      case 'codespan': {
        const codeToken = token as Tokens.Codespan;
        const newAttrs = { ...inheritedAttributes, code: true as const };
        segments.push({ text: decodeHtmlEntities(codeToken.text), attributes: newAttrs });
        break;
      }

      case 'del': {
        // Note: Sunsama's editor doesn't support strikethrough marks
        // So we render it as plain text with ~~ delimiters preserved
        const delToken = token as Tokens.Del;
        if ('tokens' in delToken && delToken.tokens && delToken.tokens.length > 0) {
          segments.push({ text: '~~' });
          segments.push(...parseInlineTokens(delToken.tokens, inheritedAttributes));
          segments.push({ text: '~~' });
        } else {
          segments.push({
            text: `~~${decodeHtmlEntities(delToken.text)}~~`,
            attributes: inheritedAttributes,
          });
        }
        break;
      }

      case 'br': {
        segments.push({ text: '\n' });
        break;
      }

      case 'escape': {
        const escapeToken = token as Tokens.Escape;
        const attrs = Object.keys(inheritedAttributes).length > 0 ? inheritedAttributes : undefined;
        segments.push({ text: decodeHtmlEntities(escapeToken.text), attributes: attrs });
        break;
      }

      default: {
        // For any other token types, try to extract text
        if ('text' in token && typeof (token as { text?: string }).text === 'string') {
          const attrs =
            Object.keys(inheritedAttributes).length > 0 ? inheritedAttributes : undefined;
          segments.push({
            text: decodeHtmlEntities((token as { text: string }).text),
            attributes: attrs,
          });
        } else if ('raw' in token && typeof (token as { raw?: string }).raw === 'string') {
          const attrs =
            Object.keys(inheritedAttributes).length > 0 ? inheritedAttributes : undefined;
          segments.push({ text: (token as { raw: string }).raw, attributes: attrs });
        }
        break;
      }
    }
  }

  return segments;
}

/**
 * Parses markdown content into formatted segments suitable for Yjs XmlText insertion.
 *
 * This function converts markdown text into an array of segments, where each segment
 * contains the text content and optional formatting attributes (bold, italic, link, etc.).
 * The segments can be used to insert rich text into a Yjs document with proper formatting.
 *
 * @param markdown - The markdown content to parse
 * @returns Array of formatted segments with text and Yjs-compatible attributes
 *
 * @example
 * ```typescript
 * const segments = parseMarkdownToSegments('This is **bold** and *italic* text');
 * // Returns:
 * // [
 * //   { text: 'This is ' },
 * //   { text: 'bold', attributes: { bold: true } },
 * //   { text: ' and ' },
 * //   { text: 'italic', attributes: { italic: true } },
 * //   { text: ' text' }
 * // ]
 *
 * const linkSegments = parseMarkdownToSegments('Visit [Google](https://google.com)');
 * // Returns:
 * // [
 * //   { text: 'Visit ' },
 * //   { text: 'Google', attributes: { link: 'https://google.com' } }
 * // ]
 * ```
 */
export function parseMarkdownToSegments(markdown: string): FormattedSegment[] {
  if (!markdown || markdown.trim() === '') {
    return [];
  }

  const segments: FormattedSegment[] = [];

  // Configure marked for GFM (GitHub Flavored Markdown) support
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Tokenize the markdown
  const tokens = marked.lexer(markdown);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;

    switch (token.type) {
      case 'paragraph': {
        const paragraphToken = token as Tokens.Paragraph;
        if (paragraphToken.tokens) {
          segments.push(...parseInlineTokens(paragraphToken.tokens));
        }
        // Add newline after paragraph if not the last token
        if (i < tokens.length - 1) {
          segments.push({ text: '\n' });
        }
        break;
      }

      case 'heading': {
        const headingToken = token as Tokens.Heading;
        if (headingToken.tokens) {
          // Apply bold formatting to headings
          segments.push(...parseInlineTokens(headingToken.tokens, { bold: true }));
        }
        segments.push({ text: '\n' });
        break;
      }

      case 'list': {
        const listToken = token as Tokens.List;
        for (let j = 0; j < listToken.items.length; j++) {
          const item = listToken.items[j]!;
          // Add list marker
          const marker = listToken.ordered ? `${j + 1}. ` : '• ';
          segments.push({ text: marker });

          if (item.tokens) {
            // Process list item content
            for (const itemToken of item.tokens) {
              if (
                itemToken.type === 'text' &&
                'tokens' in itemToken &&
                (itemToken as Tokens.Text).tokens
              ) {
                segments.push(...parseInlineTokens((itemToken as Tokens.Text).tokens!));
              } else if ('tokens' in itemToken && (itemToken as { tokens?: Token[] }).tokens) {
                segments.push(...parseInlineTokens((itemToken as { tokens: Token[] }).tokens));
              } else if ('text' in itemToken) {
                segments.push({ text: decodeHtmlEntities((itemToken as { text: string }).text) });
              }
            }
          }
          segments.push({ text: '\n' });
        }
        break;
      }

      case 'code': {
        const codeToken = token as Tokens.Code;
        segments.push({ text: decodeHtmlEntities(codeToken.text), attributes: { code: true } });
        segments.push({ text: '\n' });
        break;
      }

      case 'blockquote': {
        const blockquoteToken = token as Tokens.Blockquote;
        if (blockquoteToken.tokens) {
          for (const innerToken of blockquoteToken.tokens) {
            if (innerToken.type === 'paragraph' && 'tokens' in innerToken) {
              segments.push({ text: '> ' });
              segments.push(...parseInlineTokens((innerToken as Tokens.Paragraph).tokens!));
              segments.push({ text: '\n' });
            }
          }
        }
        break;
      }

      case 'hr': {
        segments.push({ text: '---\n' });
        break;
      }

      case 'space': {
        segments.push({ text: '\n' });
        break;
      }

      case 'text': {
        const textToken = token as Tokens.Text;
        if ('tokens' in textToken && textToken.tokens) {
          segments.push(...parseInlineTokens(textToken.tokens));
        } else {
          segments.push({ text: decodeHtmlEntities(textToken.text) });
        }
        break;
      }

      default: {
        // Handle any other token types by extracting raw text
        if ('raw' in token && typeof (token as { raw?: string }).raw === 'string') {
          segments.push({ text: decodeHtmlEntities((token as { raw: string }).raw) });
        }
        break;
      }
    }
  }

  // Merge adjacent segments with the same attributes for efficiency
  return mergeAdjacentSegments(segments);
}

/**
 * Merges adjacent segments that have the same attributes
 * @param segments - Array of formatted segments
 * @returns Merged array of segments
 * @internal
 */
function mergeAdjacentSegments(segments: FormattedSegment[]): FormattedSegment[] {
  if (segments.length === 0) return [];

  const merged: FormattedSegment[] = [];
  let current = segments[0]!;

  for (let i = 1; i < segments.length; i++) {
    const next = segments[i]!;

    // Check if attributes are the same (or both undefined/empty)
    const currentAttrs = current.attributes || {};
    const nextAttrs = next.attributes || {};
    const attrsEqual = JSON.stringify(currentAttrs) === JSON.stringify(nextAttrs);

    if (attrsEqual) {
      // Merge the text
      current = {
        text: current.text + next.text,
        attributes: Object.keys(currentAttrs).length > 0 ? currentAttrs : undefined,
      };
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Parses markdown content into a document structure with block-level elements.
 *
 * This function converts markdown text into an array of document blocks, where each block
 * represents a block-level element (paragraph, blockquote, horizontal rule, etc.).
 * This structure is suitable for creating proper Yjs XmlElement hierarchies that match
 * Sunsama's rich text editor format.
 *
 * @param markdown - The markdown content to parse
 * @returns Array of document blocks representing the document structure
 *
 * @example
 * ```typescript
 * const blocks = parseMarkdownToBlocks('Hello **world**\n\n> A quote\n\n---');
 * // Returns:
 * // [
 * //   { type: 'paragraph', segments: [{ text: 'Hello ' }, { text: 'world', attributes: { bold: true } }] },
 * //   { type: 'blockquote', children: [{ type: 'paragraph', segments: [{ text: 'A quote' }] }] },
 * //   { type: 'horizontalRule' }
 * // ]
 * ```
 */
export function parseMarkdownToBlocks(markdown: string): DocumentBlock[] {
  if (!markdown || markdown.trim() === '') {
    return [];
  }

  const blocks: DocumentBlock[] = [];

  // Configure marked for GFM support
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Tokenize the markdown
  const tokens = marked.lexer(markdown);

  for (const token of tokens) {
    switch (token.type) {
      case 'paragraph': {
        const paragraphToken = token as Tokens.Paragraph;
        if (paragraphToken.tokens) {
          const segments = parseInlineTokens(paragraphToken.tokens);
          if (segments.length > 0) {
            blocks.push({ type: 'paragraph', segments: mergeAdjacentSegments(segments) });
          }
        }
        break;
      }

      case 'heading': {
        // Convert headings to bold paragraphs (Sunsama may not support native headings)
        const headingToken = token as Tokens.Heading;
        if (headingToken.tokens) {
          const segments = parseInlineTokens(headingToken.tokens, { bold: true });
          if (segments.length > 0) {
            blocks.push({ type: 'paragraph', segments: mergeAdjacentSegments(segments) });
          }
        }
        break;
      }

      case 'blockquote': {
        const blockquoteToken = token as Tokens.Blockquote;
        const children: DocumentBlock[] = [];

        if (blockquoteToken.tokens) {
          for (const innerToken of blockquoteToken.tokens) {
            if (innerToken.type === 'paragraph' && 'tokens' in innerToken) {
              const segments = parseInlineTokens((innerToken as Tokens.Paragraph).tokens!);
              if (segments.length > 0) {
                children.push({ type: 'paragraph', segments: mergeAdjacentSegments(segments) });
              }
            }
          }
        }

        if (children.length > 0) {
          blocks.push({ type: 'blockquote', children });
        }
        break;
      }

      case 'hr': {
        blocks.push({ type: 'horizontalRule' });
        break;
      }

      case 'code': {
        const codeToken = token as Tokens.Code;
        blocks.push({
          type: 'codeBlock',
          segments: [{ text: decodeHtmlEntities(codeToken.text) }],
        });
        break;
      }

      case 'list': {
        // Create proper list structure with listItem elements
        const listToken = token as Tokens.List;
        const items: ListItem[] = [];

        for (const item of listToken.items) {
          const segments: FormattedSegment[] = [];

          if (item.tokens) {
            for (const itemToken of item.tokens) {
              if (
                itemToken.type === 'text' &&
                'tokens' in itemToken &&
                (itemToken as Tokens.Text).tokens
              ) {
                segments.push(...parseInlineTokens((itemToken as Tokens.Text).tokens!));
              } else if ('tokens' in itemToken && (itemToken as { tokens?: Token[] }).tokens) {
                segments.push(...parseInlineTokens((itemToken as { tokens: Token[] }).tokens));
              } else if ('text' in itemToken) {
                segments.push({ text: decodeHtmlEntities((itemToken as { text: string }).text) });
              }
            }
          }

          if (segments.length > 0) {
            items.push({ segments: mergeAdjacentSegments(segments) });
          }
        }

        if (items.length > 0) {
          blocks.push({
            type: listToken.ordered ? 'orderedList' : 'bulletList',
            items,
            start:
              listToken.ordered && typeof listToken.start === 'number'
                ? listToken.start
                : undefined,
          });
        }
        break;
      }

      case 'space': {
        // Skip pure space tokens - they're handled by paragraph breaks
        break;
      }

      case 'text': {
        const textToken = token as Tokens.Text;
        const segments: FormattedSegment[] = [];
        if ('tokens' in textToken && textToken.tokens) {
          segments.push(...parseInlineTokens(textToken.tokens));
        } else {
          segments.push({ text: decodeHtmlEntities(textToken.text) });
        }
        if (segments.length > 0) {
          blocks.push({ type: 'paragraph', segments: mergeAdjacentSegments(segments) });
        }
        break;
      }

      default: {
        // Handle any other token types by extracting raw text
        if ('raw' in token && typeof (token as { raw?: string }).raw === 'string') {
          const raw = (token as { raw: string }).raw.trim();
          if (raw) {
            blocks.push({ type: 'paragraph', segments: [{ text: raw }] });
          }
        }
        break;
      }
    }
  }

  return blocks;
}
