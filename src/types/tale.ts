export interface Tale {
  id?: string;
  title: string;
  description: string;
  content: string; // HTML content
  coverImage?: string; // Base64 or URL
  tags: string[];
  wordCount: number;
  readingTime: number;
  createdAt?: Date;
  updatedAt?: Date;
  authorId?: string; // User ID or wallet address
}

export interface TaleCreate {
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
}

export interface TaleUpdate extends Partial<TaleCreate> {
  id: string;
} 