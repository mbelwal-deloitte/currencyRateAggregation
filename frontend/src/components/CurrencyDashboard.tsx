import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { Box, Grid, Paper, Tab, Tabs, CircularProgress, Alert } from '@mui/material';
import RateDisplay from './RateDisplay';
const TrendChart = React.lazy(() => import('./TrendChart'));
import { AggregatedRate, TrendData } from '../types';
import { currencyService } from '../services/currencyService';

const CurrencyDashboard: React.FC = () => {
  const [rates, setRates] = useState<AggregatedRate[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await currencyService.getCurrentRates();
        if (!isCancelled) setRates(data);
      } catch (error) {
        console.error('Error fetching rates:', error);
        if (!isCancelled) setError('Failed to fetch current rates');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Refresh every 30 seconds
    return () => { isCancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await currencyService.getTrends(selectedCurrency, timeframe);
        if (!isCancelled) setTrendData(data);
      } catch (error) {
        console.error('Error fetching trends:', error);
        if (!isCancelled) setError('Failed to fetch trend data');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchTrends();
    return () => { isCancelled = true; };
  }, [selectedCurrency, timeframe]);

  const handleTimeframeChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTimeframe(newValue);
  }, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, minHeight: '400px' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <RateDisplay rates={rates} onCurrencySelect={setSelectedCurrency} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={timeframe}
              onChange={handleTimeframeChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Daily" value="daily" />
              <Tab label="Weekly" value="weekly" />
              <Tab label="Monthly" value="monthly" />
            </Tabs>
            <Box sx={{ mt: 2, minHeight: '400px' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                  <CircularProgress />
                </Box>
              ) : (
                trendData && (
                  <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>}>
                    <TrendChart data={trendData} timeframe={timeframe} />
                  </Suspense>
                )
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurrencyDashboard;