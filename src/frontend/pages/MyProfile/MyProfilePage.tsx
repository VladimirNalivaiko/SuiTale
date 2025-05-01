import React from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { DefaultLayout } from '../../layouts';
import {
  ProfileHeader,
  ProfileAnalytics,
  ProfileEarnings,
  ProfileTransactions,
  ProfileWritingProjects,
  ProfileQuickActions,
  ProfileNotifications,
} from '../../components/Profile';
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";



const MyProfilePage: React.FC = () => {
  // Analytics data
  const analyticsData = [
    { label: "Total Views", value: "45200", increase: 12 },
    { label: "Reactions", value: "12400", increase: 8 },
    { label: "Comments", value: "890", increase: 15 },
    { label: "Followers", value: "1234", increase: 5 },
  ];

  // Earnings data
  const earningsData = [
    { label: "Total Earnings", value: "1234.5 SUI" },
    { label: "This Month", value: "245.8 SUI" },
    { label: "Pending", value: "45.2 SUI" },
  ];

  // Transactions data
  const transactionsData = [
    {
      title: "Tip from 0x123...789",
      date: "2024-04-25",
      amount: "23.4 SUI",
    },
    {
      title: "Premium Story Purchase",
      date: "2024-04-24",
      amount: "45.2 SUI",
    },
  ];

  // Writing projects data
  const writingProjectsData = [
    {
      title: "The Future of Web3",
      lastEdited: "2 hours ago",
      progress: 75,
    },
    {
      title: "Blockchain Evolution",
      lastEdited: "1 day ago",
      progress: 30,
    },
  ];

  // Quick actions data
  const quickActionsData = [
    {
      title: "New Story",
      description: "Start writing a new tale",
    },
    {
      title: "Import Story",
      description: "Import from external source",
    },
    {
      title: "Analytics",
      description: "View detailed statistics",
    },
    {
      title: "Manage Collections",
      description: "Organize your stories",
    },
  ];

  // Notifications data
  const notificationsData = [
    {
      icon: <ThumbUpIcon />,
      message: "Alex Thompson liked your story",
      time: "2 min ago",
    },
    {
      icon: <AttachMoneyIcon />,
      message: "You received 5 SUI tip",
      time: "1 hour ago",
    },
    {
      icon: <CommentIcon />,
      message: "New comment on your story",
      time: "3 hours ago",
    },
  ];

  return (
    <DefaultLayout>
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        bgcolor: '#f7f7ff', 
        minHeight: '100vh',
        mx: 'auto'
      }}>
        <ProfileHeader
          name="Elena Wright"
          wallet="0x8976...1234"
          joinDate="April 2024"
        />

        <Box sx={{ 
          mt: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 }
        }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Left Column */}
            <Grid item xs={12} md={6} lg={6}>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                <ProfileAnalytics analytics={analyticsData} />
                <ProfileEarnings earnings={earningsData} />
                <ProfileTransactions transactions={transactionsData} />
                <ProfileNotifications notifications={notificationsData} />
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6} lg={6}>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                <ProfileWritingProjects projects={writingProjectsData} />
                <ProfileQuickActions actions={quickActionsData} />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DefaultLayout>
  );
};

export default MyProfilePage; 
