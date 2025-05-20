import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  QueryKey
} from '@tanstack/react-query';
import { 
  talesApi, 
  TaleSummary,
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
  options?: UseQueryOptions<TaleSummary[], Error, TaleSummary[], QueryKey>
) => {
  return useQuery({
    queryKey: taleKeys.list({ limit, offset }),
    queryFn: () => talesApi.getTales(limit, offset),
    ...options,
  });
};

/**
 * Get a single tale summary by ID
 */
export const useTale = (
  id: string,
  options?: UseQueryOptions<TaleSummary, Error, TaleSummary, QueryKey>
) => {
  return useQuery({
    queryKey: taleKeys.detail(id),
    queryFn: () => talesApi.getTale(id),
    enabled: !!id,
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
    enabled: !!id,
    ...options,
  });
};

/**
 * Create a new tale (Legacy or specific use case)
 */
export const useCreateTale = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TaleSummary, Error, CreateTalePayload>({
    mutationFn: (tale: CreateTalePayload) => talesApi.createTale(tale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
    },
  });
};

/**
 * Initiate Publication for a new tale
 */
export const useInitiatePublication = () => {
  const queryClient = useQueryClient();

  return useMutation<TaleSummary, Error, FrontendInitiatePublicationDto>({
    mutationFn: (payload: FrontendInitiatePublicationDto) => talesApi.initiatePublication(payload),
    onSuccess: (createdTaleSummary) => {
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
      // Optionally, pre-fill the cache for the new tale's summary
      // queryClient.setQueryData(taleKeys.detail(createdTaleSummary.id), createdTaleSummary);
    },
  });
};

/**
 * Update a tale
 */
export const useUpdateTale = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<TaleSummary, Error, UpdateTalePayload>({
    mutationFn: (tale: UpdateTalePayload) => talesApi.updateTale(id, tale),
    onSuccess: (updatedTaleSummary) => {
      queryClient.setQueryData(taleKeys.detail(id), updatedTaleSummary);
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
    },
  });
};

/**
 * Delete a tale
 */
export const useDeleteTale = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => talesApi.deleteTale(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: taleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
    },
  });
};
