import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { ManaPackage } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log('Stripe Public Key Status:', stripePublicKey ? 'Available' : 'Missing');

if (!stripePublicKey) {
  console.error('VITE_STRIPE_PUBLIC_KEY is missing. Stripe checkout will not work.');
}

const stripePromise = loadStripe(stripePublicKey || '');

const ManaPackages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null);
  
  const { data: packages, isLoading, error } = useQuery<ManaPackage[]>({
    queryKey: ['/api/mana/packages'],
    enabled: !!user,
  });

  const createPaymentIntent = useMutation({
    mutationFn: async (packageId: number) => {
      const response = await apiRequest('POST', '/api/mana/purchase/create-payment-intent', { packageId });
      return response.json();
    },
    onSuccess: async (data) => {
      // Redirect to Stripe Checkout with the client secret
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        toast({
          title: 'Payment Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      setProcessingPackageId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/mana'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
      setProcessingPackageId(null);
    },
  });

  const handlePurchase = async (pkg: ManaPackage) => {
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      toast({
        title: "Payment System Not Available",
        description: "The Mana purchase system is currently being set up. Please check back later.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Starting purchase process for package:', pkg.id, pkg.name);
      setProcessingPackageId(pkg.id);
      
      // Make the API request directly here for better control
      console.log('Making API request to create payment intent...');
      const response = await apiRequest('POST', '/api/mana/purchase/create-payment-intent', { packageId: pkg.id });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to create payment session';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If the response isn't JSON, try to get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Received session data with ID:', data.sessionId ? 'Valid session ID' : 'Missing session ID');
      
      if (!data.sessionId) {
        throw new Error('No session ID received from server');
      }
      
      // Redirect to Stripe Checkout
      console.log('Loading Stripe...');
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load. Please check your Stripe public key.');
      }
      
      console.log('Redirecting to Stripe checkout...');
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'An error occurred during checkout',
        variant: 'destructive',
      });
      setProcessingPackageId(null);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Mana Packages</CardTitle>
          <CardDescription>
            You need to be logged in to purchase Mana.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <a href="/auth">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4"
            >
              Log in or Register
            </Button>
          </a>
        </CardContent>
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

  if (error || !packages) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load Mana packages. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="w-full overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-900 to-purple-900 text-white">
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
              {pkg.name}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {pkg.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-yellow-500">
                {pkg.amount}
              </span>
              <span className="text-lg ml-2">Mana</span>
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              ${(pkg.price / 100).toFixed(2)} USD
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => handlePurchase(pkg)}
              disabled={processingPackageId === pkg.id || createPaymentIntent.isPending}
            >
              {processingPackageId === pkg.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Purchase"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ManaPackages;