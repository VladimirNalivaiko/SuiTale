import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for all Walrus-related errors
 */
export class WalrusException extends HttpException {
    constructor(
        message: string,
        status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        public readonly context?: Record<string, any>
    ) {
        super(message, status);
        this.name = 'WalrusException';
    }
}

/**
 * Thrown when blob encoding fails
 */
export class BlobEncodingException extends WalrusException {
    constructor(message: string, context?: Record<string, any>) {
        super(`Blob encoding failed: ${message}`, HttpStatus.BAD_REQUEST, context);
        this.name = 'BlobEncodingException';
    }
}

/**
 * Thrown when storage cost calculation fails
 */
export class StorageCostException extends WalrusException {
    constructor(message: string, context?: Record<string, any>) {
        super(`Storage cost calculation failed: ${message}`, HttpStatus.SERVICE_UNAVAILABLE, context);
        this.name = 'StorageCostException';
    }
}

/**
 * Thrown when transaction building fails
 */
export class TransactionBuildException extends WalrusException {
    constructor(message: string, context?: Record<string, any>) {
        super(`Transaction building failed: ${message}`, HttpStatus.BAD_REQUEST, context);
        this.name = 'TransactionBuildException';
    }
}

/**
 * Thrown when dry run fails
 */
export class DryRunException extends WalrusException {
    constructor(message: string, context?: Record<string, any>) {
        super(`Transaction dry run failed: ${message}`, HttpStatus.BAD_REQUEST, context);
        this.name = 'DryRunException';
    }
}

/**
 * Thrown when Walrus network is unavailable
 */
export class WalrusNetworkException extends WalrusException {
    constructor(message: string, context?: Record<string, any>) {
        super(`Walrus network error: ${message}`, HttpStatus.SERVICE_UNAVAILABLE, context);
        this.name = 'WalrusNetworkException';
    }
}

/**
 * Thrown when user has insufficient balance
 */
export class InsufficientBalanceException extends WalrusException {
    constructor(
        required: { sui?: string; wal?: string },
        current: { sui?: string; wal?: string },
        context?: Record<string, any>
    ) {
        const message = `Insufficient balance. Required: ${required.sui ? `${required.sui} SUI` : ''} ${required.wal ? `${required.wal} WAL` : ''}. Current: ${current.sui ? `${current.sui} SUI` : ''} ${current.wal ? `${current.wal} WAL` : ''}`;
        super(message, HttpStatus.PAYMENT_REQUIRED, { ...context, required, current });
        this.name = 'InsufficientBalanceException';
    }
}

/**
 * Thrown when blob content retrieval fails
 */
export class BlobRetrievalException extends WalrusException {
    constructor(blobId: string, message: string, context?: Record<string, any>) {
        super(`Failed to retrieve blob ${blobId}: ${message}`, HttpStatus.NOT_FOUND, { ...context, blobId });
        this.name = 'BlobRetrievalException';
    }
}

/**
 * Thrown when configuration is missing or invalid
 */
export class WalrusConfigurationException extends WalrusException {
    constructor(configKey: string, context?: Record<string, any>) {
        super(`Missing or invalid Walrus configuration: ${configKey}`, HttpStatus.INTERNAL_SERVER_ERROR, { ...context, configKey });
        this.name = 'WalrusConfigurationException';
    }
} 