import React from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

interface Transaction {
  title: string;
  date: string;
  amount: string;
}

interface ProfileTransactionsProps {
  data: Transaction[];
}

export const ProfileTransactions: React.FC<ProfileTransactionsProps> = ({ data }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: "bold", color: "#4318d1" }}
        >
          Recent Transactions
        </Typography>
        <List>
          {data.map((transaction, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#4318d1" }}
                  >
                    {transaction.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.date}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#4318d1" }}
                    >
                      {transaction.amount}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 