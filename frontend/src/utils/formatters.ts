export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getTimeframeLabel = (timeframe: string): string => {
  const labels = {
    daily: 'Last 24 Hours',
    weekly: 'Last 7 Days',
    monthly: 'Last 30 Days',
  };
  return labels[timeframe as keyof typeof labels] || timeframe;
};