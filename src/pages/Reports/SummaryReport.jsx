import { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataExtractionContext } from '../../contexts/dataExtractionContext';
import SummaryAnalyticsService from '../../services/summaryAnalyticsService';
import MessageBox from '../../components/ui/MessageBox';
import StatCard from '../../components/ui/StatCard';
import Icons from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import SectionHeader from '../../components/ui/SectionHeader';
import JSZip from 'jszip';

/**
 * Converte array de objetos em CSV
 * @param {Array<Object>} data - Array de objetos
 * @param {string[]} headers - Headers do CSV
 * @returns {string} String CSV
 */
function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  // Cria o header
  const csvHeaders = headers.join(',');
  
  // Cria as linhas
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      
      // Escapa valores que contém vírgula, aspas ou quebra de linha
      if (value === null || value === undefined) {
        return '';
      }
      
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });

  return csvHeaders + '\n' + csvRows.join('\n');
}

/**
 * @param {Object} props
 * @param {import('../../types/extraction-types').ExtractionResults} props.extractedData
 */
function DownloadCSVButton({ extractedData }) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCSVReports = async () => {
    try {
      setIsGenerating(true);

      const analytics = new SummaryAnalyticsService(extractedData);
      const summary = analytics.generateSummary();

      const zip = new JSZip();
      
      // 1. CSV de Links Mais Referenciados
      const linksCSV = convertToCSV(
        summary.links.mostLinkedPages,
        ['url', 'title', 'count']
      );
      zip.file('01_links_mais_referenciados.csv', linksCSV);

      // 2. CSV de Links por Página
      const pageLinksCSV = convertToCSV(
        summary.links.pageLinks,
        ['url', 'title', 'count']
      );
      zip.file('02_links_por_pagina.csv', pageLinksCSV);

      // 3. CSV de Páginas sem H1
      if (summary.headings.pagesWithoutH1.length > 0) {
        const noH1CSV = convertToCSV(
          summary.headings.pagesWithoutH1,
          ['url', 'title']
        );
        zip.file('03_paginas_sem_h1.csv', noH1CSV);
      }

      // 4. CSV de Páginas com Múltiplos H1
      if (summary.headings.pagesWithMultipleH1.length > 0) {
        const multipleH1CSV = convertToCSV(
          summary.headings.pagesWithMultipleH1,
          ['url', 'title', 'count']
        );
        zip.file('04_paginas_multiplos_h1.csv', multipleH1CSV);
      }

      // 5. CSV de Headings Vazios
      if (summary.headings.emptyHeadings.length > 0) {
        const emptyHeadingsCSV = convertToCSV(
          summary.headings.emptyHeadings,
          ['url', 'tag', 'position']
        );
        zip.file('05_headings_vazios.csv', emptyHeadingsCSV);
      }

      // 6. CSV de Imagens por Página
      const imagesCSV = convertToCSV(
        summary.images.pageImagesInfo,
        ['url', 'title', 'totalImages', 'imagesWithoutAlt', 'percentage']
      );
      zip.file('06_imagens_por_pagina.csv', imagesCSV);

      // 7. CSV de Problemas de Meta Tags
      const metaIssues = [];
      
      summary.meta.missingTitle.forEach(page => {
        metaIssues.push({ url: page.url, issue: 'Título ausente', severity: 'error' });
      });
      
      summary.meta.missingDescription.forEach(page => {
        metaIssues.push({ url: page.url, issue: 'Description ausente', severity: 'error' });
      });
      
      summary.meta.shortTitle.forEach(page => {
        metaIssues.push({ 
          url: page.url, 
          issue: `Título curto (${page.length} chars)`, 
          severity: 'warning' 
        });
      });
      
      summary.meta.longTitle.forEach(page => {
        metaIssues.push({ 
          url: page.url, 
          issue: `Título longo (${page.length} chars)`, 
          severity: 'warning' 
        });
      });

      if (metaIssues.length > 0) {
        const metaCSV = convertToCSV(metaIssues, ['url', 'issue', 'severity']);
        zip.file('07_problemas_meta_tags.csv', metaCSV);
      }

      // 8. CSV de Todos os Problemas SEO
      const seoIssuesCSV = convertToCSV(
        summary.seo.allIssues,
        ['url', 'title', 'type', 'message']
      );
      zip.file('08_problemas_seo.csv', seoIssuesCSV);

      // 9. CSV de Performance
      const performanceData = summary.performance.slowestPages.map(page => ({
        url: page.url,
        title: page.title,
        loadTime: page.loadTime,
        wordCount: page.wordCount
      }));
      
      const performanceCSV = convertToCSV(
        performanceData,
        ['url', 'title', 'loadTime', 'wordCount']
      );
      zip.file('09_performance.csv', performanceCSV);

      // 10. CSV de Resumo Geral
      const overviewData = [
        { metric: 'Total de Páginas', value: summary.overview.totalPages },
        { metric: 'Total de Links', value: summary.links.totalLinks },
        { metric: 'Links Únicos', value: summary.links.uniqueLinks },
        { metric: 'Média de Links/Página', value: summary.links.averageLinksPerPage },
        { metric: 'Total de Headings', value: summary.headings.totalHeadings },
        { metric: 'Total de Imagens', value: summary.images.totalImages },
        { metric: 'Imagens sem Alt', value: summary.images.imagesWithoutAlt },
        { metric: '% Imagens sem Alt', value: summary.images.percentageWithoutAlt + '%' },
        { metric: 'Total de Problemas SEO', value: summary.seo.totalIssues },
        { metric: 'Errors', value: summary.seo.issuesByType.error },
        { metric: 'Warnings', value: summary.seo.issuesByType.warning },
        { metric: 'Tempo Médio Carregamento (ms)', value: summary.performance.averageLoadTime },
        { metric: 'Média Palavras/Página', value: summary.performance.averageWordCount }
      ];

      const overviewCSV = convertToCSV(overviewData, ['metric', 'value']);
      zip.file('00_resumo_geral.csv', overviewCSV);

      // 11. Lista de heading tags

      console.log(Object.entries(extractedData)[0][1].headings);
      

      const headingsData = Object.entries(extractedData).flatMap(
        ([url, pageData]) => {
          return pageData.headings.map(heading => ({
            url,
            tag: heading.tag,
            text: heading.text,
            position: heading.position,
            headingLevel: heading.tag.split('')[1]
          }))
        }
      );

      const headingsCSV = convertToCSV(
        headingsData,
        ['url', 'tag', 'text', 'position', 'headingLevel']
      );

      zip.file('10_lista_headings.csv', headingsCSV);
      
      // 12. Lista de elementos capturados com custom selectors
      
      const selectorsData = Object.entries(extractedData).flatMap(
        ([url, pageData]) => {
          return Object.entries(pageData.customSelectors)
            .flatMap(([selector, selectedElements]) => (
              selectedElements.map((selected, index) => ({
                url,
                selector,
                text: selected.text,
                position: index + 1,
                html: selected.html
              }))
            ))
        }
      );

      const selectorsCSV = convertToCSV(
        selectorsData,
        ['url', 'selector', 'text', 'position', 'html']
      );

      zip.file('11_lista_seletores_css.csv', selectorsCSV);

      // Gera o arquivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);

      // Cria nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `seo-report-${timestamp}.zip`;

      // Download usando Chrome API
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });

      // Limpa a URL após um tempo
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      setIsGenerating(false);
      return true;
    } catch (error) {
      console.error('Erro ao gerar relatórios CSV:', error);
      setIsGenerating(false);
      return false;
    }
  };

  return (
    <Button 
      onClick={generateCSVReports} 
      variant='primary'
      disabled={isGenerating || !extractedData}
    >
      {isGenerating ? t('generatingCsvReports') : t('downloadCsvReports')}
    </Button>
  );
}

function DownloadRawButton({ extractedData }) {
  const { t } = useTranslation();
  const onClick = async () => {
      try {
        const jsonString = JSON.stringify(extractedData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Usa a API do Chrome para download
        await chrome.downloads.download({
          url: url,
          filename: 'crawler-results.json',
          saveAs: true // Abre dialog de "Salvar como"
        });
        
        // Limpa a URL após um tempo
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return true;
      } catch (error) {
        console.error('Erro ao fazer download do JSON:', error);
        return false;
      }
  };

  return (
    <Button onClick={onClick} variant='success'>
      { t('downloadRawData') }  
    </ Button>
  )
}

function SummaryReport() {
  const { t } = useTranslation();
  const { extractedData } = useDataExtractionContext();

  const summary = useMemo(() => {
    if (!extractedData) return null;
    const analytics = new SummaryAnalyticsService(extractedData);
    return analytics.generateSummary();
  }, [extractedData]);

  if (!summary) {
    return (
      <MessageBox
        title={t('noDataTitle')}
        variant='info'
        closeButton={false}
      >
        <p>{t('noDataDescription')}</p>
      </MessageBox>
    );
  }

  const { overview, headings, links } = summary;

  return (
    <div className="space-y-8">
      <DownloadCSVButton extractedData={ extractedData } />
      <DownloadRawButton extractedData={ extractedData } />
      {/* Overview Section */}
      <SectionHeader title={t('summaryOverviewTitle')} icon={Icons.barChart}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title={t('totalPagesLabel')}
            value={overview.totalPages}
            icon={Icons.scroll}
            variant="highlight"
          />
          <StatCard
            title={t('totalLinksLabel')}
            value={links.totalLinks}
            icon={Icons.link}
            variant="info"
          />
          <StatCard
            title={t('totalHeadingsLabel')}
            value={headings.totalHeadings}
            icon={Icons.file}
            variant="critical"
          />
        </div>
      </SectionHeader>  
    </div>
  );
}

export default SummaryReport; 