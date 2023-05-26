export interface PaginationResponse<T> {
  data: T;
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  nextPage: number;
}
