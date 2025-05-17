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

export interface UploadCoverResponse {
  blobId: string;
  url: string;
}

export interface UpdateTalePayload extends Partial<CreateTalePayload> {}

// DTO for the new initiate-publication endpoint
export interface FrontendInitiatePublicationDto {
  title: string;
  content: string; // Main content for Walrus
  userAddress: string;
  signature_base64: string; // Full signature from wallet (flag+sig+pk)
  signedMessageBytes_base64: string; // SUI-prefixed message bytes that were signed
  publicKey_base64: string; // User's public key (flag+pk)
  signatureScheme: string; // e.g., 'ed25519' or 'secp256k1'
  
  description?: string; // Optional description for the tale/NFT
  coverImageWalrusUrl?: string; // <<<< ADDED/UPDATED THIS
  // coverImage?: string; // <<<< REMOVE OR COMMENT OUT OLD FIELD if it existed and was different

  // Optional NFT parameters (ensure types match what backend DTO expects after parsing)
  mintPrice?: string; 
  mintCapacity?: string;
  royaltyFeeBps?: number; 
  
  // Optional fields from editor (not for on-chain directly, but for DB)
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
}

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

  // Create a new tale (legacy)
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

  // Initiate publication flow
  async initiatePublication(payload: FrontendInitiatePublicationDto): Promise<Tale> { // Assuming backend returns the created Tale
    const response = await fetch(`${API_BASE_URL}/tales/initiate-publication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to parse error message from backend
      const errorData = await response.json().catch(() => ({ message: `API error: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
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
  async uploadCoverImage(file: File): Promise<UploadCoverResponse> {
    const formData = new FormData();
    formData.append('coverImage', file);
    
    const response = await fetch(`${API_BASE_URL}/files/upload-cover-to-walrus`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },
}; 