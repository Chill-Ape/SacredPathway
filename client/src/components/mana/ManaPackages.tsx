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

  // Handle purchase button click - using payment method choice
  const handlePurchase = async (pkg: ManaPackage) => {
    // If already processing a package, prevent multiple requests
    if (processingPackageId !== null) {
      return;
    }
    
    // Check if Stripe is available
    if (!stripePublicKey || !stripePromise) {
      toast({
        title: "Payment System Configuration",
        description: "The payment system is currently being configured. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Set the package as processing
      setProcessingPackageId(pkg.id);
      
      // Log the start of the purchase process
      console.log(`[${new Date().toISOString()}] Starting purchase process for package:`, pkg.id, pkg.name);
      
      // Create payment intent on the server
      console.log(`[${new Date().toISOString()}] Making API request to create payment intent...`);
      const response = await apiRequest('POST', '/api/mana/purchase/create-payment-intent', { 
        packageId: pkg.id 
      });
      
      // Log the response status
      console.log(`[${new Date().toISOString()}] API response status:`, response.status);
      
      // Handle non-OK responses
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
      
      // Parse the response data
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Received data:`, data);
      
      // Check if authentication is required (user not logged in)
      if (data.requiresAuthentication) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to purchase Mana.',
          variant: 'default',
        });
        
        // Redirect to auth page with return URL
        window.location.href = `/auth?redirect=${encodeURIComponent('/mana')}`;
        return;
      }
      
      // Verify we have a session ID
      if (!data.sessionId) {
        throw new Error('No session ID received from server');
      }
      
      // Load Stripe and redirect to checkout
      console.log(`[${new Date().toISOString()}] Loading Stripe and redirecting to checkout...`);
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load. Please check your Stripe public key.');
      }
      
      // Log the redirect URL for debugging
      console.log(`[${new Date().toISOString()}] Redirecting to Stripe checkout:`, 
        `https://checkout.stripe.com/c/pay/${data.sessionId}`);
      
      // Use Stripe's redirectToCheckout function instead of direct window.location
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });
      
      // Handle any errors from redirectToCheckout
      if (error) {
        console.error('Redirect to checkout error:', error);
        throw new Error(error.message || 'Failed to redirect to checkout page');
      }
      
      // This code should never be reached unless the redirect fails
      console.log("Redirect didn't immediately happen - fallback to direct URL");
      window.location.href = `https://checkout.stripe.com/c/pay/${data.sessionId}`;
    } catch (error: any) {
      // Log and display errors
      console.error(`[${new Date().toISOString()}] Purchase error:`, error);
      toast({
        title: 'Payment Error',
        description: error.message || 'An error occurred during checkout',
        variant: 'destructive',
      });
      
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

  // Show login prompt for non-authenticated users
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
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => handlePurchase(pkg)}
                disabled={processingPackageId === pkg.id}
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
        ))
      ) : (
        <div className="col-span-full text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No Mana packages available. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ManaPackages;