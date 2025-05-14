import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';

function ManageMana(): React.JSX.Element {
  console.log("ManageMana component execution started");
  
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  console.log(`ManageMana at ${new Date().toISOString()} - Location: ${location}, User:`, user ? "Authenticated" : "Not authenticated");
  
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
        <meta name="description" content="Manage your Mana for the Akashic Archive" />
      </Helmet>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600" />
            Manage Mana (Debug Version)
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This is a simplified version of the Manage Mana page for debugging purposes.
          </p>
          
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <p className="text-left mb-2">
              Current route: <code className="bg-gray-100 px-2 py-1 rounded">{location}</code>
            </p>
            <p className="text-left mb-2">
              Auth status: <code className="bg-gray-100 px-2 py-1 rounded">{user ? "Authenticated" : "Not authenticated"}</code>
            </p>
            <p className="mt-4 text-left">
              The full Manage Mana page will be restored once we fix the routing issue.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageMana;