import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataExtractionContext } from '../../contexts/dataExtractionContext';
import SummaryAnalyticsService from '../../services/summaryAnalyticsService';
import MessageBox from '../../components/ui/MessageBox';
import { FiAlertTriangle } from "react-icons/fi";
import StatCard from '../../components/ui/StatCard';
import Icons from '../../components/ui/Icon';
import Button from '../../components/ui/Button';

function SectionHeader({ title, icon: Icon, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="text-xl text-accent" />}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function HeadingDistributionChart({ distribution }) {
  const max = Math.max(...Object.values(distribution));
  
  return (
    <div className="space-y-2">
      {Object.entries(distribution).map(([tag, count]) => (
        <div key={tag} className="flex items-center gap-3">
          <span className="text-sm font-mono uppercase w-8">{tag}</span>
          <div className="flex-1 bg-accent/15 rounded-full h-4 relative">
            <div 
              className="bg-accent h-4 rounded-full transition-all duration-300"
              style={{ width: max > 0 ? `${(count / max) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-sm font-medium w-12 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function LinksList({ links, title, emptyMessage }) {
  if (links.length === 0) {
    return <p className="text-accent/60 text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      <h4 className="font-medium text-sm opacity-80">{title}</h4>
      {links.slice(0, 5).map((item, index) => (
        <div key={index} className="flex justify-between items-center gap-2 p-2 box__card rounded text-xs">
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{item.title || 'No title'}</div>
            <div className="truncate opacity-60">{item.url}</div>
          </div>
          {item.count && (
            <span className="box__card-count px-2 py-1 rounded-full text-xs font-medium">
              {item.count}
            </span>
          )}
        </div>
      ))}
      {links.length > 5 && (
        <p className="text-xs opacity-60">+ {links.length - 5} more</p>
      )}
    </div>
  );
}

function DownloadRawButton({ extractedData }) {
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
    <Button onClick={onClick} variant='success'>Raw</ Button>
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

      {/* {Object.keys(customSelectors.selectorBreakdown).length > 0 && (
        <SectionHeader title={t('customSelectorsAnalysisTitle')} icon={Icons.code}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatCard
              title={t('customElementsTitle')}
              value={customSelectors.totalElements}
              subtitle={t('averageElementsPerPage', { avg: customSelectors.averageElementsPerPage })}
            />
            
            <StatCard
              title={t('selectorPerformanceTitle')}
              value={Object.keys(customSelectors.selectorBreakdown).length}
              variant={customSelectors.failedSelectors.length > 0 ? 'warning' : 'success'}
            >
              <div className="mt-4 space-y-2">
                {Object.entries(customSelectors.selectorBreakdown).map(([selector, count]) => (
                  <div key={selector} className="flex justify-between items-center text-sm">
                    <code className="box__card px-2 py-1 rounded text-xs font-mono truncate flex-1 mr-2">
                      {selector}
                    </code>
                    <div className="flex gap-2">
                      <span className="font-medium">{count}</span>
                      <span>
                        {customSelectors.selectorSuccessRates[selector]}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </StatCard>
          </div>
        </SectionHeader>
      )}

      {(metadata.pagesWithoutTitle > 0 || metadata.pagesWithoutDescription > 0) && (
        <SectionHeader title={t('metadataIssuesTitle')} icon={Icons.warning}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metadata.pagesWithoutTitle > 0 && (
              <StatCard
                title={t('pagesWithoutTitleTitle')}
                value={metadata.pagesWithoutTitle}
                variant="warning"
              >
                <div className="mt-4">
                  <LinksList
                    links={metadata.pagesWithoutTitleList}
                    title={t('affectedPages')}
                    emptyMessage=""
                  />
                </div>
              </StatCard>
            )}
            
            {metadata.pagesWithoutDescription > 0 && (
              <StatCard
                title={t('pagesWithoutDescriptionTitle')}
                value={metadata.pagesWithoutDescription}
                variant="warning"
              >
                <div className="mt-4">
                  <LinksList
                    links={metadata.pagesWithoutDescriptionList}
                    title={t('affectedPages')}
                    emptyMessage=""
                  />
                </div>
              </StatCard>
            )}
          </div>
        </SectionHeader>
      )} */}

      {/* Generation Info */}
  
    </div>
  );
}

export default SummaryReport; 