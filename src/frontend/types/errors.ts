/**
 * Frontend error types for better error handling
 */

export interface ErrorContext {
  [key: string]: any;
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class WalletError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'WALLET_ERROR', context);
    this.name = 'WalletError';
  }
}

export class TransactionError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'TRANSACTION_ERROR', context);
    this.name = 'TransactionError';
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'FILE_UPLOAD_ERROR', context);
    this.name = 'FileUploadError';
  }
}

/**
 * Enhanced error with user-friendly messages
 */
export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  retryable: boolean;
  context?: ErrorContext;
}

/**
 * Convert API error to user-friendly format
 */
export function parseApiError(error: any): UserFriendlyError {
  const defaultError: UserFriendlyError = {
    title: 'Unexpected Error',
    message: 'Something went wrong. Please try again.',
    retryable: true
  };

  if (!error) return defaultError;

  // Handle specific error types from backend
  if (error.message) {
    // Walrus-specific errors
    if (error.message.includes('Blob encoding failed')) {
      return {
        title: 'File Processing Error',
        message: 'Failed to process your file. Please check the file format and try again.',
        action: 'Try uploading a different image or reduce file size',
        retryable: true,
        context: error.context
      };
    }

    if (error.message.includes('Storage cost calculation failed')) {
      return {
        title: 'Network Issue',
        message: 'Unable to calculate storage costs. Walrus network may be temporarily unavailable.',
        action: 'Please wait a moment and try again',
        retryable: true,
        context: error.context
      };
    }

    if (error.message.includes('Transaction building failed')) {
      return {
        title: 'Transaction Error',
        message: 'Failed to prepare your publication transaction.',
        action: 'Please check your wallet connection and try again',
        retryable: true,
        context: error.context
      };
    }

    if (error.message.includes('Insufficient balance')) {
      return {
        title: 'Insufficient Balance',
        message: error.message,
        action: 'Please add more SUI or WAL tokens to your wallet',
        retryable: false,
        context: error.context
      };
    }

    if (error.message.includes('too large')) {
      return {
        title: 'File Too Large',
        message: error.message,
        action: 'Please reduce your file size and try again',
        retryable: false,
        context: error.context
      };
    }

    if (error.message.includes('Walrus network error')) {
      return {
        title: 'Network Unavailable',
        message: 'Walrus storage network is temporarily unavailable.',
        action: 'Please try again in a few minutes',
        retryable: true,
        context: error.context
      };
    }

    // Wallet errors
    if (error.message.includes('User rejected') || error.message.includes('cancelled')) {
      return {
        title: 'Transaction Cancelled',
        message: 'You cancelled the transaction.',
        action: 'Click "Publish" again to retry',
        retryable: true
      };
    }

    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server.',
        action: 'Please check your internet connection and try again',
        retryable: true
      };
    }
  }

  // HTTP status code errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: 'The provided data is invalid. Please check your input and try again.',
          retryable: false
        };
      case 402:
        return {
          title: 'Insufficient Balance',
          message: 'You don\'t have enough tokens for this operation.',
          action: 'Please add more SUI or WAL tokens to your wallet',
          retryable: false
        };
      case 413:
        return {
          title: 'File Too Large',
          message: 'Your file is too large to upload.',
          action: 'Please reduce file size and try again',
          retryable: false
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable.',
          action: 'Please try again in a few minutes',
          retryable: true
        };
    }
  }

  return {
    ...defaultError,
    message: error.message || defaultError.message,
    context: error.context
  };
} 