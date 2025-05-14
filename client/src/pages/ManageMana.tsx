import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sparkles, Info } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManaPackages from '@/components/mana/ManaPackages';
import ManaTransactions from '@/components/mana/ManaTransactions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

function ManageMana(): React.JSX.Element {
  console.log("ManageMana component execution started");
  
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("packages");
  
  // Query for user's mana balance
  const { data: manaData, isLoading: isManaLoading, refetch: refetchManaBalance } = useQuery<{ balance: number }>({
    queryKey: ['/api/user/mana'],
    enabled: !!user,
  });
  
  // Get query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  const errorMessage = searchParams.get('message');
  
  // Show toast for status messages
  useEffect(() => {
    if (status === 'success' && amount) {
      // Refetch mana balance to show updated amount
      refetchManaBalance();
      
      toast({
        title: 'Purchase Successful',
        description: `You have successfully added ${amount} Mana to your account.`,
        variant: 'default',
      });
      
      // Clear query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'canceled') {
      toast({
        title: 'Purchase Canceled',
        description: 'Your mana purchase has been canceled.',
        variant: 'default',
      });
      
      // Clear query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'error') {
      toast({
        title: 'Purchase Failed',
        description: errorMessage ? decodeURIComponent(errorMessage).replace(/\+/g, ' ') : 'An error occurred during purchase.',
        variant: 'destructive',
      });
      
      // Clear query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [status, amount, errorMessage, toast, refetchManaBalance]);
  
  console.log(`ManageMana at ${new Date().toISOString()} - Location: ${location}, User:`, user ? "Authenticated" : "Not authenticated");
  
  // Extract the balance value
  const manaBalance = manaData?.balance || 0;
  
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Manage Mana | Akashic Archive</title>
        <meta name="description" content="Manage your Mana for the Akashic Archive - purchase mana packages and view transaction history" />
      </Helmet>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600" />
            Manage Mana
          </h1>
          
          {/* Current mana balance */}
          <div className="mb-8 p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
            <div className="text-xl font-medium text-blue-900">Current Balance</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <span className="text-4xl font-bold text-blue-700">{isManaLoading ? '...' : manaBalance}</span>
              <span className="text-lg text-blue-600">Mana</span>
            </div>
          </div>
          
          {/* Display Stripe security information */}
          {import.meta.env.VITE_STRIPE_PUBLIC_KEY ? (
            <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-green-800 font-medium">Secure Payments Enabled</span>
              </div>
              <span className="text-green-700 text-sm">
                Your purchases are processed securely via Stripe
              </span>
            </div>
          ) : (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Stripe Integration Unavailable</AlertTitle>
              <AlertDescription className="text-amber-700">
                The Stripe payment integration is currently unavailable or misconfigured. Purchases will not work until this is resolved.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Tabs for different sections */}
          <Tabs 
            defaultValue="packages" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="packages">Purchase Mana</TabsTrigger>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="packages" className="mt-6">
              <ManaPackages />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-6">
              <ManaTransactions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default ManageMana;