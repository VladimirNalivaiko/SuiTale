export interface WalrusPackageConfig {
    /** The system object ID of the Walrus package */
    systemObjectId: string;
    /** The staking pool ID of the Walrus package */
    stakingPoolId: string;
    subsidiesObjectId?: string;
    exchangeIds?: string[];
}