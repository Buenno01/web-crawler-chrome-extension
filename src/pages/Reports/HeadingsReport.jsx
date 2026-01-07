import SummaryAnalyticsService from '../../services/summaryAnalyticsService';
import { useDataExtractionContext } from '../../contexts/dataExtractionContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useMemo } from 'react';

import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from '../../components/ui/StatCard';
import DistributionChart from "../../components/ui/DistributionChart";
import Icons from '../../components/ui/Icon';

function HeadingsReport() {
  const { t } = useTranslation();
  const { extractedData } = useDataExtractionContext();

  const { totalPages, byTag, totalHeadings } = useMemo(() => {
    if (!extractedData) return null;
    const analytics = new SummaryAnalyticsService(extractedData);
    return analytics.analyzeHeadings();
  }, [extractedData]);

  return (
    <SectionHeader title={t('headingsAnalysisTitle')} icon={Icons.file}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <StatCard
            title={t('headingDistributionTitle')}
            value={totalHeadings}
            subtitle={t('averageHeadingsPerPage', { avg: totalHeadings / totalPages })}
          >
            <div className="mt-4">
              <DistributionChart
                distribution={byTag}
                calculateAverage={totalPages}
              />
            </div>
          </StatCard>
        </div>
      </div>
    </SectionHeader>
  );
}

export default HeadingsReport;