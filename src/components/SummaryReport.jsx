import React, { useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useDataExtractionContext } from '../contexts/dataExtractionContext';
import SummaryAnalyticsService from '../services/summaryAnalyticsService';
import MessageBox from './ui/MessageBox';
import { FiAlertTriangle } from "react-icons/fi";
import { 
  RiBarChartLine, 
  RiFileList3Line, 
  RiLinksLine, 
  RiCodeSSlashLine, 
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine
} from 'react-icons/ri';
import StatCard from './ui/StatCard';

function SectionHeader({ title, icon: Icon, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="text-xl text-blue-600" />}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
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
          <div className="flex-1 bg-blue-500/15 rounded-full h-4 relative">
            <div 
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
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
    return <p className="text-blue-500/60 text-sm">{emptyMessage}</p>;
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
        disclosure={false}
        closeButton={false}
      >
        <p>{t('noDataDescription')}</p>
      </MessageBox>
    );
  }

  const { overview, headings, links, customSelectors, metadata } = summary;

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <SectionHeader title={t('summaryOverviewTitle')} icon={RiBarChartLine}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title={t('totalPagesLabel')}
            value={overview.totalPages}
            icon={RiFileList3Line}
            variant="rose"
          />
          <StatCard
            title={t('successRateLabel')}
            value={`${overview.successRate}%`}
            icon={overview.successRate === 100 ? RiCheckboxCircleLine : RiErrorWarningLine}
            variant={overview.successRate === 100 ? 'success' : overview.successRate >= 80 ? 'warning' : 'error'}
          />
          <StatCard
            title={t('totalLinksLabel')}
            value={links.totalLinksFound}
            icon={RiLinksLine}
            variant="info"
          />
          <StatCard
            title={t('totalHeadingsLabel')}
            value={headings.totalHeadings}
            icon={RiFileTextLine}
            variant="fuchsia"
          />
        </div>
      </SectionHeader>

      {/* Headings Analysis */}
      <SectionHeader title={t('headingsAnalysisTitle')} icon={RiFileTextLine}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <StatCard
              title={t('headingDistributionTitle')}
              value={headings.totalHeadings}
              subtitle={t('averageHeadingsPerPage', { avg: headings.averageHeadingsPerPage })}
            >
              <div className="mt-4">
                <HeadingDistributionChart distribution={headings.headingDistribution} />
              </div>
            </StatCard>
          </div>
          
          <div className="space-y-4">
            <StatCard
              title={t('seoIssuesTitle')}
              value={headings.seoIssues.pagesWithoutH1 + headings.seoIssues.pagesWithMultipleH1}
              icon={FiAlertTriangle}
              variant={headings.seoIssues.pagesWithoutH1 + headings.seoIssues.pagesWithMultipleH1 > 0 ? 'warning' : 'success'}
            >
              <div className="mt-4 space-y-2">
                {headings.seoIssues.pagesWithoutH1 > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-yellow-700">
                      {t('pagesWithoutH1Label')}: {headings.seoIssues.pagesWithoutH1}
                    </span>
                  </div>
                )}
                {headings.seoIssues.pagesWithMultipleH1 > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-yellow-700">
                      {t('pagesWithMultipleH1Label')}: {headings.seoIssues.pagesWithMultipleH1}
                    </span>
                  </div>
                )}
              </div>
            </StatCard>
          </div>
        </div>
      </SectionHeader>

      {/* Links Analysis */}
      <SectionHeader title={t('linksAnalysisTitle')} icon={RiLinksLine}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard
            title={t('linksOverviewTitle')}
            value={links.uniqueLinks}
            subtitle={t('averageLinksPerPage', { avg: links.averageLinksPerPage })}
          />
          
          <div className="lg:col-span-2">
            <StatCard
              title={t('mostLinkedPagesTitle')}
              value={links.mostLinkedPages.length}
            >
              <div className="mt-4">
                <LinksList
                  links={links.mostLinkedPages}
                  title={t('topLinkedPages')}
                  emptyMessage={t('noLinkedPagesFound')}
                />
              </div>
            </StatCard>
          </div>
        </div>
      </SectionHeader>

      {/* Custom Selectors Analysis */}
      {Object.keys(customSelectors.selectorBreakdown).length > 0 && (
        <SectionHeader title={t('customSelectorsAnalysisTitle')} icon={RiCodeSSlashLine}>
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
                      <span className="text-green-600">
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

      {/* Metadata Issues */}
      {(metadata.pagesWithoutTitle > 0 || metadata.pagesWithoutDescription > 0) && (
        <SectionHeader title={t('metadataIssuesTitle')} icon={FiAlertTriangle}>
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
      )}

      {/* Generation Info */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t">
        {t('reportGeneratedAt')}: {new Date(summary.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}

export default SummaryReport; 