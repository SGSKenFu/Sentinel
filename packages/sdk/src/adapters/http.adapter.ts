import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { BaseAdapter, AdapterConfig } from './base.adapter';
import { CrawledItemDto } from '../dtos/crawled-item.dto';

export abstract class HttpAdapter extends BaseAdapter {
  protected http: AxiosInstance;

  constructor(config: AdapterConfig, timeoutMs = 30000) {
    super(config);
    this.http = axios.create({
      baseURL: config.url,
      timeout: timeoutMs,
      headers: { 'User-Agent': 'Sentinel-Crawler/1.0' },
    });
    axiosRetry(this.http, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (err) => axiosRetry.isNetworkOrIdempotentRequestError(err),
    });
  }

  abstract fetch(): Promise<CrawledItemDto[]>;
}
