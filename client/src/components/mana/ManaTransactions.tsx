import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { ManaTransaction } from '@shared/schema';
import { format } from 'date-fns';

const ManaTransactions: React.FC = () => {
  const { user } = useAuth();
  
  const { data: transactions, isLoading, error } = useQuery<ManaTransaction[]>({
    queryKey: ['/api/user/mana/transactions'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Mana Transactions</CardTitle>
          <CardDescription>
            You need to be logged in to view your transactions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !transactions) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load transaction history. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mana Transactions</CardTitle>
          <CardDescription>
            Your transaction history will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-gray-500">
            No transactions yet. Purchase Mana or use it to unlock content!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mana Transactions</CardTitle>
        <CardDescription>
          Your recent Mana activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <span className={`flex items-center justify-end gap-1 font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ManaTransactions;