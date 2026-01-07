/**
 * @typedef {import('./types/extraction-types').ExtractionResults} ExtractionResults
 * @typedef {import('./types/extraction-types').PageData} PageData
 */

/**
 * @typedef {PageLink} - Representa o resumo sobre um dado link em uma página
 * @property {string} url - Url apontado pelo link
 * @property {string} title - Título da página que o link aponta (se houver)
 * @property {number} count - Número de ocorrencias do mesmo link
 */

/**
 * @typedef {LinksReport} - Representa o relatório gerado para os links analisados
 * @property {number} totalLinks - Representa o total de links encontrados incluindo parâmetros de url e links repetidos
 * @property {uniqueLinks} uniqueLinks - Representa o total de links únicos encontrados sem parâmetros de url
 * @property {number} averageLinksPerPage - Representa a média de links encontrados em cada página
 * @property {PageLink} mostLinkedPages - Representa um resumo dos links que mais aparecem nas páginas analisadas
 * @property {PageLink} pageLinks - Representa um resumo dos links que mais aparecem nas páginas analisadas
 */

/**
 * @typedef {SummaryReport}
 * @property {LinksReport} links - Relatório da análise de links
 */

/**
 * Serviço para análise e geração de relatórios a partir dos dados extraídos
 */
export default class SummaryAnalyticsService {
  /**
   * @param {ExtractionResults} extractedData - Dados extraídos do crawler
   */
  constructor(extractedData) {
    this.data = extractedData;
    this.pages = Object.entries(extractedData);
  }

  /**
   * Normaliza uma URL removendo query strings e fragmentos
   * @param {string} url - URL a ser normalizada
   * @returns {string} URL normalizada
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * Gera análise completa dos links
   * @returns {LinksReport} Análise de links
   */
  analyzeLinks() {
    const linkCounts = new Map();
    const pageLinks = new Map();
    let totalLinks = 0;

    // Conta todas as ocorrências de cada link
    this.pages.forEach(([pageUrl, pageData]) => {
      const linksInPage = pageData.links.length;
      totalLinks += linksInPage;
      pageLinks.set(pageUrl, linksInPage);

      pageData.links.forEach(link => {
        const normalizedUrl = this.normalizeUrl(link.href);
        linkCounts.set(normalizedUrl, (linkCounts.get(normalizedUrl) || 0) + 1);
      });
    });

    // Encontra as páginas mais linkadas
    const mostLinkedPages = Array.from(linkCounts.entries())
      .map(([url, count]) => {
        // Busca o título da página se ela foi crawleada
        const pageData = this.data[url];
        return {
          url: url,
          title: pageData?.meta?.title || 'Página não crawleada',
          count: count
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      uniqueLinks: linkCounts.size,
      totalLinks: totalLinks,
      averageLinksPerPage: Math.round(totalLinks / this.pages.length) || 0,
      mostLinkedPages: mostLinkedPages,
      pageLinks: Array.from(pageLinks.entries()).map(([url, count]) => ({
        url,
        title: this.data[url]?.meta?.title || url,
        count
      }))
    };
  }

  /**
   * Gera análise de headings
   * @returns {Object} Análise de headings
   */
  analyzeHeadings() {
    const headingCounts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    const pagesWithoutH1 = [];
    const pagesWithMultipleH1 = [];
    const emptyHeadings = [];

    this.pages.forEach(([pageUrl, pageData]) => {
      const h1s = pageData.headings.filter(h => h.tag === 'h1');
      
      if (h1s.length === 0) {
        pagesWithoutH1.push({
          url: pageUrl,
          title: pageData.meta.title
        });
      } else if (h1s.length > 1) {
        pagesWithMultipleH1.push({
          url: pageUrl,
          title: pageData.meta.title,
          count: h1s.length
        });
      }

      pageData.headings.forEach(heading => {
        headingCounts[heading.tag]++;
        if (heading.isEmpty) {
          emptyHeadings.push({
            url: pageUrl,
            tag: heading.tag,
            position: heading.position
          });
        }
      });
    });

    return {
      totalPages: this.pages.length,
      totalHeadings: Object.values(headingCounts).reduce((a, b) => a + b, 0),
      byTag: headingCounts,
      pagesWithoutH1: pagesWithoutH1,
      pagesWithMultipleH1: pagesWithMultipleH1,
      emptyHeadings: emptyHeadings
    };
  }

  /**
   * Gera análise de imagens
   * @returns {Object} Análise de imagens
   */
  analyzeImages() {
    let totalImages = 0;
    let imagesWithoutAlt = 0;
    const pageImagesInfo = [];

    this.pages.forEach(([pageUrl, pageData]) => {
      const pageImages = pageData.images.length;
      const pageImagesNoAlt = pageData.images.filter(img => !img.hasAlt).length;
      
      totalImages += pageImages;
      imagesWithoutAlt += pageImagesNoAlt;

      if (pageImages > 0) {
        pageImagesInfo.push({
          url: pageUrl,
          title: pageData.meta.title,
          totalImages: pageImages,
          imagesWithoutAlt: pageImagesNoAlt,
          percentage: pageImagesNoAlt > 0 
            ? Math.round((pageImagesNoAlt / pageImages) * 100) 
            : 0
        });
      }
    });

    return {
      totalImages,
      imagesWithoutAlt,
      imagesWithAlt: totalImages - imagesWithoutAlt,
      percentageWithoutAlt: totalImages > 0 
        ? Math.round((imagesWithoutAlt / totalImages) * 100) 
        : 0,
      averagePerPage: Math.round(totalImages / this.pages.length) || 0,
      pageImagesInfo: pageImagesInfo.sort((a, b) => b.imagesWithoutAlt - a.imagesWithoutAlt)
    };
  }

  /**
   * Gera análise de meta tags
   * @returns {Object} Análise de meta tags
   */
  analyzeMeta() {
    const issues = {
      missingTitle: [],
      missingDescription: [],
      shortTitle: [],
      longTitle: [],
      shortDescription: [],
      longDescription: [],
      missingOgImage: [],
      missingCanonical: []
    };

    this.pages.forEach(([pageUrl, pageData]) => {
      const { meta } = pageData;
      const pageInfo = { url: pageUrl, title: meta.title || 'Sem título' };

      if (!meta.title) {
        issues.missingTitle.push(pageInfo);
      } else if (meta.title.length < 30) {
        issues.shortTitle.push({ ...pageInfo, length: meta.title.length });
      } else if (meta.title.length > 60) {
        issues.longTitle.push({ ...pageInfo, length: meta.title.length });
      }

      if (!meta.description) {
        issues.missingDescription.push(pageInfo);
      } else if (meta.description.length < 120) {
        issues.shortDescription.push({ ...pageInfo, length: meta.description.length });
      } else if (meta.description.length > 160) {
        issues.longDescription.push({ ...pageInfo, length: meta.description.length });
      }

      if (!meta.ogImage) {
        issues.missingOgImage.push(pageInfo);
      }

      if (!meta.canonical) {
        issues.missingCanonical.push(pageInfo);
      }
    });

    return issues;
  }

  /**
   * Gera análise de problemas SEO
   * @returns {Object} Análise de SEO
   */
  analyzeSEO() {
    const allIssues = [];
    const issuesByType = { error: 0, warning: 0 };
    const issuesByPage = [];

    this.pages.forEach(([pageUrl, pageData]) => {
      const pageIssues = pageData.seoIssues.map(issue => ({
        ...issue,
        url: pageUrl,
        title: pageData.meta.title
      }));

      allIssues.push(...pageIssues);
      
      pageData.seoIssues.forEach(issue => {
        issuesByType[issue.type]++;
      });

      if (pageData.seoIssues.length > 0) {
        issuesByPage.push({
          url: pageUrl,
          title: pageData.meta.title,
          issues: pageData.seoIssues,
          errorCount: pageData.seoIssues.filter(i => i.type === 'error').length,
          warningCount: pageData.seoIssues.filter(i => i.type === 'warning').length
        });
      }
    });

    return {
      totalIssues: allIssues.length,
      issuesByType,
      allIssues,
      issuesByPage: issuesByPage.sort((a, b) => 
        (b.errorCount * 2 + b.warningCount) - (a.errorCount * 2 + a.warningCount)
      )
    };
  }

  /**
   * Gera análise de performance
   * @returns {Object} Análise de performance
   */
  analyzePerformance() {
    let totalLoadTime = 0;
    let totalWordCount = 0;
    const pagePerformance = [];

    this.pages.forEach(([pageUrl, pageData]) => {
      totalLoadTime += pageData.loadTime || 0;
      totalWordCount += pageData.wordCount || 0;

      pagePerformance.push({
        url: pageUrl,
        title: pageData.meta.title,
        loadTime: pageData.loadTime || 0,
        wordCount: pageData.wordCount || 0
      });
    });

    return {
      averageLoadTime: Math.round(totalLoadTime / this.pages.length) || 0,
      averageWordCount: Math.round(totalWordCount / this.pages.length) || 0,
      totalWordCount,
      slowestPages: pagePerformance
        .sort((a, b) => b.loadTime - a.loadTime)
        .slice(0, 10),
      shortestPages: pagePerformance
        .sort((a, b) => a.wordCount - b.wordCount)
        .slice(0, 10)
    };
  }

  /**
   * Gera relatório completo
   * @returns {SummaryReport} Relatório completo com todas as análises
   */
  generateSummary() {
    return {
      overview: {
        totalPages: this.pages.length,
        analyzedAt: new Date().toISOString()
      },
      links: this.analyzeLinks(),
      headings: this.analyzeHeadings(),
      images: this.analyzeImages(),
      meta: this.analyzeMeta(),
      seo: this.analyzeSEO(),
      performance: this.analyzePerformance()
    };
  }
}