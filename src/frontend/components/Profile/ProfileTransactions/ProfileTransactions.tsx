import React from 'react';
import { Card, CardContent, List, ListItem, Typography, Box } from '@mui/material';
import {
  cardStyles,
  cardContentStyles,
  titleStyles,
  listStyles,
  listItemStyles,
  transactionTitleStyles,
  transactionDateStyles,
  transactionAmountStyles,
} from './ProfileTransactions.styles';

interface Transaction {
  title: string;
  date: string;
  amount: string;
}

interface ProfileTransactionsProps {
  transactions: Transaction[];
}

const ProfileTransactions: React.FC<ProfileTransactionsProps> = ({ transactions }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Recent Transactions
        </Typography>
        <List sx={listStyles}>
          {transactions.map((transaction, index) => (
            <ListItem key={index} sx={listItemStyles}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={transactionTitleStyles}>
                  {transaction.title}
                </Typography>
                <Typography variant="body2" sx={transactionDateStyles}>
                  {transaction.date}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={transactionAmountStyles}>
                {transaction.amount}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ProfileTransactions; 