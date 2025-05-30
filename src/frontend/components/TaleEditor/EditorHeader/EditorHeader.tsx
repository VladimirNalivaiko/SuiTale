import React from 'react';
import { Box, Button, IconButton, Typography, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import { generatePath, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../types/constants';

// Import necessary hooks and ConnectModal component
import {
    ConnectModal, // Modal window component
    useCurrentAccount,
    useDisconnectWallet,
    // useConnectWallet and useWallets are not used yet, but they exist
} from '@mysten/dapp-kit';

interface EditorHeaderProps {
    wordCount: number;
    readingTime: number;
    lastSaved: Date | null;
    isSaving: boolean;
    isUploadingCover?: boolean;
    onTogglePreview: () => void;
    onToggleMetadata: () => void;
    onSave: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
    wordCount,
    readingTime,
    lastSaved,
    isSaving,
    isUploadingCover,
    onTogglePreview,
    onToggleMetadata,
    onSave,
}) => {
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { mutate: disconnectWallet } = useDisconnectWallet();

    const handleBack = () => {
        navigate(generatePath(ROUTES.INITIAL_ROUTE));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid #333',
            }}
        >
            <IconButton color='inherit' aria-label='back' onClick={handleBack}>
                <ArrowBackIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title='Reading stats'>
                    <Typography
                        variant='body2'
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 2,
                            color: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        <TimerIcon fontSize='small' sx={{ mr: 0.5 }} />
                        {wordCount} words · {readingTime} min read
                    </Typography>
                </Tooltip>

                <Tooltip title='Article settings'>
                    <IconButton
                        color='inherit'
                        onClick={onToggleMetadata}
                        sx={{ mr: 1 }}
                    >
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>

                <Typography variant='body2' sx={{ mr: 2 }}>
                    {isSaving
                        ? 'Saving...'
                        : lastSaved
                          ? `Saved at ${lastSaved.toLocaleTimeString()}`
                          : 'Not saved'}
                </Typography>
                <Button
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={onTogglePreview}
                    startIcon={<VisibilityIcon />}
                    sx={{ mr: 1 }}
                >
                    Preview
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    onClick={onSave}
                    startIcon={<SaveIcon />}
                    disabled={isSaving || isUploadingCover}
                    sx={{ mr: 1 }}
                >
                    {isSaving
                        ? 'Publishing...'
                        : isUploadingCover
                          ? 'Uploading Cover...'
                          : 'Publish'}
                </Button>
                {/* Custom Wallet Connect/Disconnect Button */}
                {currentAccount ? (
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        onClick={() => disconnectWallet()}
                        startIcon={<LogoutIcon fontSize='small' />}
                        sx={{ mr: 1 }}
                    >
                        {currentAccount.address.slice(0, 6)}...
                        {currentAccount.address.slice(-4)}
                    </Button>
                ) : (
                    <ConnectModal
                        trigger={
                            <Button
                                variant='contained'
                                color='primary'
                                size='small'
                                startIcon={
                                    <AccountBalanceWalletIcon fontSize='small' />
                                }
                                sx={{ mr: 1 }}
                            >
                                Connect Wallet
                            </Button>
                        }
                    />
                )}
            </Box>
        </Box>
    );
};

export default EditorHeader;
