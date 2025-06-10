class MarkdownFormatter {
  static defaultOptions = {
    preserveWhitespace: false,
    includeHtml: true,
    customTagHandlers: {}
  };

  static format(element, options = {}) {
    if (!element) return null;
    
    const effectiveOptions = {
      ...this.defaultOptions,
      ...options
    };
    
    const result = {
      text: '',
      html: effectiveOptions.includeHtml ? element.outerHTML : null
    };
    
    result.text = this._convertElement(element, effectiveOptions);
    return result.text ? result : null;
  }

  static _convertElement(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Check for custom handler first
    if (options.customTagHandlers[tagName]) {
      return options.customTagHandlers[tagName](element);
    }
    
    switch (tagName) {
      case 'h1': return `# ${this._getTextContent(element, options)}\n\n`;
      case 'h2': return `## ${this._getTextContent(element, options)}\n\n`;
      case 'h3': return `### ${this._getTextContent(element, options)}\n\n`;
      case 'h4': return `#### ${this._getTextContent(element, options)}\n\n`;
      case 'h5': return `##### ${this._getTextContent(element, options)}\n\n`;
      case 'h6': return `###### ${this._getTextContent(element, options)}\n\n`;
      
      case 'p': return `${this._processInlineElements(element, options)}\n\n`;
      
      case 'a': 
        const href = element.getAttribute('href');
        const text = this._getTextContent(element, options);
        return href ? `[${text}](${href})` : text;
      
      case 'strong': 
      case 'b': return `**${this._getTextContent(element, options)}**`;
      
      case 'em': 
      case 'i': return `*${this._getTextContent(element, options)}*`;
      
      case 'code': return `\`${this._getTextContent(element, options)}\``;
      
      case 'pre': 
        const codeBlock = element.querySelector('code');
        const content = codeBlock ? this._getTextContent(codeBlock, options) : this._getTextContent(element, options);
        return `\`\`\`\n${content}\n\`\`\`\n\n`;
      
      case 'blockquote': return `> ${this._processInlineElements(element, options)}\n\n`;
      
      case 'ul': return this._processUnorderedList(element, options);
      case 'ol': return this._processOrderedList(element, options);
      case 'li': return this._getTextContent(element, options);
      
      case 'br': return '\n';
      case 'hr': return '---\n\n';
      
      case 'img':
        const src = element.getAttribute('src');
        const alt = element.getAttribute('alt') || '';
        return src ? `![${alt}](${src})` : '';
      
      case 'table': return this._processTable(element, options);
      
      default:
        return this._processInlineElements(element, options);
    }
  }

  static _getTextContent(element, options) {
    if (options.preserveWhitespace) {
      return element.textContent;
    }
    return element.textContent.replace(/\s+/g, ' ').trim();
  }

  static _processInlineElements(element, options) {
    let result = '';
    
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        result += this._convertElement(node, options);
      }
    }
    
    return options.preserveWhitespace ? result : result.replace(/\s+/g, ' ').trim();
  }

  static _processUnorderedList(ul, options) {
    let result = '';
    const items = ul.querySelectorAll(':scope > li');
    
    items.forEach(li => {
      result += `- ${this._processInlineElements(li, options)}\n`;
    });
    
    return result + '\n';
  }

  static _processOrderedList(ol, options) {
    let result = '';
    const items = ol.querySelectorAll(':scope > li');
    
    items.forEach((li, index) => {
      result += `${index + 1}. ${this._processInlineElements(li, options)}\n`;
    });
    
    return result + '\n';
  }

  static _processTable(table, options) {
    let result = '';
    const rows = table.querySelectorAll('tr');
    
    if (rows.length === 0) return '';
    
    // Process header row
    const headerRow = rows[0];
    const headerCells = headerRow.querySelectorAll('th, td');
    const headerTexts = Array.from(headerCells).map(cell => this._getTextContent(cell, options));
    
    result += '| ' + headerTexts.join(' | ') + ' |\n';
    result += '|' + headerTexts.map(() => '---').join('|') + '|\n';
    
    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td, th');
      const cellTexts = Array.from(cells).map(cell => this._getTextContent(cell, options));
      result += '| ' + cellTexts.join(' | ') + ' |\n';
    }
    
    return result + '\n';
  }
}

// Make the class available in both module and window contexts
window.MarkdownFormatter = MarkdownFormatter;