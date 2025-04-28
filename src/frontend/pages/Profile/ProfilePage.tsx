import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";

const ProfilePage: React.FC = () => {
  // Analytics data
  const analyticsData = [
    { label: "Total Views", value: "45200", increase: "+12%" },
    { label: "Reactions", value: "12400", increase: "+8%" },
    { label: "Comments", value: "890", increase: "+15%" },
    { label: "Followers", value: "1234", increase: "+5%" },
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
    <Box sx={{ bgcolor: "#f7f7ff", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          height: 72,
          display: "flex",
          alignItems: "center",
          px: 3,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "#d9d9d9", width: 40, height: 40, mr: 2 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#4318d1",
            }}
          >
            SuiTale
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton sx={{ mr: 2 }}>
            <Badge badgeContent={3} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Chip
            label="0x1234...5678"
            sx={{
              bgcolor: "#f7f7ff",
              color: "#4318d1",
              "& .MuiChip-label": {
                px: 2,
              },
              height: 37,
            }}
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: "#6d28ff",
                  borderRadius: "50%",
                  ml: 1,
                }}
              />
            }
          />
        </Box>
      </Box>

      {/* Profile Banner */}
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            height: 300,
            bgcolor: "#d9d9d9",
            position: "relative",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Avatar
          sx={{
            width: 160,
            height: 160,
            border: "4px solid white",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            position: "absolute",
            bottom: -80,
            left: 52,
            bgcolor: "#d9d9d9",
          }}
        />

        <IconButton
          sx={{
            position: "absolute",
            bottom: -20,
            left: 172,
            bgcolor: "white",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <Box sx={{ height: 100 }} />

        <Box sx={{ pl: 29, mt: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#4318d1" }}
          >
            Elena Wright
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography variant="body1" color="text.secondary">
              0x8976...1234
            </Typography>
            <Box
              sx={{
                width: 4,
                height: 4,
                bgcolor: "#666666",
                borderRadius: "50%",
                mx: 2,
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Joined April 2024
            </Typography>
          </Box>
        </Box>

        <IconButton
          sx={{
            position: "absolute",
            top: 324,
            right: 52,
            border: "1px solid #4318d1",
            borderRadius: 0,
            width: 38,
            height: 38,
          }}
        >
          <EditIcon sx={{ color: "#4318d1" }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Analytics Overview Card */}
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#4318d1", mb: 2 }}
                  >
                    Analytics Overview
                  </Typography>
                  <Stack spacing={3}>
                    {analyticsData.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: "bold",
                              color: "#4318d1",
                            }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: "green" }}>
                          {item.increase}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Earnings Card */}
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#4318d1", mb: 2 }}
                  >
                    Earnings
                  </Typography>
                  <Stack spacing={2}>
                    {earningsData.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color: "#4318d1",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    ))}

                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#4318d1",
                          mb: 1,
                        }}
                      >
                        Recent Transactions
                      </Typography>
                      <Stack spacing={2}>
                        {transactionsData.map((transaction, index) => (
                          <Box
                            key={index}
                            sx={{
                              bgcolor: "#f7f7ff",
                              p: 2,
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: "#4318d1",
                                }}
                              >
                                {transaction.title}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: "#4318d1",
                                }}
                              >
                                {transaction.amount}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {transaction.date}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Recent Notifications Card */}
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#4318d1", mb: 2 }}
                  >
                    Recent Notifications
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {notificationsData.map((notification, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: "#f7f7ff",
                          borderRadius: 1,
                          mb: 2,
                          p: 2,
                        }}
                        onClick={() => {}}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#4318d1" }}>
                            {notification.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" color="text.primary">
                              {notification.message}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {notification.time}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Continue Writing Card */}
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#4318d1", mb: 2 }}
                  >
                    Continue Writing
                  </Typography>
                  <Stack spacing={3}>
                    {writingProjectsData.map((project, index) => (
                      <Box
                        key={index}
                        sx={{
                          border: "1px solid #f7f7ff",
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: "#4318d1",
                            }}
                          >
                            {project.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last edited {project.lastEdited}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Box sx={{ width: "75%" }}>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: "#f7f7ff",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: "#4318d1",
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {project.progress}% complete
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: "#4318d1",
                              "&:hover": {
                                bgcolor: "#3a14b8",
                              },
                            }}
                          >
                            Continue Writing
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#4318d1", mb: 2 }}
                  >
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {quickActionsData.map((action, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            border: "1px solid #f7f7ff",
                            borderRadius: 2,
                            p: 2,
                            height: "100%",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: "#e0e0ff",
                            },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: "#4318d1",
                              mb: 1,
                            }}
                          >
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilePage; 