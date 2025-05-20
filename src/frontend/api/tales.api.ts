// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// --- Updated Tale Interfaces ---

// Interface for Tale summary/list item
export interface TaleSummary {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string; // Stores the full URL from Walrus publisher
  contentBlobId: string; // Stores the Blob ID for the main content in Walrus
  tags: string[];
  wordCount: number;
  readingTime: number;
  authorId?: string; // Or a more detailed Author object if you have one
  createdAt: string;
  updatedAt: string;
}

// Interface for detailed Tale view, including content from Walrus
export interface TaleWithContent extends TaleSummary { // Inherits from TaleSummary
  content: string; // The actual tale content fetched from Walrus
}

// Renamed old Tale interface to avoid confusion, if it was used elsewhere with different meaning.
// If Tale was only used for list items, TaleSummary effectively replaces it.
// export type OldTale = TaleSummary; // Alias if needed for progressive refactoring

// --- Existing DTOs and other interfaces (minor changes if any) ---

export interface CreateTalePayload { // This DTO is for creating a tale, might not need contentBlobId directly
  title: string;
  description: string;
  content: string; // The raw content to be uploaded to Walrus by the backend
  coverImageUrl?: string; // Full URL of the cover, if already uploaded and known
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
  authorId?: string;
}

export interface UploadCoverResponse {
  blobId: string;
  url: string; // This is the full URL from Walrus publisher for the cover
}

export interface UpdateTalePayload extends Partial<CreateTalePayload> {}

export interface FrontendInitiatePublicationDto {
  title: string;
  content: string; // Main content for Walrus
  userAddress: string;
  signature_base64: string;
  signedMessageBytes_base64: string;
  publicKey_base64: string;
  signatureScheme: string;
  
  description?: string;
  coverImageWalrusUrl?: string; // Full URL from Walrus for the cover (as uploaded by useFiles hook)

  mintPrice?: string; 
  mintCapacity?: string;
  royaltyFeeBps?: number; 
  
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
}

// API functions
export const talesApi = {
  // Get all tales with pagination - should now return TaleSummary[]
  async getTales(limit = 10, offset = 0): Promise<TaleSummary[]> {
    const response = await fetch(`${API_BASE_URL}/tales?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },

  // Get a single tale summary by ID - should return TaleSummary
  async getTale(id: string): Promise<TaleSummary> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },

  // Get a tale with full content - should return TaleWithContent
  async getTaleWithContent(id: string): Promise<TaleWithContent> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}/full`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },

  // Create a new tale (legacy - use initiatePublication)
  // This might need to be updated or removed if initiatePublication is the sole way.
  // If kept, it should align with backend expectations and potentially return TaleSummary.
  async createTale(tale: CreateTalePayload): Promise<TaleSummary> { 
    const response = await fetch(`${API_BASE_URL}/tales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tale),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },

  // Initiate publication flow - should return TaleSummary of the created tale
  async initiatePublication(payload: FrontendInitiatePublicationDto): Promise<TaleSummary> { 
    const response = await fetch(`${API_BASE_URL}/tales/initiate-publication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API error: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Update a tale - should align with TaleSummary or relevant update DTO and return type
  async updateTale(id: string, tale: UpdateTalePayload): Promise<TaleSummary> {
    const response = await fetch(`${API_BASE_URL}/tales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tale),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },

  // Delete a tale - return type might be void or a confirmation
  async deleteTale(id: string): Promise<void> { // Or TaleSummary if backend returns the deleted item
    const response = await fetch(`${API_BASE_URL}/tales/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    // return await response.json(); // If backend returns something
  },

  // Upload a cover image - this remains the same
  async uploadCoverImage(file: File): Promise<UploadCoverResponse> {
    const formData = new FormData();
    formData.append('coverImage', file);
    const response = await fetch(`${API_BASE_URL}/files/upload-cover-to-walrus`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },
}; 