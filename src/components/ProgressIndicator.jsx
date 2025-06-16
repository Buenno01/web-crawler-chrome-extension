import React from 'react';

export default function ProgressIndicator({ progress }) {
  const { processed, pending, total, currentUrl } = progress;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
  
  // Extract domain and path for display
  let displayUrl = currentUrl;
  try {
    const url = new URL(currentUrl);
    displayUrl = `${url.hostname}${url.pathname}`;
  } catch {
    // Keep original URL if parsing fails
  }

  return (
    <div className="progress-indicator">
      <div className="progress">
        <div
          className="progress-bar loading-bg"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span className='progress-bar__percentage'>{percentage}%</span>
        </div>
      </div>
      
      <div className="progress-stats">
        <span>Processed: {processed}</span>
        <span>Pending: {pending}</span>
        <span>Total: {total}</span>
      </div>
      
      {currentUrl && (
        <div className="current-url" title={currentUrl}>
          Currently processing: {displayUrl}
        </div>
      )}
    </div>
  );
}
