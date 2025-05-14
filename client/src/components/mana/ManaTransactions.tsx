import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { ManaTransaction } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowDown, ArrowUp, TrendingUp, Sparkles, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const ManaTransactions: React.FC = () => {
  const { user } = useAuth();
  
  // Query for transaction history
  const { data: transactions, isLoading, error } = useQuery<ManaTransaction[]>({
    queryKey: ['/api/user/mana/transactions'],
    enabled: !!user,
  });

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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No Transactions</CardTitle>
          <CardDescription>
            You haven't made any Mana transactions yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          Purchase some Mana to see your transaction history here.
        </CardContent>
      </Card>
    );
  }

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mana_purchase':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'mana_spend':
        return <ArrowDown className="h-5 w-5 text-red-500" />;
      case 'mana_earn':
        return <ArrowUp className="h-5 w-5 text-green-500" />;
      case 'mana_reward':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="overflow-hidden">
          <div className="p-4 flex items-center gap-4">
            <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
              {getTransactionIcon(transaction.transactionType)}
            </div>
            <div className="flex-grow">
              <div className="font-medium">{transaction.description}</div>
              <div className="text-sm text-gray-500">
                {format(new Date(transaction.createdAt), 'MMM d, yyyy, h:mm a')}
              </div>
            </div>
            <div className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.amount > 0 ? '+' : ''}{transaction.amount} Mana
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ManaTransactions;