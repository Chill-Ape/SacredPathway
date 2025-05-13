import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManaPackages from '@/components/mana/ManaPackages';
import ManaTransactions from '@/components/mana/ManaTransactions';
import ManaBalance from '@/components/mana/ManaBalance';
import { Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

function ManageMana(): React.JSX.Element {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Handle redirect params from Stripe checkout
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    const errorMessage = searchParams.get('message');
    
    if (status === 'success' && amount) {
      toast({
        title: 'Purchase Successful!',
        description: `You've successfully added ${amount} Mana to your account.`,
        variant: 'default',
      });
      
      // Clear the URL params
      setLocation('/mana', { replace: true });
    } else if (status === 'error' && errorMessage) {
      toast({
        title: 'Purchase Failed',
        description: decodeURIComponent(errorMessage.replace(/\+/g, ' ')),
        variant: 'destructive',
      });
      
      // Clear the URL params
      setLocation('/mana', { replace: true });
    } else if (status === 'canceled') {
      toast({
        title: 'Purchase Canceled',
        description: 'Your Mana purchase was canceled. No payment was processed.',
        variant: 'default',
      });
      
      // Clear the URL params
      setLocation('/mana', { replace: true });
    }
  }, [location, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p>You need to be logged in to manage your Mana.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Mana | Akashic Archive</title>
        <meta name="description" content="Purchase and manage your Mana for the Akashic Archive. Use Mana to unlock ancient scrolls and access hidden knowledge." />
      </Helmet>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-blue-600" />
                Mana Balance
              </h1>
              <p className="text-gray-600 mt-1">
                Purchase and manage your mystical energy
              </p>
            </div>
            <ManaBalance />
          </div>
          
          <Tabs defaultValue="purchase">
            <TabsList className="mb-6">
              <TabsTrigger value="purchase">Purchase Mana</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="purchase" className="mt-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Available Packages</h2>
                <p className="text-gray-600">
                  Mana is the mystical energy that powers your journey through the Akashic Archive. 
                  Use it to unlock ancient scrolls and reveal hidden knowledge.
                </p>
              </div>
              <ManaPackages />
            </TabsContent>
            
            <TabsContent value="history">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Your Mana History</h2>
                <p className="text-gray-600">
                  Track your Mana purchases and expenditures over time.
                </p>
              </div>
              <ManaTransactions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ManageMana;