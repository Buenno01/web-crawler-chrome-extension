import React from 'react';

export default function ErrorDisplay({ error }) {
  return (
    <div className="error-display alert alert-danger" role="alert">
      <strong>Error during extraction:</strong>
      <p>{error}</p>
    </div>
  );
}
