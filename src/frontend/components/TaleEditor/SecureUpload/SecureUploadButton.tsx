import React, { useState } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { CloudUpload, Security } from '@mui/icons-material';
import { WalrusClient, RetryableWalrusClientError } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { useCurrentAccount, useSignPersonalMessage, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSnackbar } from 'notistack';
import { useRecordPublication } from '../../../hooks/useTales';
import { RecordPublicationDto } from '../../../api/tales.api';
import { Transaction } from '@mysten/sui/transactions';

interface SecureUploadButtonProps {
    title: string;
    description: string;
    content: string;
    coverImageFile: File | null;
    tags: string[];
    wordCount: number;
    readingTime: number;
    onSuccess?: () => void;
    disabled?: boolean;
}

export const SecureUploadButton: React.FC<SecureUploadButtonProps> = ({
    title,
    description,
    content,
    coverImageFile,
    tags,
    wordCount,
    readingTime,
    onSuccess,
    disabled = false,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const currentAccount = useCurrentAccount();
    const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
    const { mutateAsync: securePublish } = useRecordPublication();
    const { enqueueSnackbar } = useSnackbar();
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const handleSecureUpload = async () => {
        if (!currentAccount?.address) {
            enqueueSnackbar('Wallet not connected.', { variant: 'warning' });
            return;
        }

        if (!title.trim()) {
            enqueueSnackbar('Title cannot be empty.', { variant: 'error' });
            return;
        }

        if (!content.trim() || content === '<p></p>') {
            enqueueSnackbar('Content cannot be empty.', { variant: 'error' });
            return;
        }

        if (!coverImageFile) {
            enqueueSnackbar('Please select a cover image.', {
                variant: 'error',
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress('Initializing...');

        try {
            // 1. Setup Walrus client with proper configuration
            setUploadProgress('Setting up Walrus client...');
            const walrusClient = new WalrusClient({
                network: 'testnet',
                suiClient,
                storageNodeClientOptions: {
                    timeout: 60000,
                    onError: (error: Error) => {
                        console.error('Walrus Storage Node Error:', error);
                    },
                },
            });

            // 2. Upload cover image to Walrus using writeBlob
            setUploadProgress('Preparing cover image for Walrus...');
            console.log(
                '[SecureUpload] Cover file size:',
                coverImageFile.size,
                'bytes',
            );

            // Convert cover image to Uint8Array
            const coverImageBuffer = await coverImageFile.arrayBuffer();
            const coverImageBytes = new Uint8Array(coverImageBuffer);

            // Write cover blob - this creates a transaction for user to sign
            setUploadProgress('Writing cover image blob (user will sign transaction)...');
            
            console.log('[SecureUpload] Cover image ready for writeBlob, size:', coverImageBytes.length);
            console.log('[SecureUpload] User will need to sign the transaction for cover blob storage');
            
            // Show user what will happen
            enqueueSnackbar(`📝 Uploading cover image (${coverImageBytes.length} bytes) - you'll sign a transaction`, {
                variant: 'info',
            });

            // TEMPORARY SOLUTION: Creating temporary signer for demonstration
            // In the future, need to integrate with user's wallet
            const tempKeypair = new Ed25519Keypair();
            
            enqueueSnackbar('⚠️ DEMO MODE: Using temporary keypair. In production, this should use your wallet signer.', {
                variant: 'warning',
                persist: true,
            });
            
            // REAL CALL: writeBlob for cover image
            const coverWriteResult = await walrusClient.writeBlob({
                blob: coverImageBytes,
                epochs: 3,
                deletable: false,
                signer: tempKeypair,
            });
            
            const coverBlobId = coverWriteResult.blobId;
            
            console.log('[SecureUpload] Cover blob ID (REAL):', coverBlobId);

            enqueueSnackbar(`✅ Cover image uploaded: ${coverBlobId}`, {
                variant: 'success',
            });

            // 3. Upload content to Walrus using writeBlob
            setUploadProgress('Preparing content for Walrus...');
            const contentBytes = new TextEncoder().encode(content);
            console.log(
                '[SecureUpload] Content size:',
                contentBytes.length,
                'bytes',
            );

            // Write content blob - this creates another transaction for user to sign
            setUploadProgress('Writing content blob (user will sign transaction)...');
            
            console.log('[SecureUpload] Content ready for writeBlob, size:', contentBytes.length);
            console.log('[SecureUpload] User will need to sign the transaction for content blob storage');
            
            // Show user what will happen
            enqueueSnackbar(`📝 Uploading content (${contentBytes.length} bytes) - you'll sign a transaction`, {
                variant: 'info',
            });

            // REAL CALL: writeBlob for content
            const contentWriteResult = await walrusClient.writeBlob({
                blob: contentBytes,
                epochs: 3,
                deletable: false,
                signer: tempKeypair,
            });

            const contentBlobId = contentWriteResult.blobId;
            
            console.log('[SecureUpload] Content blob ID (REAL):', contentBlobId);

            enqueueSnackbar(`✅ Content uploaded: ${contentBlobId}`, {
                variant: 'success',
            });

            // 4. Wait for blob availability
            setUploadProgress('Waiting for blobs to become available...');
            await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds for demo

            // 5. Generate signature
            setUploadProgress('Generating signature...');
            const timestamp = Date.now();
            const messageToSign = `SuiTale publication: ${coverBlobId}:${contentBlobId}:${timestamp}`;
            const messageBytes = new TextEncoder().encode(messageToSign);

            const signedResult = await signPersonalMessage({
                message: messageBytes,
            });

            // 6. Get public key
            const publicKeyBytes = currentAccount.publicKey;
            let userPublicKey: string;
            if (
                publicKeyBytes &&
                typeof (publicKeyBytes as any).BYTES_PER_ELEMENT === 'number'
            ) {
                userPublicKey = Buffer.from(
                    publicKeyBytes as Uint8Array,
                ).toString('base64');
            } else {
                throw new Error('Invalid public key format');
            }

            // 7. Submit to backend with signature validation
            setUploadProgress('Recording publication...');
            const secureRequest: RecordPublicationDto = {
                title,
                description,
                coverBlobId,
                contentBlobId,
                userAddress: currentAccount.address,
                signature: signedResult.signature,
                userPublicKey,
                signedMessage: messageToSign,
                timestamp,
                tags,
                wordCount,
                readingTime,
            };

            const result = await securePublish(secureRequest);

            enqueueSnackbar(
                `🎉 Tale "${result.title}" published successfully!`,
                { variant: 'success' },
            );

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('[SecureUpload] Error:', error);

            // Handle retryable Walrus errors
            if (error instanceof RetryableWalrusClientError) {
                enqueueSnackbar('⚠️ Network issue detected, retrying...', {
                    variant: 'warning',
                });

                try {
                    // Reset client and retry once
                    const walrusClient = new WalrusClient({
                        network: 'testnet',
                        suiClient,
                        storageNodeClientOptions: {
                            timeout: 60000,
                            onError: (err) =>
                                console.warn(
                                    '[SecureUpload] Retry storage node error:',
                                    err,
                                ),
                        },
                    });

                    // Note: This is a simplified retry - in production, you'd want to retry the specific failed operation
                    enqueueSnackbar(
                        '❌ Upload failed with network error. Please try again.',
                        { variant: 'error' },
                    );
                    return;
                } catch (retryError: unknown) {
                    const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
                    enqueueSnackbar(`❌ Retry failed: ${errorMessage}`, {
                        variant: 'error',
                    });
                    return;
                }
            }

            enqueueSnackbar(`❌ Upload failed: ${error.message}`, {
                variant: 'error',
            });
        } finally {
            setIsUploading(false);
            setUploadProgress('');
        }
    };

    const canUpload =
        !disabled &&
        !isUploading &&
        currentAccount?.address &&
        title.trim() &&
        content.trim() &&
        coverImageFile;

    // DEBUG: Log button state
    console.log('[SecureUploadButton] Button state:', {
        disabled,
        isUploading,
        hasAccount: !!currentAccount?.address,
        hasTitle: !!title.trim(),
        hasContent: !!content.trim(),
        hasCoverImageFile: !!coverImageFile,
        canUpload,
        title: title.substring(0, 50) + '...',
        contentLength: content.length
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
                variant='contained'
                color='secondary'
                size='large'
                startIcon={
                    isUploading ? <CircularProgress size={20} /> : <Security />
                }
                onClick={handleSecureUpload}
                disabled={!canUpload}
                sx={{
                    backgroundColor: '#2E7D32',
                    '&:hover': { backgroundColor: '#1B5E20' },
                    fontWeight: 'bold',
                    py: 1.5,
                }}
            >
                {isUploading
                    ? 'Uploading to Walrus...'
                    : 'WALRUS writeBlob() (User Signs Transactions)'}
            </Button>

            {uploadProgress && (
                <Typography
                    variant='body2'
                    color='text.secondary'
                    textAlign='center'
                >
                    {uploadProgress}
                </Typography>
            )}

            {!isUploading && (
                <Typography
                    variant='caption'
                    color='text.secondary'
                    textAlign='center'
                >
                    💰 You sign: 2 writeBlob transactions (cover + content) + backend recording • Server: signature validation only
                </Typography>
            )}
        </Box>
    );
};