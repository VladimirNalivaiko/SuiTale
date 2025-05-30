import { useMutation } from '@tanstack/react-query';
import { 
  walrusService,
  WalrusUploadEstimate, 
  WalrusUploadResult,
  SignAndExecuteFunction
} from '../services/walrus.service';

export interface UseEstimateWalrusUploadCostParams {
  content: string;
  coverImage: File;
}

export interface UseWalrusUploadParams {
  content: string;
  coverImage: File;
  userAddress: string;
  signAndExecuteTransaction: SignAndExecuteFunction;
  onProgress?: (step: string, progress: number) => void;
}

/**
 * Hook for estimating Walrus upload costs using real SDK
 */
export const useEstimateWalrusUploadCost = () => {
  return useMutation<WalrusUploadEstimate, Error, UseEstimateWalrusUploadCostParams>({
    mutationFn: async ({ content, coverImage }) => {
      return walrusService.estimateUploadCosts(content, coverImage);
    },
  });
};

/**
 * Hook for uploading content to Walrus using real SDK
 */
export const useWalrusUpload = () => {
  return useMutation<WalrusUploadResult, Error, UseWalrusUploadParams>({
    mutationFn: async (params) => {
      return walrusService.uploadToWalrus(params);
    },
  });
};

/**
 * Legacy hook for backward compatibility
 */
export const useClientSideWalrusUpload = useWalrusUpload;

/**
 * Get Walrus service instance for advanced operations
 */
export const useWalrusService = () => {
    return walrusService;
}; 