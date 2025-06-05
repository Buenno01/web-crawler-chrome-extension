/**
 * Converts HTML elements to Markdown format
 * @param {HTMLElement} element - The HTML element to convert
 * @returns {Object|null} Object containing markdown text and metadata, or null if empty
 */
function formatToMarkdown(element) {
  if (!element) return null;
  
  const result = {
    text: '',
    html: element.outerHTML
  };
  
  result.text = convertElementToMarkdown(element);
  return result.text ? result : null;
}

/**
 * Main conversion logic for HTML elements to Markdown
 * @param {HTMLElement} element - The element to convert
 * @returns {string} Markdown formatted text
 */
function convertElementToMarkdown(element) {
  const tagName = element.tagName.toLowerCase();
  
  switch (tagName) {
    case 'h1': return `# ${getTextContent(element)}\n\n`;
    case 'h2': return `## ${getTextContent(element)}\n\n`;
    case 'h3': return `### ${getTextContent(element)}\n\n`;
    case 'h4': return `#### ${getTextContent(element)}\n\n`;
    case 'h5': return `##### ${getTextContent(element)}\n\n`;
    case 'h6': return `###### ${getTextContent(element)}\n\n`;
    
    case 'p': return `${processInlineElements(element)}\n\n`;
    
    case 'a': 
      const href = element.getAttribute('href');
      const text = getTextContent(element);
      return href ? `[${text}](${href})` : text;
    
    case 'strong': 
    case 'b': return `**${getTextContent(element)}**`;
    
    case 'em': 
    case 'i': return `*${getTextContent(element)}*`;
    
    case 'code': return `\`${getTextContent(element)}\``;
    
    case 'pre': 
      const codeBlock = element.querySelector('code');
      const content = codeBlock ? getTextContent(codeBlock) : getTextContent(element);
      return `\`\`\`\n${content}\n\`\`\`\n\n`;
    
    case 'blockquote': return `> ${processInlineElements(element)}\n\n`;
    
    case 'ul': return processUnorderedList(element);
    case 'ol': return processOrderedList(element);
    case 'li': return getTextContent(element);
    
    case 'br': return '\n';
    case 'hr': return '---\n\n';
    
    case 'img':
      const src = element.getAttribute('src');
      const alt = element.getAttribute('alt') || '';
      return src ? `![${alt}](${src})` : '';
    
    case 'table': return processTable(element);
    
    default:
      return processInlineElements(element);
  }
}

/**
 * Gets cleaned text content from an element
 * @param {HTMLElement} element - The element to get text from
 * @returns {string} Cleaned text content
 */
function getTextContent(element) {
  return element.textContent.replace(/\s+/g, ' ').trim();
}

/**
 * Processes inline elements while preserving their markdown formatting
 * @param {HTMLElement} element - The element containing inline elements
 * @returns {string} Processed markdown text
 */
function processInlineElements(element) {
  let result = '';
  
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      result += convertElementToMarkdown(node);
    }
  }
  
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Processes unordered lists
 * @param {HTMLElement} ul - The unordered list element
 * @returns {string} Markdown formatted list
 */
function processUnorderedList(ul) {
  let result = '';
  const items = ul.querySelectorAll(':scope > li');
  
  items.forEach(li => {
    result += `- ${processInlineElements(li)}\n`;
  });
  
  return result + '\n';
}

/**
 * Processes ordered lists
 * @param {HTMLElement} ol - The ordered list element
 * @returns {string} Markdown formatted list
 */
function processOrderedList(ol) {
  let result = '';
  const items = ol.querySelectorAll(':scope > li');
  
  items.forEach((li, index) => {
    result += `${index + 1}. ${processInlineElements(li)}\n`;
  });
  
  return result + '\n';
}

/**
 * Processes tables
 * @param {HTMLElement} table - The table element
 * @returns {string} Markdown formatted table
 */
function processTable(table) {
  let result = '';
  const rows = table.querySelectorAll('tr');
  
  if (rows.length === 0) return '';
  
  // Process header row
  const headerRow = rows[0];
  const headerCells = headerRow.querySelectorAll('th, td');
  const headerTexts = Array.from(headerCells).map(cell => getTextContent(cell));
  
  result += '| ' + headerTexts.join(' | ') + ' |\n';
  result += '|' + headerTexts.map(() => '---').join('|') + '|\n';
  
  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    const cellTexts = Array.from(cells).map(cell => getTextContent(cell));
    result += '| ' + cellTexts.join(' | ') + ' |\n';
  }
  
  return result + '\n';
}

// Export the main function
window.formatToMarkdown = formatToMarkdown; 