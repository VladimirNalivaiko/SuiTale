import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
  DialogActions,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalance as WalrusIcon,
  CurrencyExchange as SuiIcon,
  Image as CoverIcon,
  Article as ContentIcon,
  LocalGasStation as GasIcon,
  Timer as TimeIcon,
} from '@mui/icons-material';
import { BatchPublicationResponse } from '../../../api/tales.api';

interface CostBreakdownProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  costData: BatchPublicationResponse | null;
  isLoading?: boolean;
  isConfirming?: boolean;
}

const formatTokens = (tokens: number, symbol: string) => {
  if (tokens < 0.001) {
    return `<0.001 ${symbol}`;
  }
  return `${tokens.toFixed(6)} ${symbol}`;
};

const formatMist = (mist: string) => {
  const mistNumber = parseInt(mist);
  if (mistNumber < 1000) {
    return `${mistNumber} MIST`;
  }
  if (mistNumber < 1000000) {
    return `${(mistNumber / 1000).toFixed(1)}K MIST`;
  }
  return `${(mistNumber / 1000000).toFixed(2)}M MIST`;
};

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  open,
  onClose,
  onConfirm,
  costData,
  isLoading = false,
  isConfirming = false,
}) => {
  if (!costData && !isLoading) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          📊 Publication Cost Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review costs before publishing your tale
        </Typography>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ py: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body1" textAlign="center">
              Calculating costs...
            </Typography>
          </Box>
        ) : costData ? (
          <Box>
            {/* Storage Costs */}
            <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.8)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WalrusIcon color="primary" />
                  Walrus Storage Costs
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CoverIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Cover Image
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {formatTokens(costData.costs.coverBlob.wal, 'WAL')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatMist(costData.costs.coverBlob.mist)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ContentIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Content
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {formatTokens(costData.costs.contentBlob.wal, 'WAL')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatMist(costData.costs.contentBlob.mist)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Gas Costs */}
            <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.8)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GasIcon color="secondary" />
                  Transaction Gas
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SuiIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Batch Transaction
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {formatTokens(costData.costs.totalGas.sui, 'SUI')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatMist(costData.costs.totalGas.mist)}
                </Typography>
              </CardContent>
            </Card>

            {/* Total */}
            <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  💰 Total Cost
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Storage (WAL)
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatTokens(costData.costs.total.walTokens, 'WAL')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Gas (SUI)
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatTokens(costData.costs.total.suiTokens, 'SUI')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Chip 
                icon={<TimeIcon />}
                label={`Est. Time: ${costData.metadata.estimatedTime}`}
                variant="outlined"
                size="small"
              />
              
              <Typography variant="caption" color="text.secondary">
                Atomic operation • All or nothing
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
              borderRadius: 1,
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Typography variant="body2" color="success.main" fontWeight="medium" gutterBottom>
                ✅ Benefits of Batch Upload:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • One transaction instead of 7 separate ones<br/>
                • Atomic operation - all content uploaded together<br/>
                • Faster completion (~30-60 seconds)<br/>
                • Ready for NFT minting anytime
              </Typography>
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={isConfirming}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={isLoading || isConfirming || !costData}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            color: 'white',
            fontWeight: 'bold',
            minWidth: 120,
          }}
        >
          {isConfirming ? 'Publishing...' : 'Confirm & Publish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 