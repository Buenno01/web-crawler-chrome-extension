import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataExtractionContext } from '../../contexts/dataExtractionContext';
import SummaryAnalyticsService from '../../services/summaryAnalyticsService';
import StatCard from '../../components/ui/StatCard';
import Icons from '../../components/ui/Icon';

/**
 * @param {Object} props
 * @param {Array} props.links
 * @param {string} props.title
 * @param {string} props.emptyMessage
 */
function LinksList({ links, emptyMessage }) {
  const { t } = useTranslation();
  if (!links || links.length === 0) {
    return <p className="text-accent/60 text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {links.slice(0, 5).map((item, index) => (
        <div key={index} className="flex justify-between items-center gap-2 p-2 box__card rounded text-xs">
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{item.title || t('notAnalizedPage')}</div>
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
        <p className="text-xs opacity-60">+ {links.length - 5} mais</p>
      )}
    </div>
  );
}

function LinksReport() {
  const { t } = useTranslation();
  const { extractedData } = useDataExtractionContext();

  const linksData = useMemo(() => {
    if (!extractedData) {
      return {
        uniqueLinks: 0,
        averageLinksPerPage: 0,
        mostLinkedPages: []
      };
    }

    try {
      const analytics = new SummaryAnalyticsService(extractedData);
      const links = analytics.analyzeLinks();
      return links;
    } catch (error) {
      console.error('Error generating links summary:', error);
      return {
        uniqueLinks: 0,
        averageLinksPerPage: 0,
        mostLinkedPages: []
      };
    }
  }, [extractedData]);

  if (!extractedData) {
    return (
      <div className="p-8 text-center">
        <p className="text-accent/60">{t('noDataAvailable')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Icons.link className="w-6 h-6" />
        <h2 className="text-2xl font-bold">{t('linksAnalysisTitle')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('linksOverviewTitle')}
          value={linksData.uniqueLinks}
          subtitle={t('averageLinksPerPage', { avg: linksData.averageLinksPerPage })}
        />
        
        <div className="lg:col-span-2">
          <StatCard
            title={t('mostLinkedPagesTitle')}
          >
            <div className="mt-4">
              <LinksList
                links={linksData.mostLinkedPages}
                emptyMessage={t('noLinkedPagesFound')}
              />
            </div>
          </StatCard>
        </div>
      </div>
    </div>
  );
}

export default LinksReport;