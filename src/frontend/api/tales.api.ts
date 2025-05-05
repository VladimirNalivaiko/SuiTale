// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Tale interfaces
export interface Tale {
  id: string;
  title: string;
  description: string;
  contentCid: string;
  coverImage?: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaleWithContent extends Omit<Tale, 'contentCid'> {
  content: string;
}

export interface CreateTalePayload {
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
  authorId?: string;
}

export interface UpdateTalePayload extends Partial<CreateTalePayload> {}

// API functions
export const talesApi = {
  // Get all tales with pagination
  async getTales(limit = 10, offset = 0): Promise<Tale[]> {
    const response = await fetch(`${API_BASE_URL}/tales?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get a single tale by ID
  async getTale(id: string): Promise<Tale> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get a tale with full content
  async getTaleWithContent(id: string): Promise<TaleWithContent> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}/full`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },

  // Create a new tale
  async createTale(tale: CreateTalePayload): Promise<Tale> {
    console.log(tale);
    console.log(import.meta.env);
    console.log(API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/tales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tale),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },

  // Update a tale
  async updateTale(id: string, tale: UpdateTalePayload): Promise<Tale> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tale),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },

  // Delete a tale
  async deleteTale(id: string): Promise<Tale> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },

  // Upload a cover image
  async uploadCoverImage(file: File): Promise<{ coverImage: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/tales/upload/cover`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },
}; 