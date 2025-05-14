import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ManaPackage } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Initialize Stripe with the public key
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log('Stripe Public Key Status:', stripePublicKey ? 'Available' : 'Missing');

if (!stripePublicKey) {
  console.error('VITE_STRIPE_PUBLIC_KEY is missing. Stripe checkout will not work.');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const ManaPackages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Check URL parameters for status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      setShowSuccessMessage(true);
      // Clear the status after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Fetch mana packages
  const { data: packages, isLoading, error } = useQuery<ManaPackage[]>({
    queryKey: ['/api/mana/packages'],
    // Allow anyone to see the packages, even if not logged in
    enabled: true,
  });

  // Handle purchase button click with Stripe Checkout
  const handlePurchase = async (pkg: ManaPackage) => {
    // If already processing a package, prevent multiple requests
    if (processingPackageId !== null) {
      return;
    }
    
    try {
      // Set the package as processing
      setProcessingPackageId(pkg.id);
      
      // Log the start of the purchase process
      console.log(`[${new Date().toISOString()}] Processing Stripe checkout for:`, pkg.id, pkg.name);
      
      // Make API call to create a Stripe checkout session
      const response = await fetch('/api/mana/purchase/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Stripe session creation result:`, data);
      
      // Check if user needs to authenticate
      if (data.requiresAuthentication) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to purchase Mana',
          variant: 'default',
        });
        
        // Redirect to auth page with return URL
        window.location.href = `/auth?redirect=${encodeURIComponent('/mana')}`;
        return;
      }
      
      // Check for errors in the response
      if (data.message && !data.sessionId) {
        toast({
          title: 'Checkout Error',
          description: data.message || 'Unable to create checkout session. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // If we have a sessionId, redirect to Stripe Checkout
      if (data.sessionId) {
        // Initialize Stripe
        const stripe = await stripePromise;
        
        if (!stripe) {
          toast({
            title: 'Stripe Error',
            description: 'Payment processing is unavailable. Please try again later.',
            variant: 'destructive',
          });
          return;
        }
        
        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        
        // Handle any errors from redirectToCheckout
        if (error) {
          console.error(`[${new Date().toISOString()}] Stripe redirect error:`, error);
          toast({
            title: 'Checkout Error',
            description: error.message || 'Unable to proceed to checkout. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Checkout Error',
          description: 'Unable to create checkout session. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      // Log and display errors
      console.error(`[${new Date().toISOString()}] Payment error:`, error);
      toast({
        title: 'Payment Error',
        description: error.message || 'An error occurred during purchase',
        variant: 'destructive',
      });
    } finally {
      // Reset processing state
      setProcessingPackageId(null);
    }
  };

  // Show success message when purchase is complete
  if (showSuccessMessage) {
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Purchase Successful</AlertTitle>
        <AlertDescription className="text-green-700">
          Your Mana purchase was successful and has been added to your account.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
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

  // Main component rendering
  return (
    <>
      {/* Show login prompt for non-authenticated users */}
      {!user ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to purchase Mana.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Please log in or create an account to purchase Mana packages. Your Mana balance is tied to your user account.
            </p>
            <a href="/auth?redirect=/mana">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4"
              >
                Log in or Register
              </Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Information alert about real payment processing */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800">Secure Payment</AlertTitle>
            <AlertDescription className="text-blue-700">
              All transactions are processed securely via Stripe. You will be redirected to Stripe's checkout page to complete your purchase with a credit card.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
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
                  <CardFooter className="flex flex-col gap-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                      onClick={() => handlePurchase(pkg)}
                      disabled={processingPackageId === pkg.id}
                    >
                      {processingPackageId === pkg.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span>Purchase with Card</span>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M1 4v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2zm19 16H4c-.55 0-1-.45-1-1V9h18v10c0 .55-.45 1-1 1zM3 5c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v2H3V5z"/>
                          </svg>
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-gray-500 text-center mt-1">
                      Secured by <span className="font-medium">Stripe</span>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No Mana packages available. Please check back later.</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ManaPackages;