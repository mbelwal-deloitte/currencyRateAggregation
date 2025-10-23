import React, { useEffect, useState, Suspense } from 'react';
import { Box, Grid, Paper, Tab, Tabs, CircularProgress, Alert } from '@mui/material';
import RateDisplay from './RateDisplay';
const TrendChart = React.lazy(() => import('./TrendChart'));
import { AggregatedRate, TrendData } from '../types';
// import { currencyService } from '../services/currencyService'; // Uncomment when backend is ready

const CurrencyDashboard: React.FC = () => {
  const [rates, setRates] = useState<AggregatedRate[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        // For testing, using mock data since the backend might not be ready
        const mockData: AggregatedRate[] = [
          {
            currency: 'EUR',
            average_rate: 0.85,
            min_rate: 0.84,
            max_rate: 0.86,
            last_updated: new Date().toISOString(),
            sources: ['source1', 'source2']
          },
          {
            currency: 'GBP',
            average_rate: 0.73,
            min_rate: 0.72,
            max_rate: 0.74,
            last_updated: new Date().toISOString(),
            sources: ['source1', 'source2']
          }
        ];
        setRates(mockData);
      } catch (error) {
        console.error('Error fetching rates:', error);
        setError('Failed to fetch current rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        // For testing, using mock trend data
        const mockTrendData: TrendData = {
          currency: selectedCurrency,
          timeframe: timeframe,
          data_points: Array.from({ length: 10 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
              [date.toISOString()]: 0.85 + (Math.random() - 0.5) * 0.1
            };
          }),
          start_date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
          end_date: new Date().toISOString()
        };
        setTrendData(mockTrendData);
      } catch (error) {
        console.error('Error fetching trends:', error);
        setError('Failed to fetch trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [selectedCurrency, timeframe]);

  const handleTimeframeChange = (event: React.SyntheticEvent, newValue: string) => {
    setTimeframe(newValue);
  };

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