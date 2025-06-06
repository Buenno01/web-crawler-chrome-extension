// Global state for crawling
let isCrawling = false;
let shouldCancel = false;
let visitedUrls = new Set();
let pendingUrls = new Set();
let totalProcessed = 0;
let extractedData = null; // Store raw data for format conversion
let currentFormat = 'summary'; // Track current format
let pathFilters = new Set(); // Store active filters
let cssSelectors = new Set(); // Store active CSS selectors

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

async function saveFiltersAndSelectors() {
  await chrome.storage.local.set({
    'pathFilters': Array.from(pathFilters),
    'cssSelectors': Array.from(cssSelectors)
  });
}

async function loadFiltersAndSelectors() {
  const result = await chrome.storage.local.get(['pathFilters', 'cssSelectors']);
  if (result.pathFilters) {
    pathFilters = new Set(result.pathFilters);
    updateFilterDisplay();
  }
  if (result.cssSelectors) {
    cssSelectors = new Set(result.cssSelectors);
    updateSelectorDisplay();
  }
}

async function clearStoredData() {
  await chrome.storage.local.remove(['extractedData', 'currentFormat']);
}

// Function to toggle filter controls
function toggleFilterControls(disabled) {
  const filterSection = document.getElementById('filterSection');
  const pathInput = document.getElementById('pathInput');
  const addFilterButton = document.getElementById('addFilterButton');
  const clearFiltersButton = document.getElementById('clearFiltersButton');
  const removeButtons = filterSection.querySelectorAll('.remove-btn');
  const filterTags = filterSection.querySelectorAll('.filter-tag');

  // Disable/enable all filter controls
  pathInput.disabled = disabled;
  addFilterButton.disabled = disabled;
  clearFiltersButton.disabled = disabled;
  removeButtons.forEach(btn => btn.disabled = disabled);

  // Add visual feedback
  filterSection.classList.toggle('disabled', disabled);
  filterTags.forEach(tag => tag.classList.toggle('disabled', disabled));
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
  const filterInfo = pathFilters.size > 0 ? ` | Filtering by: ${Array.from(pathFilters).join(', ')}` : '';
  progressInfo.textContent = `Processed: ${totalProcessed} pages | Pending: ${pendingUrls.size} pages${filterInfo}`;
}

function showCopySuccess() {
  const successMessage = document.getElementById('copySuccess');
  successMessage.classList.add('show');
  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 2000);
}

// Filter management functions
function addPathFilter(path) {
  path = path.trim().toLowerCase();
  if (path && !pathFilters.has(path)) {
    pathFilters.add(path);
    updateFilterDisplay();
    saveFiltersAndSelectors(); // Save changes
    return true;
  }
  return false;
}

function removePathFilter(path) {
  pathFilters.delete(path);
  updateFilterDisplay();
  saveFiltersAndSelectors(); // Save changes
}

function clearAllFilters() {
  pathFilters.clear();
  updateFilterDisplay();
  saveFiltersAndSelectors(); // Save changes
}

function updateFilterDisplay() {
  const container = document.getElementById('activeFilters');
  const clearBtn = document.getElementById('clearFiltersButton');
  
  container.innerHTML = '';
  
  pathFilters.forEach(filter => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag tag';
    
    // Create text node for the filter
    const filterText = document.createTextNode(filter);
    tag.appendChild(filterText);
    
    // Create and setup remove button
    const button = document.createElement('button');
    button.className = 'remove-btn';
    button.innerHTML = '&times;';
    button.onclick = () => removePathFilter(filter);
    
    // Append button to tag
    tag.appendChild(button);
    container.appendChild(tag);
  });
  
  clearBtn.style.display = pathFilters.size > 0 ? 'block' : 'none';
}

function matchesFilter(url) {
  if (pathFilters.size === 0) return true;
  const lowerUrl = url.toLowerCase();
  return Array.from(pathFilters).some(filter => lowerUrl.includes(filter));
}

// CSS Selector management functions
function addCssSelector(selector) {
  selector = selector.trim();
  if (selector && !cssSelectors.has(selector)) {
    cssSelectors.add(selector);
    updateSelectorDisplay();
    saveFiltersAndSelectors(); // Save changes
    return true;
  }
  return false;
}

function removeCssSelector(selector) {
  cssSelectors.delete(selector);
  updateSelectorDisplay();
  saveFiltersAndSelectors(); // Save changes
}

function clearAllSelectors() {
  cssSelectors.clear();
  updateSelectorDisplay();
  saveFiltersAndSelectors(); // Save changes
}

function updateSelectorDisplay() {
  const container = document.getElementById('activeSelectors');
  const clearBtn = document.getElementById('clearSelectorsButton');
  
  container.innerHTML = '';
  
  cssSelectors.forEach(selector => {
    const tag = document.createElement('div');
    tag.className = 'selector-tag tag';
    
    const selectorText = document.createTextNode(selector);
    tag.appendChild(selectorText);
    
    const button = document.createElement('button');
    button.className = 'remove-btn';
    button.innerHTML = '&times;';
    button.onclick = () => removeCssSelector(selector);
    
    tag.appendChild(button);
    container.appendChild(tag);
  });
  
  clearBtn.style.display = cssSelectors.size > 0 ? 'block' : 'none';
}

function toggleSelectorControls(disabled) {
  const selectorSection = document.getElementById('selectorSection');
  const selectorInput = document.getElementById('selectorInput');
  const addSelectorButton = document.getElementById('addSelectorButton');
  const clearSelectorsButton = document.getElementById('clearSelectorsButton');
  const removeButtons = selectorSection.querySelectorAll('.remove-btn');
  const selectorTags = selectorSection.querySelectorAll('.selector-tag');

  // Disable/enable all selector controls
  selectorInput.disabled = disabled;
  addSelectorButton.disabled = disabled;
  clearSelectorsButton.disabled = disabled;
  removeButtons.forEach(btn => btn.disabled = disabled);

  // Add visual feedback
  selectorSection.classList.toggle('disabled', disabled);
  selectorTags.forEach(tag => tag.classList.toggle('disabled', disabled));
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

        // NEW: Function to extract custom selector content
        function getCustomSelectorContent(selectors) {
          const customData = {};
          
          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                // Store all matching elements' text content
                const elementsContents = Array.from(elements)
                  .map((el) => {
                    // Use our markdown formatter
                    const markdown = window.formatToMarkdown(el);
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
        const customSelectorsContent = getCustomSelectorContent(customSelectors); // NEW

        return {
          url: currentUrl,
          title,
          description,
          headings,
          links,
          customSelectors: customSelectorsContent // NEW: Add custom selector results
        };
      },
      args: [Array.from(cssSelectors)] // Pass the selectors as argument
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
  if (!matchesFilter(url)) {
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
        if (!visitedUrls.has(link) && !pendingUrls.has(link) && matchesFilter(link)) {
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

    // Disable filter and selector controls
    toggleFilterControls(true);
    toggleSelectorControls(true);

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
      if (matchesFilter(link)) {
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
    // Re-enable filter and selector controls on error
    toggleFilterControls(false);
    toggleSelectorControls(false);
    throw error;
  }
}

// Storage management functions
async function clearAllStorage() {
  await chrome.storage.local.clear();
  
  // Reset in-memory state
  extractedData = null;
  currentFormat = 'summary';
  pathFilters.clear();
  cssSelectors.clear();
  
  // Reset UI
  updateFilterDisplay();
  updateSelectorDisplay();
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
  const pathInput = document.getElementById('pathInput');
  const addFilterButton = document.getElementById('addFilterButton');
  const clearFiltersButton = document.getElementById('clearFiltersButton');
  const output = document.querySelector('output');
  const progressInfo = document.getElementById('progressInfo');
  
  if (!extractButton || !cancelButton) {
    console.error('Required buttons not found!');
    return;
  }

  // Load saved data
  await loadFiltersAndSelectors();
  
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

  // Path input handling
  pathInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addFilterButton.click();
    }
  });

  // Add filter button handling
  addFilterButton.addEventListener('click', () => {
    const path = pathInput.value.trim();
    if (addPathFilter(path)) {
      pathInput.value = '';
      saveFiltersAndSelectors(); // Save after adding filter
    }
  });

  // Clear filters button handling
  clearFiltersButton.addEventListener('click', () => {
    clearAllFilters();
    saveFiltersAndSelectors(); // Save after clearing filters
  });

  // CSS Selector input handling
  const selectorInput = document.getElementById('selectorInput');
  const addSelectorButton = document.getElementById('addSelectorButton');
  const clearSelectorsButton = document.getElementById('clearSelectorsButton');

  selectorInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addSelectorButton.click();
    }
  });

  // Add selector button handling
  addSelectorButton.addEventListener('click', () => {
    const selector = selectorInput.value.trim();
    if (addCssSelector(selector)) {
      selectorInput.value = '';
      saveFiltersAndSelectors(); // Save after adding selector
    }
  });

  // Clear selectors button handling
  clearSelectorsButton.addEventListener('click', () => {
    clearAllSelectors();
    saveFiltersAndSelectors(); // Save after clearing selectors
  });

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
      '• All crawled website data\n' +
      '• Your saved filters and selectors\n' +
      '• Format preferences\n\n' +
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
      
      // Disable filter and selector controls
      toggleFilterControls(true);
      toggleSelectorControls(true);
      
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
      
      // Re-enable filter and selector controls
      toggleFilterControls(false);
      toggleSelectorControls(false);
    }
  });
});

console.log('Data extraction script loaded.');