import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "strong", "em", "u", "s", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "img",
  "blockquote", "code", "pre",
  "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "width", "height",
  "class",
];

/**
 * Sanitize HTML content, stripping scripts, event handlers, and unsafe tags.
 * Works in both Server Components and Client Components (isomorphic).
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
  });
}
