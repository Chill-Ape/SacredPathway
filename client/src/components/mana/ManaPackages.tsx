import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { ManaPackage } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// This component will be updated when Stripe keys are available to handle actual purchases
const ManaPackages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: packages, isLoading, error } = useQuery<ManaPackage[]>({
    queryKey: ['/api/mana/packages'],
    enabled: !!user,
  });

  const handlePurchase = (pkg: ManaPackage) => {
    if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
      toast({
        title: "Payment System Not Available",
        description: "The Mana purchase system is currently being set up. Please check back later.",
        variant: "destructive"
      });
      return;
    }
    
    // This function will be expanded when Stripe is fully integrated
    toast({
      title: "Coming Soon",
      description: `Purchasing ${pkg.amount} Mana will be available shortly.`,
      variant: "default"
    });
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
            >
              Purchase
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ManaPackages;