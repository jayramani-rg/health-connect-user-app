export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface NormalizedError {
  message: string;
  statusCode: number;
  errors: string[] | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface IdName {
  id: string;
  name: string;
}

export interface ImageAsset {
  uri?: string;
  local?: number;
}
