export default class DataExtractionService {
  constructor(pathFilters, cssSelectors, options = {}) {
    this.pathFilters = pathFilters;
    this.cssSelectors = cssSelectors;
    this.visitedUrls = new Set();
    this.pendingUrls = new Set();
    this.shouldCancel = false;

    this.options = {
      maxConcurrent: options.maxConcurrent || 3,
      timeout: options.timeout || 30000,
      delay: options.delay || 1000,
      respectRobotsTxt: options.respectRobotsTxt || false,
      ...options
    };
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
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: (customSelectors) => {
          function getHeadingStructure() {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            return Array.from(headings).map((heading, index) => ({
              tag: heading.tagName.toLowerCase(),
              text: heading.textContent.trim(),
              isEmpty: !heading.textContent.trim(),
              position: index + 1
            }));
          }

          function getSubLinks(baseUrl) {
            try {
              const baseUrlObj = new URL(baseUrl);
              const links = Array.from(document.querySelectorAll('a'))
                .map(link => {
                  try {
                    const href = link.href;
                    const url = new URL(href);
                    
                    return {
                      href: url.href,
                      text: link.textContent.trim(),
                      isBroken: null,
                      isInternal: url.hostname === baseUrlObj.hostname,
                      hasNofollow: link.rel.includes('nofollow')
                    };
                  } catch {
                    return null;
                  }
                })
                .filter(link => link !== null);
              
              return links;
            } catch (error) {
              console.error('Error in getSubLinks:', error);
              return [];
            }
          }

          function getMetaInfo() {
            const metas = {};

            metas.title = document.querySelector('title')?.textContent || '';
            metas.description = document.querySelector('meta[name="description"]')?.content || '';
            metas.keywords = document.querySelector('meta[name="keywords"]')?.content || '';

            metas.ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
            metas.ogDescription = document.querySelector('meta[property="og:description"]')?.content || '';
            metas.ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
            metas.ogUrl = document.querySelector('meta[property="og:url"]')?.content || '';

            metas.twitterCard = document.querySelector('meta[name="twitter:card"]')?.content || '';
            metas.twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content || '';
            metas.twitterDescription = document.querySelector('meta[name="twitter:description"]')?.content || '';

            metas.canonical = document.querySelector('link[rel="canonical"]')?.href || '';

            metas.robots = document.querySelector('meta[name="robots"]')?.content || '';

            metas.viewport = document.querySelector('meta[name="viewport"]')?.content || '';
            
            return metas;
          }

          function getImageInfo() {
            const images = Array.from(document.querySelectorAll('img'));
            return images.map((img, index) => ({
              src: img.src,
              alt: img.alt || '',
              hasAlt: !!img.alt,
              width: img.naturalWidth || 0,
              height: img.naturalHeight || 0,
              loading: img.loading || 'auto',
              position: index + 1
            }));
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

          function getSEOIssues() {
            const issues = [];

            const title = document.querySelector('title')?.textContent || '';
            if (!title) issues.push({ type: 'error', message: 'Título ausente' });
            else if (title.length < 30) issues.push({ type: 'warning', message: 'Título muito curto (< 30 caracteres)' });
            else if (title.length > 60) issues.push({ type: 'warning', message: 'Título muito longo (> 60 caracteres)' });

            const description = document.querySelector('meta[name="description"]')?.content || '';
            if (!description) issues.push({ type: 'error', message: 'Meta description ausente' });
            else if (description.length < 120) issues.push({ type: 'warning', message: 'Meta description muito curta (< 120 caracteres)' });
            else if (description.length > 160) issues.push({ type: 'warning', message: 'Meta description muito longa (> 160 caracteres)' });

            const h1s = document.querySelectorAll('h1');
            if (h1s.length === 0) issues.push({ type: 'error', message: 'Nenhum H1 encontrado' });
            else if (h1s.length > 1) issues.push({ type: 'warning', message: `Múltiplos H1 encontrados (${h1s.length})` });

            const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt]), img[alt=""]'));
            if (imagesWithoutAlt.length > 0) {
              issues.push({ 
                type: 'warning', 
                message: `${imagesWithoutAlt.length} imagem(ns) sem atributo alt` 
              });
            }
            
            return issues;
          }

          const baseUrl = window.location.href;
          const links = getSubLinks(baseUrl);

          return {
            url: baseUrl,
            meta: getMetaInfo(),
            headings: getHeadingStructure(),
            links: links,
            internalLinks: links.filter(l => l.isInternal).map(l => l.href),
            externalLinks: links.filter(l => !l.isInternal),
            images: getImageInfo(),
            customSelectors: getCustomSelectorContent(customSelectors),
            seoIssues: getSEOIssues(),
            wordCount: document.body.textContent.trim().split(/\s+/).length,
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
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

  async createBackgroundTab(url) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url, active: false }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const timeout = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.remove(tab.id).catch(() => {});
          reject(new Error('Tab load timeout'));
        }, this.options.timeout);

        const listener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            clearTimeout(timeout);
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(tab);
          }
        };
        
        chrome.tabs.onUpdated.addListener(listener);
      });
    });
  }

  async processUrl(url, results, onProgress) {
    if (this.shouldCancel || this.visitedUrls.has(url)) {
      return;
    }

    if (!this.matchesFilter(url)) {
      return;
    }

    let tab = null;
    
    try {
      if (this.options.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.delay));
      }

      tab = await this.createBackgroundTab(url);
      const pageData = await this.extractFromTab(tab.id);

      if (pageData) {
        results[url] = pageData;
        this.visitedUrls.add(url);

        pageData.internalLinks.forEach(link => {
          if (!this.visitedUrls.has(link) && !this.pendingUrls.has(link) && this.matchesFilter(link)) {
            this.pendingUrls.add(link);
          }
        });

        onProgress({
          processed: this.visitedUrls.size,
          pending: this.pendingUrls.size,
          total: this.visitedUrls.size + this.pendingUrls.size,
          currentUrl: url,
          status: 'success'
        });
      }
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      
      onProgress({
        processed: this.visitedUrls.size,
        pending: this.pendingUrls.size,
        total: this.visitedUrls.size + this.pendingUrls.size,
        currentUrl: url,
        status: 'error',
        error: error.message
      });
    } finally {
      if (tab) {
        try {
          await chrome.tabs.remove(tab.id);
        } catch (e) {
          // Tab já foi fechada
        }
      }
    }
  }

  async startExtraction(onProgress) {
    try {
      const tabInfo = await this.getCurrentTabInfo();
      if (!tabInfo) {
        throw new Error('No active tab found');
      }

      this.shouldCancel = false;
      this.visitedUrls.clear();
      this.pendingUrls.clear();

      const results = {};

      const initialData = await this.extractFromTab(tabInfo.tabId);
      if (!initialData) {
        throw new Error('Failed to extract data from current tab');
      }

      results[initialData.url] = initialData;
      this.visitedUrls.add(initialData.url);

      initialData.internalLinks.forEach(link => {
        if (this.matchesFilter(link)) {
          this.pendingUrls.add(link);
        }
      });

      onProgress({
        processed: 1,
        pending: this.pendingUrls.size,
        total: this.pendingUrls.size + 1,
        currentUrl: initialData.url,
        status: 'success'
      });

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

  cancel() {
    this.shouldCancel = true;
  }
}
