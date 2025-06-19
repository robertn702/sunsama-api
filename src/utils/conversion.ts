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

import { marked } from 'marked';
import TurndownService from 'turndown';
import { z } from 'zod';
import { SunsamaAuthError } from '../errors/index.js';

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
