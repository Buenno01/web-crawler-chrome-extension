export default class SummaryAnalyticsService {
  constructor(extractedData) {
    this.data = extractedData || {};
    this.pages = Object.values(this.data);
    this.urls = Object.keys(this.data);
  }

  // Overview Statistics
  getOverviewStats() {
    return {
      totalPages: this.pages.length,
      totalUrls: this.urls.length,
      successfulExtractions: this.pages.filter(page => page.title !== undefined).length,
      failedExtractions: this.urls.length - this.pages.filter(page => page.title !== undefined).length,
      successRate: this.pages.length > 0 ? 
        Math.round((this.pages.filter(page => page.title !== undefined).length / this.pages.length) * 100) : 0
    };
  }

  // Headings Analysis
  getHeadingsStats() {
    const allHeadings = this.pages.flatMap(page => page.headings || []);
    const headingCounts = {
      h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0
    };

    allHeadings.forEach(heading => {
      if (headingCounts.hasOwnProperty(heading.tag)) {
        headingCounts[heading.tag]++;
      }
    });

    const pagesWithoutH1 = this.pages.filter(page => 
      !page.headings || !page.headings.some(h => h.tag === 'h1')
    );

    const pagesWithMultipleH1 = this.pages.filter(page => 
      page.headings && page.headings.filter(h => h.tag === 'h1').length > 1
    );

    return {
      totalHeadings: allHeadings.length,
      averageHeadingsPerPage: this.pages.length > 0 ? 
        Math.round(allHeadings.length / this.pages.length * 10) / 10 : 0,
      headingDistribution: headingCounts,
      seoIssues: {
        pagesWithoutH1: pagesWithoutH1.length,
        pagesWithMultipleH1: pagesWithMultipleH1.length,
        pagesWithoutH1List: pagesWithoutH1.map(page => ({
          url: page.url,
          title: page.title || 'No title'
        })),
        pagesWithMultipleH1List: pagesWithMultipleH1.map(page => ({
          url: page.url,
          title: page.title || 'No title',
          h1Count: page.headings.filter(h => h.tag === 'h1').length
        }))
      }
    };
  }

  // Links Analysis
  getLinksStats() {
    const allLinks = this.pages.flatMap(page => page.links || []);
    const uniqueLinks = [...new Set(allLinks)];
    
    // Count how many times each link is referenced
    const linkCounts = {};
    allLinks.forEach(link => {
      linkCounts[link] = (linkCounts[link] || 0) + 1;
    });

    const mostLinkedPages = Object.entries(linkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));

    const pagesWithNoLinks = this.pages.filter(page => 
      !page.links || page.links.length === 0
    );

    return {
      totalLinksFound: allLinks.length,
      uniqueLinks: uniqueLinks.length,
      averageLinksPerPage: this.pages.length > 0 ? 
        Math.round(allLinks.length / this.pages.length * 10) / 10 : 0,
      mostLinkedPages,
      pagesWithNoLinks: pagesWithNoLinks.length,
      pagesWithNoLinksList: pagesWithNoLinks.map(page => ({
        url: page.url,
        title: page.title || 'No title'
      }))
    };
  }

  // Custom Selectors Analysis
  getCustomSelectorsStats() {
    if (this.pages.length === 0) {
      return {
        totalElements: 0,
        selectorBreakdown: {},
        successRate: 0,
        failedSelectors: []
      };
    }

    let totalElements = 0;
    const selectorBreakdown = {};
    const selectorSuccessCount = {};
    const selectorTotalCount = {};

    this.pages.forEach(page => {
      if (page.customSelectors) {
        Object.entries(page.customSelectors).forEach(([selector, elements]) => {
          selectorTotalCount[selector] = (selectorTotalCount[selector] || 0) + 1;
          
          if (elements.error) {
            // Selector failed on this page
            return;
          }
          
          if (Array.isArray(elements) && elements.length > 0) {
            selectorSuccessCount[selector] = (selectorSuccessCount[selector] || 0) + 1;
            totalElements += elements.length;
            selectorBreakdown[selector] = (selectorBreakdown[selector] || 0) + elements.length;
          }
        });
      }
    });

    const failedSelectors = Object.keys(selectorTotalCount).filter(selector => 
      !selectorSuccessCount[selector] || selectorSuccessCount[selector] === 0
    );

    const selectorSuccessRates = {};
    Object.keys(selectorTotalCount).forEach(selector => {
      const successCount = selectorSuccessCount[selector] || 0;
      const totalCount = selectorTotalCount[selector];
      selectorSuccessRates[selector] = Math.round((successCount / totalCount) * 100);
    });

    return {
      totalElements,
      selectorBreakdown,
      selectorSuccessRates,
      failedSelectors,
      averageElementsPerPage: this.pages.length > 0 ? 
        Math.round(totalElements / this.pages.length * 10) / 10 : 0
    };
  }

  // Page Metadata Analysis
  getMetadataStats() {
    const pagesWithoutTitle = this.pages.filter(page => !page.title || page.title.trim() === '');
    const pagesWithoutDescription = this.pages.filter(page => !page.description || page.description.trim() === '');
    
    const titleLengths = this.pages
      .filter(page => page.title && page.title.trim() !== '')
      .map(page => page.title.length);
    
    const descriptionLengths = this.pages
      .filter(page => page.description && page.description.trim() !== '')
      .map(page => page.description.length);

    const averageTitleLength = titleLengths.length > 0 ? 
      Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length) : 0;
    
    const averageDescriptionLength = descriptionLengths.length > 0 ? 
      Math.round(descriptionLengths.reduce((a, b) => a + b, 0) / descriptionLengths.length) : 0;

    return {
      pagesWithoutTitle: pagesWithoutTitle.length,
      pagesWithoutDescription: pagesWithoutDescription.length,
      averageTitleLength,
      averageDescriptionLength,
      pagesWithoutTitleList: pagesWithoutTitle.map(page => ({
        url: page.url
      })),
      pagesWithoutDescriptionList: pagesWithoutDescription.map(page => ({
        url: page.url,
        title: page.title || 'No title'
      }))
    };
  }

  // Generate Complete Summary
  generateSummary() {
    return {
      overview: this.getOverviewStats(),
      headings: this.getHeadingsStats(),
      links: this.getLinksStats(),
      customSelectors: this.getCustomSelectorsStats(),
      metadata: this.getMetadataStats(),
      generatedAt: new Date().toISOString()
    };
  }
} 