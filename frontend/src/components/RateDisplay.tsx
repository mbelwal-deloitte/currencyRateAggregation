import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { AggregatedRate } from '../types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface RateDisplayProps {
  rates: AggregatedRate[];
  onCurrencySelect: (currency: string) => void;
}

const RateDisplay: React.FC<RateDisplayProps> = ({ rates, onCurrencySelect }) => {
  const formatRate = (rate: number) => rate.toFixed(4);
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Exchange Rates
      </Typography>
      <List>
        {rates.map((rate) => {
          const isIncreasing = rate.average_rate > (rate.min_rate + rate.max_rate) / 2;
          return (
            <ListItem
              key={rate.currency}
              button
              onClick={() => onCurrencySelect(rate.currency)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" component="span">
                      {rate.currency}/USD
                    </Typography>
                    <Chip
                      icon={isIncreasing ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={formatRate(rate.average_rate)}
                      color={isIncreasing ? "success" : "error"}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Typography variant="body2" color="textSecondary">
                      Range: {formatRate(rate.min_rate)} - {formatRate(rate.max_rate)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Last updated: {new Date(rate.last_updated).toLocaleTimeString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default RateDisplay;