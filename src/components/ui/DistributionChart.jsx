import React from "react";
import { useTranslation } from '../../hooks/useTranslation';

/**
 * @param {Object} props
 * @param {Record<string, number>} props.distribution - Objeto com strings como chaves e números como valores
 * @param {number} [props.calculateAverage] - Número de comparação para cálculo de média
 */
function DistributionChart({ distribution, calculateAverage }) {
  const { t } = useTranslation();
  if (!distribution) return null;
  const max = Math.max(...Object.values(distribution));
  const columns = calculateAverage ? 'grid-cols-[auto_1fr_auto_auto]' : 'grid-cols-[auto_1fr_auto]';
  
  return (
    <div className={`space-y-2 grid items-center gap-x-3 gap-y-1 ${columns}`}>
      {
        calculateAverage && (
          <>
            <span></span>
            <span></span>
            <ColumnLabel text={ t('total') } />
            <ColumnLabel text={ t('avg') } />
          </>
        )
      }
      {Object.entries(distribution).map(([key, value]) => (
        <React.Fragment
          key={key}
        >
          <span className="text-sm font-mono uppercase w-8">{key}</span>
          <div className="flex-1 bg-accent/15 rounded-full h-4 relative">
            <div 
              className="bg-accent h-4 rounded-full transition-all duration-300"
              style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-sm font-medium text-right">{value}</span>
          {
            calculateAverage && (
              <span className="text-sm font-medium text-right">
                <span className="inline-block text-left">
                  {value / calculateAverage}
                </span>
              </span>
            )
          }
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * @param {Object} props 
 * @param {string} props.text
 */
function ColumnLabel({ text }) {
  return (
    <small className="text-right inline-block text-xs font-light w-6 text-foreground-secondary">
      { text }
    </small>
  )
}

export default DistributionChart;