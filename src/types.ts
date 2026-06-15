export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  source: string;
  originalUrl: string;
  imageUrl?: string;
  publishedAt: string;
  isBreaking: boolean;
  status: 'draft' | 'published';
  editorialStyle: string;
}

export interface SyncState {
  lastSyncAt: string;
}
