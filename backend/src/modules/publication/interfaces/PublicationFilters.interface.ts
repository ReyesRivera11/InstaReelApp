export interface PublicationFilters {
  search?: string;
  status?: 'scheduled' | 'published';
  page?: number;
  limit?: number;
}
