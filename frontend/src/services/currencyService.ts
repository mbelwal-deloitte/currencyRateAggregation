import axios, { AxiosInstance } from 'axios';
import { AggregatedRate, TrendData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (client) return client;
  client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
    },
  });
  return client;
}

type CacheEntry<T> = {
  value?: T;
  promise?: Promise<T>;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

async function requestWithCache<T>(key: string, fetcher: () => Promise<T>, ttlMs: number): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);

  if (entry && entry.value !== undefined && entry.expiresAt > now) {
    return entry.value as T;
  }

  if (entry && entry.promise && entry.expiresAt > now) {
    return entry.promise as Promise<T>;
  }

  const p = fetcher()
    .then((val) => {
      cache.set(key, { value: val, expiresAt: Date.now() + ttlMs });
      return val;
    })
    .finally(() => {
      const latest = cache.get(key);
      if (latest && latest.promise) {
        // Drop the inflight promise handle but keep value if set by then
        cache.set(key, { value: latest.value, expiresAt: latest.expiresAt });
      }
    });

  cache.set(key, { promise: p, expiresAt: now + ttlMs });
  return p;
}

export const currencyService = {
  getCurrentRates: async (): Promise<AggregatedRate[]> => {
    return requestWithCache('rates:current', async () => {
      const http = getClient();
      const response = await http.get(`/api/rates/current`);
      return response.data;
    }, 30_000);
  },

  getTrends: async (currency: string, timeframe: string): Promise<TrendData> => {
    const key = `trends:${currency}:${timeframe}`;
    return requestWithCache(key, async () => {
      const http = getClient();
      const response = await http.get(`/api/trends/${currency}/${timeframe}`);
      return response.data;
    }, 60_000);
  },
};