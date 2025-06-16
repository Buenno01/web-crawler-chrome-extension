export default class DataExtractionService {
  constructor(pathFilters, cssSelectors) {
    this.pathFilters = pathFilters;
    this.cssSelectors = cssSelectors;
    this.visitedUrls = new Set();
    this.pendingUrls = new Set();
    this.shouldCancel = false;
  }

  matchesFilter(url) {
    if (this.pathFilters.length === 0) return true;
    
    try {
      const urlObj = new URL(url);
      return this.pathFilters.some(filter => 
        urlObj.pathname.includes(filter) || urlObj.href.includes(filter)
      );
    } catch {
      return false;
    }
  }

  async getCurrentTabInfo() {
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

  async extractFromTab(tabId) {
    try {
      // Execute the main data extraction script
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: (customSelectors) => {
          function getHeadingStructure() {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            return Array.from(headings).map((heading) => ({
              tag: heading.tagName.toLowerCase(),
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
                      const text = el.textContent.trim();
                      if (text && text.length > 0) {
                        return {
                          text,
                          html: el.innerHTML.trim()
                        };
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

          return {
            url: window.location.href,
            title: document.querySelector('title')?.textContent || '',
            description: document.querySelector('meta[name="description"]')?.content || '',
            headings: getHeadingStructure(),
            links: getSubLinks(window.location.href),
            customSelectors: getCustomSelectorContent(customSelectors)
          };
        },
        args: [this.cssSelectors]
      });

      return results[0]?.result;
    } catch (error) {
      console.error('Error extracting data:', error);
      throw error;
    }
  }

  async processUrl(url, results, onProgress) {
    if (this.shouldCancel || this.visitedUrls.has(url)) {
      return;
    }

    if (!this.matchesFilter(url)) {
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

      // Extract data
      const pageData = await this.extractFromTab(tab.id);
      
      // Close the tab
      await chrome.tabs.remove(tab.id);

      if (pageData) {
        results[url] = pageData;
        this.visitedUrls.add(url);

        // Add new unvisited links to pending
        pageData.links.forEach(link => {
          if (!this.visitedUrls.has(link) && !this.pendingUrls.has(link) && this.matchesFilter(link)) {
            this.pendingUrls.add(link);
          }
        });

        // Update progress
        onProgress({
          processed: this.visitedUrls.size,
          pending: this.pendingUrls.size,
          total: this.visitedUrls.size + this.pendingUrls.size,
          currentUrl: url
        });
      }
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }

  async startExtraction(onProgress) {
    try {
      const tabInfo = await this.getCurrentTabInfo();
      if (!tabInfo) {
        throw new Error('No active tab found');
      }

      // Reset state
      this.shouldCancel = false;
      this.visitedUrls.clear();
      this.pendingUrls.clear();

      const results = {};
      
      // Start with the current page
      const initialData = await this.extractFromTab(tabInfo.tabId);
      if (!initialData) {
        throw new Error('Failed to extract data from current tab');
      }

      results[initialData.url] = initialData;
      this.visitedUrls.add(initialData.url);

      // Add initial links to pending (apply filter)
      initialData.links.forEach(link => {
        if (this.matchesFilter(link)) {
          this.pendingUrls.add(link);
        }
      });

      // Update initial progress
      onProgress({
        processed: 1,
        pending: this.pendingUrls.size,
        total: this.pendingUrls.size + 1,
        currentUrl: initialData.url
      });

      // Process all pending URLs
      while (this.pendingUrls.size > 0 && !this.shouldCancel) {
        const currentUrl = this.pendingUrls.values().next().value;
        this.pendingUrls.delete(currentUrl);
        await this.processUrl(currentUrl, results, onProgress);
      }

      return results;
    } catch (error) {
      console.error('Error during extraction:', error);
      throw error;
    }
  }
} 