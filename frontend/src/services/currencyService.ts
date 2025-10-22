import axios from 'axios';
import { AggregatedRate, TrendData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const currencyService = {
  getCurrentRates: async (): Promise<AggregatedRate[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/rates/current`);
    return response.data;
  },

  getTrends: async (currency: string, timeframe: string): Promise<TrendData> => {
    const response = await axios.get(`${API_BASE_URL}/api/trends/${currency}/${timeframe}`);
    return response.data;
  },
};