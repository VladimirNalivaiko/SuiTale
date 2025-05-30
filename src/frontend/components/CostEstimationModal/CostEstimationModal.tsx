import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Divider,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Storage as StorageIcon,
    Upload as UploadIcon,
    Verified as VerifiedIcon,
    Article as ArticleIcon,
    AccountBalanceWallet as WalletIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

interface CostEstimationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    costData?: {
        costs: {
            contentStorage: { wal: number; mist: string };
            coverStorage: { wal: number; mist: string };
            registrationGas: { sui: number; mist: string };
            certificationGas: { sui: number; mist: string };
            nftCreationGas: { sui: number; mist: string };
            total: {
                walTokens: number;
                suiTokens: number;
                walMist: string;
                suiMist: string;
            };
        };
    };
    loading?: boolean;
    error?: string;
    title?: string;
    contentSize?: number;
    coverImageSize?: number;
}

export const CostEstimationModal: React.FC<CostEstimationModalProps> = ({
    open,
    onClose,
    onConfirm,
    costData,
    loading = false,
    error,
    title,
    contentSize,
    coverImageSize,
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTokenAmount = (amount: number, decimals: number = 6): string => {
        return amount.toFixed(decimals);
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Calculating costs...
                    </Typography>
                    <Typography color="text.secondary">
                        Encoding blobs and estimating Walrus storage costs
                    </Typography>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Cost Estimation Error</DialogTitle>
                <DialogContent>
                    <Alert severity="error">
                        Failed to estimate costs: {error}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (!costData || !costData.costs) {
        return null;
    }

    const { costs } = costData;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WalletIcon color="primary" />
                    <Typography variant="h5">
                        Publication Cost Breakdown
                    </Typography>
                </Box>
                {title && (
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                        "{title}"
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent>
                {/* File sizes info */}
                <Card sx={{ mb: 3 }} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            📁 File Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Content Size
                                </Typography>
                                <Typography variant="body1">
                                    {contentSize ? formatFileSize(contentSize) : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Cover Image Size
                                </Typography>
                                <Typography variant="body1">
                                    {coverImageSize ? formatFileSize(coverImageSize) : 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Walrus Storage Costs */}
                <Card sx={{ mb: 3 }} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            🌊 Walrus Storage Costs
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <StorageIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Content Storage"
                                    secondary="5 epochs (~30 days)"
                                />
                                <Chip
                                    label={`${formatTokenAmount(costs.contentStorage.wal)} WAL`}
                                    color="primary"
                                    variant="outlined"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <StorageIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Cover Image Storage"
                                    secondary="5 epochs (~30 days)"
                                />
                                <Chip
                                    label={`${formatTokenAmount(costs.coverStorage.wal)} WAL`}
                                    color="primary"
                                    variant="outlined"
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Transaction Costs */}
                <Card sx={{ mb: 3 }} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="secondary">
                            ⛽ Transaction Gas Costs
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <UploadIcon color="secondary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Registration Transaction"
                                    secondary="Storage creation + blob registration"
                                />
                                <Chip
                                    label={`${formatTokenAmount(costs.registrationGas.sui)} SUI`}
                                    color="secondary"
                                    variant="outlined"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedIcon color="secondary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Certification Transaction"
                                    secondary="Blob availability confirmation"
                                />
                                <Chip
                                    label={`${formatTokenAmount(costs.certificationGas.sui)} SUI`}
                                    color="secondary"
                                    variant="outlined"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <ArticleIcon color="secondary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="NFT Creation Transaction"
                                    secondary="Tale collection creation"
                                />
                                <Chip
                                    label={`${formatTokenAmount(costs.nftCreationGas.sui)} SUI`}
                                    color="secondary"
                                    variant="outlined"
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Transaction Flow Info */}
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>📝 Transaction Flow:</strong>
                    </Typography>
                    <Typography variant="body2" component="div">
                        1. <strong>Registration:</strong> Payment for storage space (placeholder transaction)<br/>
                        2. <strong>Upload:</strong> Upload blob data to Walrus storage nodes (simulation)<br/>
                        3. <strong>Certification:</strong> Certification fee payment (placeholder transaction)<br/>
                        4. <strong>NFT Creation:</strong> Create Tale NFT collection with blob references (real)
                    </Typography>
                </Alert>

                {/* Placeholder Warning */}
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        🚧 <strong>Development Version:</strong> Walrus transactions are placeholder SUI transfers. Real Walrus Move API integration is planned for future releases. Content upload is simulated but NFT creation is real.
                    </Typography>
                </Alert>

                {/* Total Cost Summary */}
                <Card sx={{ bgcolor: 'background.default', border: '2px solid' }} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            💰 Total Cost Summary
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary" gutterBottom>
                                        {formatTokenAmount(costs.total.walTokens, 4)}
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        WAL
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Storage Costs
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="secondary" gutterBottom>
                                        {formatTokenAmount(costs.total.suiTokens, 4)}
                                    </Typography>
                                    <Typography variant="h6" color="secondary">
                                        SUI
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Gas Fees
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Wallet balance reminder */}
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        ⚠️ <strong>Make sure your wallet has sufficient balance:</strong><br/>
                        • WAL tokens for storage costs<br/>
                        • SUI tokens for transaction fees<br/>
                        • You will sign 3 separate transactions
                    </Typography>
                </Alert>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} size="large">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    size="large"
                    startIcon={<WalletIcon />}
                >
                    Proceed with Publication
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 