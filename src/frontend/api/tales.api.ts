// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// --- Updated Tale Interfaces ---

// Interface for Tale summary/list item
export interface TaleSummary {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string; // Legacy field - Stores the full URL (backward compatibility)
  coverImageBlobId?: string; // NEW: Cover image blob ID in Walrus
  coverImageWalrusUrl?: string; // NEW: Built Walrus URL for cover image
  contentBlobId: string; // Stores the Blob ID for the main content in Walrus
  tags: string[];
  wordCount: number;
  readingTime: number;
  authorId?: string; // Or a more detailed Author object if you have one
  createdAt: string;
  updatedAt: string;
  suiTxDigest?: string;
  suiObjectId?: string;
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
  userAddress: string; // Changed back from authorAddress
  signature_base64: string;
  signedMessageBytes_base64: string; // Added back
  publicKey_base64: string;
  signatureScheme: string;
  
  description?: string;
  coverImageWalrusUrl?: string; // Full URL from Walrus for the cover (as uploaded by useFiles hook)

  mintPrice: string; // Changed to string
  mintCapacity: string; // Changed to string
  royaltyFeeBps?: number; 
  
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
}

// Added DTOs based on backend refactoring
export interface TaleDataForRecord {
  title: string;
  description: string;
  contentBlobId: string; 
  coverImageWalrusUrl: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
  authorAddress: string;
  mintPrice: number; // MIST
  mintCapacity: number;
  royaltyFeeBps: number;
}

export interface PreparePublicationResultDto {
  transactionBlockBytes: string;
  taleDataForRecord: TaleDataForRecord;
}

export interface RecordPublicationDto {
  txDigest: string;
  taleDataForRecord: TaleDataForRecord;
}

// --- NEW: Batch Publication Types ---

export interface BatchPublicationRequest {
  title: string;
  description: string;
  content: string;
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
  userAddress: string;
}

export interface BatchPublicationResponse {
  costs: {
    coverBlob: { wal: number; mist: string };
    contentBlob: { wal: number; mist: string };
    totalGas: { sui: number; mist: string };
    total: {
      walTokens: number;
      suiTokens: number;
      walMist: string;
      suiMist: string;
    };
  };
  transaction: string; // serialized batch transaction
  metadata: {
    coverBlobId: string;
    contentBlobId: string;
    estimatedTime: string;
  };
}

export interface RecordBatchPublicationRequest {
  suiTransactionDigest: string;
  coverBlobId: string;
  contentBlobId: string;
  title: string;
  description: string;
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
  userAddress: string;
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

  // Renamed from initiatePublication to preparePublication to match backend service
  async preparePublication(payload: FrontendInitiatePublicationDto): Promise<PreparePublicationResultDto> { 
    const response = await fetch(`${API_BASE_URL}/tales/prepare-publication`, { // Endpoint updated
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

  // New function to record publication
  async recordPublication(payload: RecordPublicationDto): Promise<TaleSummary> {
    const response = await fetch(`${API_BASE_URL}/tales/record-publication`, { // New endpoint
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
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/tales/upload/cover`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API error: ${response.status} ${response.statusText}` }));
      console.error('Upload cover image failed:', errorData);
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // --- NEW: Batch Publication API ---

  // Prepare batch publication with cover image + content
  async prepareBatchPublication(
    coverImage: File,
    data: BatchPublicationRequest
  ): Promise<BatchPublicationResponse> {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('content', data.content);
    formData.append('userAddress', data.userAddress);
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    if (data.wordCount !== undefined) {
      formData.append('wordCount', data.wordCount.toString());
    }
    if (data.readingTime !== undefined) {
      formData.append('readingTime', data.readingTime.toString());
    }

    const response = await fetch(`${API_BASE_URL}/tales/prepare-batch-publication`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `API error: ${response.status} ${response.statusText}` 
      }));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Record batch publication after user signs transaction
  async recordBatchPublication(payload: RecordBatchPublicationRequest): Promise<TaleSummary> {
    const response = await fetch(`${API_BASE_URL}/tales/record-batch-publication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `API error: ${response.status} ${response.statusText}` 
      }));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },
}; 