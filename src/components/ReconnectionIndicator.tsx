import React from 'react';

interface ReconnectionIndicatorProps {
  exchange: string;
  attemptCount: number;
  maxAttempts: number;
}

export const ReconnectionIndicator: React.FC<ReconnectionIndicatorProps> = ({
  exchange,
  attemptCount,
  maxAttempts
}) => {
  if (attemptCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-lg">
      <p className="text-yellow-700 dark:text-yellow-300">
        Reconnecting to {exchange}... (Attempt {attemptCount}/{maxAttempts})
      </p>
    </div>
  );
}; 