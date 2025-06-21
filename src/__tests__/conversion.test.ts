/**
 * Tests for HTML ↔ Markdown conversion utilities
 */

import { describe, it, expect } from 'vitest';
import {
  htmlToMarkdown,
  markdownToHtml,
  convertContent,
  sanitizeHtml,
} from '../utils/conversion.js';
import { SunsamaAuthError } from '../errors/index.js';

describe('HTML to Markdown Conversion', () => {
  it('should convert basic HTML to Markdown', () => {
    const html = '<h1>Hello World</h1><p>This is a <strong>test</strong>.</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('# Hello World\n\nThis is a **test**.');
  });

  it('should convert HTML with links to Markdown', () => {
    const html = '<p>Visit <a href="https://example.com">our website</a> for more info.</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Visit [our website](https://example.com) for more info.');
  });

  it('should convert HTML lists to Markdown', () => {
    const html = '<ul><li>First item</li><li>Second item</li></ul>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('- ');
    expect(result).toContain('First item');
    expect(result).toContain('Second item');
  });

  it('should convert HTML code blocks to Markdown', () => {
    const html = '<pre><code>console.log("hello");</code></pre>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('```\nconsole.log("hello");\n```');
  });

  it('should handle strikethrough with GFM enabled', () => {
    const html = '<p>This is <del>deleted</del> text.</p>';
    const result = htmlToMarkdown(html, { gfm: true });
    expect(result).toBe('This is ~~deleted~~ text.');
  });

  it('should preserve line breaks when configured', () => {
    const html = '<p>Line one<br>Line two</p>';
    const result = htmlToMarkdown(html, { br: '\n' });
    expect(result).toContain('\n');
  });

  it('should throw error for empty HTML input', () => {
    expect(() => htmlToMarkdown('')).toThrow(SunsamaAuthError);
    expect(() => htmlToMarkdown('   ')).toThrow(SunsamaAuthError);
    expect(() => htmlToMarkdown('\n\t  \n')).toThrow(SunsamaAuthError);
  });

  it('should handle complex nested HTML structures', () => {
    const html = `
      <div>
        <h2>Section Title</h2>
        <p>Paragraph with <em>italic</em> and <strong>bold</strong> text.</p>
        <blockquote>
          <p>This is a quote with <code>inline code</code>.</p>
        </blockquote>
      </div>
    `;
    const result = htmlToMarkdown(html);
    expect(result).toContain('## Section Title');
    expect(result).toContain('*italic*');
    expect(result).toContain('**bold**');
    expect(result).toContain('> This is a quote');
    expect(result).toContain('`inline code`');
  });
});

describe('Markdown to HTML Conversion', () => {
  it('should convert basic Markdown to HTML', () => {
    const markdown = '# Hello World\n\nThis is a **test**.';
    const result = markdownToHtml(markdown);
    expect(result).toContain('<h1>Hello World</h1>');
    expect(result).toContain('<strong>test</strong>');
  });

  it('should convert Markdown links to HTML', () => {
    const markdown = 'Visit [our website](https://example.com) for more info.';
    const result = markdownToHtml(markdown);
    expect(result).toContain('<a href="https://example.com">our website</a>');
  });

  it('should convert Markdown lists to HTML', () => {
    const markdown = '- First item\n- Second item';
    const result = markdownToHtml(markdown);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>First item</li>');
    expect(result).toContain('<li>Second item</li>');
  });

  it('should convert Markdown code blocks to HTML', () => {
    const markdown = '```javascript\nconsole.log("hello");\n```';
    const result = markdownToHtml(markdown);
    expect(result).toContain('<pre>');
    expect(result).toContain('<code');
  });

  it('should handle GitHub Flavored Markdown features', () => {
    const markdown = '~~strikethrough~~ and `inline code`';
    const result = markdownToHtml(markdown, { gfm: true });
    expect(result).toContain('<del>strikethrough</del>');
    expect(result).toContain('<code>inline code</code>');
  });

  it('should handle line breaks when configured', () => {
    const markdown = 'Line one\nLine two';
    const result = markdownToHtml(markdown, { breaks: true });
    expect(result).toContain('<br>');
  });

  it('should throw error for empty Markdown input', () => {
    expect(() => markdownToHtml('')).toThrow(SunsamaAuthError);
    expect(() => markdownToHtml('   ')).toThrow(SunsamaAuthError);
    expect(() => markdownToHtml('\n\t  \n')).toThrow(SunsamaAuthError);
  });

  it('should handle complex Markdown structures', () => {
    const markdown = `
## Section Title

Paragraph with *italic* and **bold** text.

> This is a quote with \`inline code\`.

1. First numbered item
2. Second numbered item

### Subsection

- [x] Completed task
- [ ] Pending task
    `;

    const result = markdownToHtml(markdown, { gfm: true });
    expect(result).toContain('<h2>Section Title</h2>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<blockquote>');
    expect(result).toContain('<ol>');
    expect(result).toContain('<h3>Subsection</h3>');
  });
});

describe('HTML Sanitization', () => {
  it('should remove script tags', () => {
    const html = '<p>Safe content</p><script>alert("xss")</script>';
    const result = sanitizeHtml(html);
    expect(result).toBe('<p>Safe content</p>');
  });

  it('should remove iframe tags', () => {
    const html = '<p>Content</p><iframe src="malicious.com"></iframe>';
    const result = sanitizeHtml(html);
    expect(result).toBe('<p>Content</p>');
  });

  it('should remove event handlers', () => {
    const html = '<div onclick="alert(\'xss\')">Click me</div>';
    const result = sanitizeHtml(html);
    expect(result).toBe('<div>Click me</div>');
    expect(result).not.toContain('onclick');
  });

  it('should remove javascript: urls', () => {
    const html = '<a href="javascript:alert(\'xss\')">Link</a>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('javascript:');
    expect(result).toContain('Link');
  });

  it('should handle empty or null input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve safe HTML content', () => {
    const html = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p>';
    const result = sanitizeHtml(html);
    expect(result).toBe(html);
  });
});

describe('Generic Content Conversion', () => {
  it('should convert HTML to Markdown using convertContent', () => {
    const html = '<h1>Title</h1><p>Content with <strong>bold</strong> text.</p>';
    const result = convertContent(html, 'html', 'markdown');
    expect(result).toBe('# Title\n\nContent with **bold** text.');
  });

  it('should convert Markdown to HTML using convertContent', () => {
    const markdown = '# Title\n\nContent with **bold** text.';
    const result = convertContent(markdown, 'markdown', 'html');
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('should return content unchanged when formats match', () => {
    const content = 'Hello world';
    expect(convertContent(content, 'html', 'html')).toBe(content);
    expect(convertContent(content, 'markdown', 'markdown')).toBe(content);
  });

  it('should throw error for invalid format combinations', () => {
    const content = 'test content';
    expect(() => convertContent(content, 'html' as never, 'invalid' as never)).toThrow(
      SunsamaAuthError
    );
    expect(() => convertContent(content, 'invalid' as never, 'html' as never)).toThrow(
      SunsamaAuthError
    );
  });

  it('should apply sanitization when converting to HTML', () => {
    const markdown = '[Link](javascript:alert("xss"))';
    const result = convertContent(markdown, 'markdown', 'html');
    expect(result).not.toContain('javascript:');
  });

  it('should respect conversion options', () => {
    const html = '<p>Text with <del>strikethrough</del></p>';
    const result = convertContent(html, 'html', 'markdown', {
      htmlToMarkdown: { gfm: true },
    });
    expect(result).toContain('~~strikethrough~~');
  });
});

describe('Bidirectional Conversion Consistency', () => {
  it('should maintain content integrity in round-trip conversion', () => {
    const originalMarkdown =
      '# Title\n\n**Bold** and *italic* text with [link](https://example.com).';

    // Convert to HTML and back to Markdown
    const html = markdownToHtml(originalMarkdown);
    const backToMarkdown = htmlToMarkdown(html);

    // Should contain the same semantic content
    expect(backToMarkdown).toContain('# Title');
    expect(backToMarkdown).toContain('**Bold**');
    expect(backToMarkdown).toContain('*italic*');
    expect(backToMarkdown).toContain('[link](https://example.com)');
  });

  it('should handle complex structures in round-trip conversion', () => {
    const originalMarkdown = `## Section

- First item
- Second item

> Quote with \`code\`

1. Numbered list
2. Another item`;

    const html = markdownToHtml(originalMarkdown, { gfm: true });
    const backToMarkdown = htmlToMarkdown(html, { gfm: true });

    expect(backToMarkdown).toContain('## Section');
    expect(backToMarkdown).toContain('First item');
    expect(backToMarkdown).toContain('> Quote');
    expect(backToMarkdown).toContain('Numbered list');
  });

  it('should preserve code blocks in round-trip conversion', () => {
    const originalMarkdown = '```javascript\nconst x = 42;\nconsole.log(x);\n```';

    const html = markdownToHtml(originalMarkdown);
    const backToMarkdown = htmlToMarkdown(html);

    expect(backToMarkdown).toContain('```');
    expect(backToMarkdown).toContain('const x = 42;');
    expect(backToMarkdown).toContain('console.log(x);');
  });
});

describe('Error Handling', () => {
  it('should provide meaningful error messages', () => {
    try {
      htmlToMarkdown('');
    } catch (error) {
      expect(error).toBeInstanceOf(SunsamaAuthError);
      expect((error as SunsamaAuthError).message).toContain('HTML to Markdown conversion failed');
    }

    try {
      markdownToHtml('');
    } catch (error) {
      expect(error).toBeInstanceOf(SunsamaAuthError);
      expect((error as SunsamaAuthError).message).toContain('Markdown to HTML conversion failed');
    }
  });

  it('should handle malformed HTML gracefully', () => {
    const malformedHtml = '<div><p>Unclosed tags<span>test';
    expect(() => htmlToMarkdown(malformedHtml)).not.toThrow();
  });

  it('should handle special characters and encoding', () => {
    const htmlWithSpecialChars = '<p>&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;</p>';
    const result = htmlToMarkdown(htmlWithSpecialChars);
    expect(result).toBe('<script>alert("test")</script>');
  });
});

describe('Performance and Edge Cases', () => {
  it('should handle large content efficiently', () => {
    // Generate large content
    const largeMarkdown = '# Title\n\n' + 'This is a paragraph. '.repeat(1000);

    const startTime = Date.now();
    const html = markdownToHtml(largeMarkdown);
    const backToMarkdown = htmlToMarkdown(html);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    expect(backToMarkdown).toContain('# Title');
  });

  it('should handle empty and whitespace-only content', () => {
    // These should throw because they are empty after trimming
    expect(() => htmlToMarkdown('\n\t  \n')).toThrow();
    expect(() => markdownToHtml('\n\t  \n')).toThrow();
  });

  it('should handle unicode and emoji content', () => {
    const unicodeContent = '# Hello 👋\n\nEmoji test: 🚀 🎉 💻';
    const html = markdownToHtml(unicodeContent);
    const backToMarkdown = htmlToMarkdown(html);

    expect(html).toContain('👋');
    expect(html).toContain('🚀');
    expect(backToMarkdown).toContain('👋');
    expect(backToMarkdown).toContain('🚀');
  });
});
