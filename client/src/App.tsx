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
import Landing1 from "@/pages/Landing1";
import ArkContents from "@/pages/ArkContents";
import ArkArtifacts from "@/pages/ArkArtifacts";
import ArkTablets from "@/pages/ArkTablets";
import ArkScrolls from "@/pages/ArkScrolls";
import ArkBooks from "@/pages/ArkBooks";
import TabletDetail from "@/pages/TabletDetail";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function App() {
  const [location] = useLocation();
  
  // Special handling for landing page - render without the normal layout
  if (location === "/landing1") {
    return <Landing1 />;
  }

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
                <Route path="/ark-contents" component={ArkContents} />
                <Route path="/ark/artifacts" component={ArkArtifacts} />
                <Route path="/ark/tablets" component={ArkTablets} />
                <Route path="/ark/tablets/:id" component={TabletDetail} />
                <Route path="/ark/scrolls" component={ArkScrolls} />
                <Route path="/ark/books" component={ArkBooks} />
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
                <ProtectedRoute 
                  path="/mana" 
                  component={ManageMana} 
                />

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
