import { useMutation } from '@tanstack/react-query';
import { talesApi, UploadCoverResponse } from '../api/tales.api';


export const useUploadCoverToWalrus = () => {
  return useMutation<UploadCoverResponse, Error, File>({
    mutationFn: (file: File) => talesApi.uploadCoverImage(file),
  });
}; 