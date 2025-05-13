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
import Admin from "@/pages/Admin";
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
                <Route path="/auth" component={AuthPage} />
                <ProtectedRoute path="/profile" component={Profile} />
                <ProtectedRoute path="/admin" component={Admin} />
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
