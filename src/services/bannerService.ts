import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { HomeBanner } from '../features/home/types/banner.types';

export const bannerService = {
  getActive: (): Promise<ApiResponse<HomeBanner[]>> => API.request<HomeBanner[]>('/banners/active', { method: 'GET' }),
};
