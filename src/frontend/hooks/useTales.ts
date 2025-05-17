import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  QueryKey
} from '@tanstack/react-query';
import { 
  talesApi, 
  Tale, 
  TaleWithContent, 
  CreateTalePayload, 
  UpdateTalePayload,
  FrontendInitiatePublicationDto
} from '../api/tales.api';

// Query keys
export const taleKeys = {
  all: ['tales'] as const,
  lists: () => [...taleKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => [...taleKeys.lists(), filters] as const,
  details: () => [...taleKeys.all, 'detail'] as const,
  detail: (id: string) => [...taleKeys.details(), id] as const,
};

// Hooks for tales

/**
 * Get all tales with pagination
 */
export const useTales = (
  limit = 10, 
  offset = 0, 
  options?: UseQueryOptions<Tale[], Error, Tale[], QueryKey>
) => {
  return useQuery({
    queryKey: taleKeys.list({ limit, offset }),
    queryFn: () => talesApi.getTales(limit, offset),
    ...options,
  });
};

/**
 * Get a single tale by ID
 */
export const useTale = (
  id: string,
  options?: UseQueryOptions<Tale, Error, Tale, QueryKey>
) => {
  return useQuery({
    queryKey: taleKeys.detail(id),
    queryFn: () => talesApi.getTale(id),
    ...options,
  });
};

/**
 * Get a tale with full content
 */
export const useTaleWithContent = (
  id: string,
  options?: UseQueryOptions<TaleWithContent, Error, TaleWithContent, QueryKey>
) => {
  return useQuery({
    queryKey: [...taleKeys.detail(id), 'content'],
    queryFn: () => talesApi.getTaleWithContent(id),
    ...options,
  });
};

/**
 * Create a new tale
 */
export const useCreateTale = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Tale, Error, CreateTalePayload>({
    mutationFn: (tale: CreateTalePayload) => talesApi.createTale(tale),
    onSuccess: () => {
      // Invalidate the tales list query to refetch
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
    },
  });
};

/**
 * Initiate Publication for a new tale
 */
export const useInitiatePublication = () => {
  const queryClient = useQueryClient();

  return useMutation<Tale, Error, FrontendInitiatePublicationDto>({
    mutationFn: (payload: FrontendInitiatePublicationDto) => talesApi.initiatePublication(payload),
    onSuccess: (createdTale) => {
      // Invalidate the tales list query to refetch
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
      // Optionally, pre-fill the cache for the new tale's detail
      // queryClient.setQueryData(taleKeys.detail(createdTale.id), createdTale);
    },
    // onError: (error) => { // Optional: specific error handling for this mutation
    //   console.error("Error initiating publication:", error);
    // }
  });
};

/**
 * Update a tale
 */
export const useUpdateTale = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Tale, Error, UpdateTalePayload>({
    mutationFn: (tale: UpdateTalePayload) => talesApi.updateTale(id, tale),
    onSuccess: (updatedTale) => {
      // Update the tale in the cache
      queryClient.setQueryData(taleKeys.detail(id), updatedTale);
      // Invalidate the tales list query to refetch
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
    },
  });
};

/**
 * Delete a tale
 */
export const useDeleteTale = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Tale, Error, string>({
    mutationFn: (id: string) => talesApi.deleteTale(id),
    onSuccess: (_, id) => {
      // Remove the tale from the cache
      queryClient.removeQueries({ queryKey: taleKeys.detail(id) });
      // Invalidate the tales list query to refetch
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
    },
  });
};
