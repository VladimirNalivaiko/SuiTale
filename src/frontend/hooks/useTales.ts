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
  FrontendInitiatePublicationDto,
  PreparePublicationResultDto,
  RecordPublicationDto
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
 * Hook for preparing a tale publication.
 * Calls the `preparePublication` API endpoint.
 */
export const usePreparePublication = () => {
  return useMutation<PreparePublicationResultDto, Error, FrontendInitiatePublicationDto>({
    mutationFn: (payload: FrontendInitiatePublicationDto) => talesApi.preparePublication(payload),
    // onSuccess and onError can be handled by the component using the hook
  });
};

/**
 * Hook for recording a tale publication.
 * Calls the `recordPublication` API endpoint.
 */
export const useRecordPublication = () => {
  const queryClient = useQueryClient();
  return useMutation<TaleSummary, Error, RecordPublicationDto>({
    mutationFn: (payload: RecordPublicationDto) => talesApi.recordPublication(payload),
    onSuccess: (newTale) => {
      // Invalidate tales list to refetch
      queryClient.invalidateQueries({ queryKey: taleKeys.lists() });
      // Optionally, update the cache for the newly created tale
      queryClient.setQueryData(taleKeys.detail(newTale.id), newTale);
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
