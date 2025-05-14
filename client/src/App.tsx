import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Scrolls from "@/pages/Scrolls";
import ScrollDetail from "@/pages/ScrollDetail";
import SacredScroll from "@/pages/SacredScroll";
import Lore from "@/pages/Lore";
import Keeper from "@/pages/Keeper";
import Oracle from "@/pages/Oracle";
import Contact from "@/pages/Contact";
import AuthPage from "@/pages/auth-page";
import Profile from "@/pages/Profile";
import MyScrolls from "@/pages/MyScrolls";
import Admin from "@/pages/Admin";
import ManageMana from "@/pages/ManageMana";
import Simulation from "@/pages/Simulation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function App() {
  const [location] = useLocation();

  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col sacred-pattern">
          <Navbar />
          <main className="flex-grow pt-16">
            <AnimatePresence mode="wait">
              <Switch key={location}>
                <Route path="/" component={Home} />
                <Route path="/scrolls" component={Scrolls} />
                <Route path="/scrolls/:id" component={ScrollDetail} />
                <Route path="/sacred-scroll/:id" component={SacredScroll} />
                <Route path="/lore" component={Lore} />
                <Route path="/oracle" component={Oracle} />
                <Route path="/keeper" component={Keeper} />
                <Route path="/contact" component={Contact} />
                <Route path="/simulation" component={Simulation} />
                <Route path="/auth" component={AuthPage} />
                <ProtectedRoute 
                  path="/profile" 
                  component={Profile} 
                />
                <ProtectedRoute 
                  path="/my-scrolls" 
                  component={MyScrolls} 
                />
                <ProtectedRoute 
                  path="/admin" 
                  component={Admin} 
                />
                <Route path="/mana">
                  {() => {
                    console.log("Mana route matched at", new Date().toISOString());
                    setTimeout(() => {
                      console.log("Checking if Mana route is still matched after timeout");
                    }, 500);
                    return <ManageMana />;
                  }}
                </Route>
                
                {/* Debug route */}
                <Route path="/mana-debug">
                  {() => {
                    console.log("MANA DEBUG ROUTE MATCHED");
                    return (
                      <div className="p-8">
                        <h1 className="text-2xl font-bold mb-4">Debug Mana Route</h1>
                        <p className="mb-4">This is a special debug page for the Mana route.</p>
                        <div className="flex flex-col gap-4">
                          <a href="/mana" className="text-blue-500 underline">
                            Click here to go to /mana directly with a regular link
                          </a>
                          <button 
                            onClick={() => window.location.href = '/mana'} 
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            Navigate to /mana with window.location
                          </button>
                        </div>
                      </div>
                    );
                  }}
                </Route>
                <Route component={NotFound} />
              </Switch>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
