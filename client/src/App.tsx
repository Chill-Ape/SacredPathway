import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Scrolls from "@/pages/Scrolls";
import Lore from "@/pages/Lore";
import Oracle from "@/pages/Oracle";
import Keeper from "@/pages/Keeper";
import Contact from "@/pages/Contact";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

function App() {
  const [location] = useLocation();

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col sacred-pattern">
        <Navbar />
        <main className="flex-grow pt-16">
          <AnimatePresence mode="wait">
            <Switch key={location}>
              <Route path="/" component={Home} />
              <Route path="/scrolls" component={Scrolls} />
              <Route path="/lore" component={Lore} />
              <Route path="/oracle" component={Oracle} />
              <Route path="/keeper" component={Keeper} />
              <Route path="/contact" component={Contact} />
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
