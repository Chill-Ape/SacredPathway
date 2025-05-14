import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

function ManaDebug(): React.JSX.Element {
  const [location, navigate] = useLocation();
  
  console.log("ManaDebug component loaded. Current location:", location);
  
  const navigateToMana = () => {
    console.log("Button clicked to navigate to /mana");
    navigate('/mana');
  };
  
  const useWindowLocation = () => {
    console.log("Button clicked to use window.location");
    window.location.href = '/mana';
  };
  
  return (
    <>
      <Helmet>
        <title>Mana Debug | Akashic Archive</title>
        <meta name="description" content="Debug page for Mana routing" />
      </Helmet>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h1 className="text-3xl font-bold mb-6">Mana Debug Page</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-2">Current Location</h2>
              <pre className="bg-black text-green-400 p-3 rounded font-mono overflow-x-auto">
                {location}
              </pre>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Navigation Options</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Using Link Component</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This uses the Wouter Link component for client-side navigation.
                  </p>
                  <Link to="/mana">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => console.log("Link button clicked")}
                    >
                      Go to /mana with Link
                    </Button>
                  </Link>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Using navigate() Function</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This uses Wouter's navigate() function for programmatic navigation.
                  </p>
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={navigateToMana}
                  >
                    Go to /mana with navigate()
                  </Button>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Using window.location</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This forces a full page refresh with window.location.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={useWindowLocation}
                  >
                    Go to /mana with window.location
                  </Button>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Direct HTML Link</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This is a regular HTML anchor tag with href.
                  </p>
                  <a 
                    href="/mana" 
                    className="inline-block w-full py-2 px-4 text-center font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => console.log("HTML link clicked")}
                  >
                    Go to /mana with a href
                  </a>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h2 className="text-lg font-medium mb-4">Other Test Routes</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/">
                  <Button variant="outline">Go to Homepage</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline">Go to Profile</Button>
                </Link>
                <Link to="/my-scrolls">
                  <Button variant="outline">Go to My Scrolls</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManaDebug;