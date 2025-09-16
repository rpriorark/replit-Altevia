// Convert simple text to safe HTML with comprehensive XSS protection
export function renderTextSafe(text: string): string {
  // Input validation
  if (typeof text !== 'string') {
    return '';
  }
  
  // Limit text length to prevent DoS
  if (text.length > 10000) {
    text = text.substring(0, 10000) + '...';
  }
  
  // Comprehensive HTML entity escaping to prevent XSS
  const escapedText = text
    .replace(/&/g, '&amp;')           // Must be first to avoid double-escaping
    .replace(/</g, '&lt;')            // Prevent opening tags
    .replace(/>/g, '&gt;')            // Prevent closing tags
    .replace(/"/g, '&quot;')          // Prevent attribute injection
    .replace(/'/g, '&#x27;')          // Prevent single quote attribute injection
    .replace(/\//g, '&#x2F;')         // Prevent forward slash issues
    .replace(/`/g, '&#x60;')          // Prevent backtick issues
    .replace(/=/g, '&#x3D;')          // Prevent equals sign in attributes
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim();                          // Remove leading/trailing whitespace
  
  // Apply basic Markdown-like formatting only on completely escaped text
  // Use more specific regex patterns to prevent injection
  return escapedText
    .replace(/^# (.{1,100})$/gim, '<h1>$1</h1>')      // Limit heading length
    .replace(/^## (.{1,100})$/gim, '<h2>$1</h2>')     // Limit heading length
    .replace(/^### (.{1,100})$/gim, '<h3>$1</h3>')    // Limit heading length
    .replace(/\n/g, '<br>');
}

// Alternative function for when you need to preserve some HTML (use with extreme caution)
export function renderTextWithLimitedHTML(text: string, allowedTags: string[] = ['b', 'i', 'strong', 'em']): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  // First escape everything
  let escaped = renderTextSafe(text);
  
  // Then selectively unescape only allowed tags
  allowedTags.forEach(tag => {
    const openTag = new RegExp(`&lt;${tag}&gt;`, 'gi');
    const closeTag = new RegExp(`&lt;&#x2F;${tag}&gt;`, 'gi');
    escaped = escaped
      .replace(openTag, `<${tag}>`)
      .replace(closeTag, `</${tag}>`);
  });
  
  return escaped;
}