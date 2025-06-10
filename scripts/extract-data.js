import PathFilters from './path-filters.js';
import CustomSelectors from './custom-selectors.js';

let isCrawling = false;
let shouldCancel = false;
let visitedUrls = new Set();
let pendingUrls = new Set();
let totalProcessed = 0;
let extractedData = null; // Store raw data for format conversion
let currentFormat = 'summary'; // Track current format
let pathFilters = new PathFilters(); // Store active filters
let cssSelectorController = new CustomSelectors(); // Store active CSS selectors

// Storage helper functions
async function saveExtractedData(data) {
  await chrome.storage.local.set({ 'extractedData': data });
}

async function loadExtractedData() {
  const result = await chrome.storage.local.get(['extractedData']);
  return result.extractedData || null;
}

async function saveCurrentFormat(format) {
  await chrome.storage.local.set({ 'currentFormat': format });
}

async function loadCurrentFormat() {
  const result = await chrome.storage.local.get(['currentFormat']);
  return result.currentFormat || 'summary';
}

async function clearStoredData() {
  await chrome.storage.local.remove(['extractedData', 'currentFormat']);
}

function changeOutput(text) {
  const output = document.querySelector('output');
  output.textContent = text;
}

// Format conversion functions
function formatAsSummary(data) {
  const summary = {
    totalPages: Object.keys(data).length,
    totalHeadings: Object.values(data).reduce((sum, page) => sum + page.headings.length, 0),
    totalInternalLinks: Object.values(data).reduce((sum, page) => sum + page.links.length, 0),
    pages: Object.entries(data).map(([url, pageData]) => ({
      url,
      title: pageData.title,
      headingsCount: pageData.headings.length,
      internalLinksCount: pageData.links.length,
      customSelectors: pageData.customSelectors
    }))
  };
  
  return JSON.stringify(summary, null, 2);
}

// Helper function to sanitize text for CSV
function sanitizeForCSV(text) {
  if (!text) return '';
  // Replace line breaks and carriage returns with a space
  text = text.replace(/[\n\r]+/g, ' ');
  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, ' ');
  // Trim whitespace
  text = text.trim();
  // Escape quotes by doubling them
  text = text.replace(/"/g, '""');
  return `"${text}"`;
}

function formatAsHeadingsCSV(data) {
  let csv = 'page,index,headingTag,headingLevel,content\n';
  Object.entries(data).forEach(([url, pageData]) => {
    let index = 0;
    pageData.headings.forEach(heading => {
      index++;
      const level = heading.tag.substring(1); // Extract number from h1, h2, etc.
      const escapedContent = sanitizeForCSV(heading.text);
      const escapedUrl = sanitizeForCSV(url);
      csv += `${escapedUrl},${index},${heading.tag},${level},${escapedContent}\n`;
    });
  });
  
  return csv;
}

function formatAsMetaCSV(data) {
  let csv = 'page,title,description\n';
  
  Object.entries(data).forEach(([url, pageData]) => {
    const escapedUrl = sanitizeForCSV(url);
    const escapedTitle = sanitizeForCSV(pageData.title);
    const escapedDescription = sanitizeForCSV(pageData.description);
    csv += `${escapedUrl},${escapedTitle},${escapedDescription}\n`;
  });
  
  return csv;
}

function formatAsLinksCSV(data) {
  let csv = 'page,link\n';
  
  Object.entries(data).forEach(([url, pageData]) => {
    pageData.links.forEach(link => {
      const escapedUrl = sanitizeForCSV(url);
      const escapedLink = sanitizeForCSV(link);
      csv += `${escapedUrl},${escapedLink}\n`;
    });
  });
  
  return csv;
}

function formatAsSelectorsCSV(data) {
  let csv = 'page,selector,instance,html_content,markdown_content\n';
  
  Object.entries(data).forEach(([url, pageData]) => {
    // Check if page has custom selectors data
    if (pageData.customSelectors && Object.keys(pageData.customSelectors).length > 0) {
      Object.entries(pageData.customSelectors).forEach(([selector, elements]) => {
        // Skip if there's an error with this selector
        if (elements.error) {
          const escapedUrl = sanitizeForCSV(url);
          const escapedSelector = sanitizeForCSV(selector);
          const errorMsg = sanitizeForCSV(`Error: ${elements.error}`);
          csv += `${escapedUrl},${escapedSelector},0,${errorMsg},${errorMsg}\n`;
          return;
        }
        
        // Process each element instance
        elements.forEach((element, index) => {
          const escapedUrl = sanitizeForCSV(url);
          const escapedSelector = sanitizeForCSV(selector);
          const instance = index + 1; // 1-based indexing
          const escapedHtml = sanitizeForCSV(element.html || '');
          const escapedMarkdown = sanitizeForCSV(element.text || '');
          
          csv += `${escapedUrl},${escapedSelector},${instance},${escapedHtml},${escapedMarkdown}\n`;
        });
      });
    }
  });
  
  return csv;
}

// Download functionality
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function generateFileName() {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  
  // Extract domain from first URL in extracted data
  let domain = 'website';
  if (extractedData && Object.keys(extractedData).length > 0) {
    try {
      const firstUrl = Object.keys(extractedData)[0];
      domain = new URL(firstUrl).hostname.replace(/^www\./, '');
    } catch (e) {
      domain = 'website';
    }
  }
  
  const formatName = currentFormat === 'summary' ? 'summary' : currentFormat;
  return `${domain}-${formatName}-${timestamp}.csv`;
}

function isCSVFormat() {
  return ['headings', 'meta', 'links', 'selectors'].includes(currentFormat);
}

function updateDownloadButtonVisibility() {
  const downloadButton = document.getElementById('downloadButton');
  if (downloadButton) {
    downloadButton.style.display = isCSVFormat() && extractedData ? 'block' : 'none';
  }
}

function updateOutput() {
  if (!extractedData) return;
  
  let formattedOutput;
  switch (currentFormat) {
    case 'headings':
      formattedOutput = formatAsHeadingsCSV(extractedData);
      break;
    case 'meta':
      formattedOutput = formatAsMetaCSV(extractedData);
      break;
    case 'links':
      formattedOutput = formatAsLinksCSV(extractedData);
      break;
    case 'selectors':
      formattedOutput = formatAsSelectorsCSV(extractedData);
      break;
    case 'summary':
    default:
      formattedOutput = formatAsSummary(extractedData);
      break;
  }
  
  changeOutput(formattedOutput);
  updateDownloadButtonVisibility();
}

function updateProgress() {
  const progressInfo = document.getElementById('progressInfo');
  const filterInfo = pathFilters.size > 0 ? ` | Filtering by: ${Array.from(pathFilters.value).join(', ')}` : '';
  progressInfo.textContent = `Processed: ${totalProcessed} pages | Pending: ${pendingUrls.size} pages${filterInfo}`;
}

function showCopySuccess() {
  const successMessage = document.getElementById('copySuccess');
  successMessage.classList.add('show');
  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 2000);
}

async function getCurrentTabInfo() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        resolve({
          url: tabs[0].url,
          tabId: tabs[0].id
        });
      }
    });
  });
}

async function extractDataFromTab(tabId) {
  try {
    // First inject the markdown formatter script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['scripts/markdown-formatter.js']
    });

    // Then execute the main data extraction script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (customSelectors) => {

        function getHeadingStructure() {
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          return Array.from(headings).map((heading) => ({
            tag: heading.tagName,
            text: heading.textContent.trim(),
          }));
        }

        function getSubLinks(baseUrl) {
          try {
            const baseUrlObj = new URL(baseUrl);
            const links = Array.from(document.querySelectorAll('a'))
              .map(link => {
                try {
                  return new URL(link.href).href;
                } catch {
                  try {
                    return new URL(link.href, baseUrl).href;
                  } catch {
                    return null;
                  }
                }
              })
              .filter(href => {
                if (!href) return false;
                try {
                  const url = new URL(href);
                  return url.hostname === baseUrlObj.hostname;
                } catch {
                  return false;
                }
              });
            
            return [...new Set(links)]; // Remove duplicates
          } catch (error) {
            console.error('Error in getSubLinks:', error);
            return [];
          }
        }

        function getCustomSelectorContent(selectors) {
          const customData = {};
          
          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                const elementsContents = Array.from(elements)
                  .map((el) => {
                    const markdown = window.MarkdownFormatter.format(el);
                    if (markdown && markdown.text && markdown.text.length > 0) {
                      return markdown;
                    }
                    return null;
                  })
                  .filter(content => content !== null);
                
                if (elementsContents.length > 0) {
                  customData[selector] = elementsContents;
                }
              }
            } catch (error) {
              console.error(`Error with selector "${selector}":`, error);
              customData[selector] = { error: error.message };
            }
          });
          
          return customData;
        }

        const currentUrl = window.location.href;
        const title = document.querySelector('title')?.textContent || '';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const headings = getHeadingStructure();
        const links = getSubLinks(currentUrl);
        const customSelectorsContent = getCustomSelectorContent(customSelectors);

        return {
          url: currentUrl,
          title,
          description,
          headings,
          links,
          customSelectors: customSelectorsContent
        };
      },
      args: [Array.from(cssSelectorController.value)]
    });

    return results[0]?.result;
  } catch (error) {
    console.error('Error extracting data:', error);
    throw error;
  }
}

async function processUrl(url, results) {
  if (shouldCancel || visitedUrls.has(url)) {
    return;
  }

  // Apply path filter
  if (!pathFilters.matchesFilter(url)) {
    return;
  }

  try {
    // Create a new tab
    const tab = await chrome.tabs.create({ url: url, active: false });
    
    // Wait for the tab to load
    await new Promise(resolve => {
      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    const baseURL = url.replace(/.*?:\/\//, '').split('/')[0];
    const pathName = url.replace(baseURL, '').replace(/.*?:\/\//, '');

    // Extract data
    changeOutput(`Extracting data from ${pathName}...`);
    const pageData = await extractDataFromTab(tab.id);
    
    // Close the tab
    await chrome.tabs.remove(tab.id);

    if (pageData) {
      results[url] = pageData;
      visitedUrls.add(url);
      totalProcessed++;
      updateProgress();

      // Add new unvisited links to pending
      pageData.links.forEach(link => {
        if (!visitedUrls.has(link) && !pendingUrls.has(link) && pathFilters.matchesFilter(link)) {
          pendingUrls.add(link);
        }
      });
    }
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
  }
}

async function startExtraction() {
  try {
    const tabInfo = await getCurrentTabInfo();
    if (!tabInfo) {
      throw new Error('No active tab found');
    }

    // Reset state
    shouldCancel = false;
    visitedUrls.clear();
    pendingUrls.clear();
    totalProcessed = 0;
    isCrawling = true;
    extractedData = null;

    // Clear stored data when starting new extraction
    await clearStoredData();

    const results = {};
    
    // Start with the current page
    const initialData = await extractDataFromTab(tabInfo.tabId);
    if (!initialData) {
      throw new Error('Failed to extract data from current tab');
    }

    results[initialData.url] = initialData;
    visitedUrls.add(initialData.url);
    totalProcessed++;

    // Add initial links to pending (apply filter)
    initialData.links.forEach(link => {
      if (pathFilters.matchesFilter(link)) {
        pendingUrls.add(link);
      }
    });
    updateProgress();

    // Process all pending URLs
    while (pendingUrls.size > 0 && !shouldCancel) {
      const currentUrl = pendingUrls.values().next().value;
      pendingUrls.delete(currentUrl);
      await processUrl(currentUrl, results);
      updateProgress();
    }

    isCrawling = false;
    extractedData = results;
    
    // Save the extracted data
    await saveExtractedData(extractedData);
    
    return results;
  } catch (error) {
    isCrawling = false;
    console.error('Error during extraction:', error);

    throw error;
  }
}

// Storage management functions
async function clearAllStorage() {
  await chrome.storage.local.clear();
  
  // Reset in-memory state
  extractedData = null;
  currentFormat = 'summary';
  pathFilters.clearFilters();
  cssSelectorController.clearSelectors();
  
  // Reset UI
  updateDownloadButtonVisibility();
  
  // Hide format section and reset format buttons
  document.getElementById('formatSection').style.display = 'none';
  document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('[data-format="summary"]').classList.add('active');
  
  changeOutput('Storage cleared. Ready to extract data');
}

async function getStorageSize() {
  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytes) => {
      resolve(bytes);
    });
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function updateStorageStatus() {
  const storageStatus = document.getElementById('storageStatus');
  try {
    const size = await getStorageSize();
    storageStatus.textContent = `Current storage usage: ${formatBytes(size)}`;
    storageStatus.className = 'storage-status info';
  } catch (error) {
    storageStatus.textContent = 'Unable to calculate storage size';
    storageStatus.className = 'storage-status';
  }
}

function showClearSuccess() {
  const storageStatus = document.getElementById('storageStatus');
  storageStatus.textContent = 'All stored data has been cleared!';
  storageStatus.className = 'storage-status success';
  
  setTimeout(() => {
    updateStorageStatus();
  }, 3000);
}

// DOM event handling
document.addEventListener('DOMContentLoaded', async function() {
  const extractButton = document.getElementById('extractButton');
  const cancelButton = document.getElementById('cancelButton');
  const copyButton = document.getElementById('copyButton');
  const formatSection = document.getElementById('formatSection');
  const formatButtons = document.querySelectorAll('.format-btn');

  const output = document.querySelector('output');
  const progressInfo = document.getElementById('progressInfo');
  
  if (!extractButton || !cancelButton) {
    console.error('Required buttons not found!');
    return;
  }
  
  const savedData = await loadExtractedData();
  if (savedData) {
    extractedData = savedData;
    
    // Load saved format
    currentFormat = await loadCurrentFormat();
    
    // Update UI to reflect loaded data
    formatSection.style.display = 'block';
    formatButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-format="${currentFormat}"]`).classList.add('active');
    
    updateOutput();
    changeOutput('Data loaded from previous session');
  } else {
    changeOutput('Ready to extract data');
  }

  // Format button functionality
  formatButtons.forEach(button => {
    button.addEventListener('click', async () => {
      formatButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFormat = button.dataset.format;
      await saveCurrentFormat(currentFormat);
      updateOutput();
      updateDownloadButtonVisibility();
    });
  });
  
  // Copy button functionality
  copyButton.addEventListener('click', async () => {
    try {
      const textToCopy = output.textContent;
      await navigator.clipboard.writeText(textToCopy);
      showCopySuccess();
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  });

  // Download button functionality
  const downloadButton = document.getElementById('downloadButton');
  downloadButton.addEventListener('click', () => {
    if (!extractedData || !isCSVFormat()) {
      return;
    }
    
    const content = output.textContent;
    const filename = generateFileName();
    downloadCSV(content, filename);
  });

  // Cancel button functionality
  cancelButton.addEventListener('click', () => {
    if (isCrawling) {
      shouldCancel = true;
      cancelButton.textContent = 'Canceling...';
      cancelButton.disabled = true;
    }
  });

  // Storage management
  const clearStorageButton = document.getElementById('clearStorageButton');
  clearStorageButton.addEventListener('click', () => {
    const confirmed = confirm(
      'Are you sure you want to clear all stored data?\n\n' +
      'This will permanently delete:\n' +
      '- All crawled website data\n' +
      '- Your saved filters and selectors\n' +
      '- Format preferences\n\n' +
      'This action cannot be undone.'
    );
    
    if (confirmed) {
      clearAllStorage().then(() => {
        showClearSuccess();
      }).catch((error) => {
        console.error('Error clearing storage:', error);
        const storageStatus = document.getElementById('storageStatus');
        storageStatus.textContent = 'Error clearing storage. Please try again.';
        storageStatus.className = 'storage-status';
      });
    }
  });

  // Update storage status on load
  updateStorageStatus();

  extractButton.addEventListener('click', async function(event) {
    event.preventDefault();
    
    try {
      // Update UI for extraction start
      changeOutput('Starting extraction...');
      extractButton.disabled = true;
      cancelButton.style.display = 'block';
      cancelButton.disabled = false;
      progressInfo.style.display = 'block';
      formatSection.style.display = 'none';
      
      const data = await startExtraction();
      console.log('Extracted Data:', data);
      
      // Show format section and update output
      formatSection.style.display = 'block';
      currentFormat = 'summary';
      
      // Reset format buttons
      formatButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelector('[data-format="summary"]').classList.add('active');
      
      updateOutput();
      
    } catch (error) {
      console.error('Error during data extraction:', error);
      changeOutput(`Error: ${error.message}`);
    } finally {
      // Reset UI
      extractButton.disabled = false;
      cancelButton.style.display = 'none';
      cancelButton.textContent = 'Cancel Extraction';
      cancelButton.disabled = false;
      progressInfo.style.display = 'none';
      isCrawling = false;
      shouldCancel = false;

    }
  });
});

console.log('Data extraction script loaded.');