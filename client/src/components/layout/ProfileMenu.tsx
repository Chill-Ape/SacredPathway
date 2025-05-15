import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { User, LogOut, Library, Sparkles, Backpack, Flask } from "lucide-react";
import ManaBalance from "@/components/mana/ManaBalance";

type ProfileMenuProps = {
  isMobile?: boolean;
  forcedUser?: { id: number; username: string; profilePicture?: string } | null;
  wasAuthenticated?: boolean;
  onLogout?: () => void;
};

export default function ProfileMenu({ 
  isMobile = false, 
  forcedUser = null,
  wasAuthenticated = false,
  onLogout
}: ProfileMenuProps) {
  const { user: authUser, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Use either the forcedUser (from parent) or the authUser (from context)
  const user = forcedUser || authUser;
  
  console.log("ProfileMenu - User:", user, "Was authenticated:", wasAuthenticated);

  const handleLogout = () => {
    console.log("Logging out user...");
    
    // Call the parent component's onLogout callback if provided
    if (onLogout) {
      onLogout();
    }
    
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        console.log("Logout successful, redirecting to home page");
        
        // Force reload the page to clear all state
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
      }
    });
  };

  // Handle the case when user is not logged in
  if (!user) {
    // If wasAuthenticated is true, show a loading profile button
    if (wasAuthenticated) {
      return (
        <Button
          variant="outline"
          className={`font-cinzel text-sacred-blue border-sacred-blue/20 transition-all ${
            isMobile ? "w-full justify-center" : ""
          }`}
          disabled
        >
          <div className="flex items-center">
            <div className="h-5 w-5 rounded-full bg-sacred-blue/10 animate-pulse mr-2"></div>
            <span>Loading...</span>
          </div>
        </Button>
      );
    }
    
    // Normal login button
    return (
      <Link to="/auth">
        <Button
          variant="outline"
          className={`font-cinzel text-sacred-blue hover:text-sacred-white hover:bg-sacred-blue border-sacred-blue/20 transition-all ${
            isMobile ? "w-full justify-center" : ""
          }`}
        >
          <User className="h-5 w-5 mr-2" />
          Login / Register
        </Button>
      </Link>
    );
  }

  // For mobile view, instead of a dropdown, we'll display direct buttons
  if (isMobile) {
    console.log("ProfileMenu Mobile - User state:", user, "wasAuthenticated:", wasAuthenticated);
    
    // If no user but wasAuthenticated, show loading state
    if (!user && wasAuthenticated) {
      return (
        <div className="w-full py-3">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-sacred-blue/10 animate-pulse mr-2"></div>
            <span className="text-sacred-blue">Loading...</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full space-y-2">
        {user ? (
          <>
            <div className="flex items-center justify-center mb-3">
              <Avatar className="h-12 w-12 border-2 border-sacred-blue/20">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.username}'s profile`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img 
                    src="/assets/sacred_symbol.png" 
                    alt={`${user.username}'s profile`} 
                    className="h-full w-full object-cover"
                  />
                )}
              </Avatar>
              <div className="ml-3 text-left">
                <p className="font-cinzel text-sacred-blue font-medium">{user.username}</p>
                <p className="text-xs text-sacred-gray">Archive Member</p>
                <div className="mt-1">
                  <ManaBalance />
                </div>
              </div>
            </div>
            
            <Link to="/profile">
              <Button
                variant="ghost"
                className={`w-full justify-start font-cinzel text-left ${
                  location === "/profile" ? "bg-sacred-blue/5 text-sacred-blue" : "text-sacred-gray"
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                My Profile
              </Button>
            </Link>
            
            <Link to="/my-scrolls">
              <Button
                variant="ghost"
                className={`w-full justify-start font-cinzel text-left ${
                  location === "/my-scrolls" ? "bg-sacred-blue/5 text-sacred-blue" : "text-sacred-gray"
                }`}
              >
                <Library className="h-5 w-5 mr-2" />
                My Collection
              </Button>
            </Link>
            
            <Link to="/mana">
              <Button
                variant="ghost"
                className={`w-full justify-start font-cinzel text-left ${
                  location === "/mana" ? "bg-sacred-blue/5 text-sacred-blue" : "text-sacred-gray"
                }`}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Manage Mana
              </Button>
            </Link>
            
            <Link to="/inventory">
              <Button
                variant="ghost"
                className={`w-full justify-start font-cinzel text-left ${
                  location === "/inventory" ? "bg-sacred-blue/5 text-sacred-blue" : "text-sacred-gray"
                }`}
              >
                <Backpack className="h-5 w-5 mr-2" />
                Inventory
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              className="w-full justify-start font-cinzel text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button
              variant="outline"
              className="w-full justify-center font-cinzel text-sacred-blue hover:text-sacred-white hover:bg-sacred-blue border-sacred-blue/20 transition-all"
            >
              <User className="h-5 w-5 mr-2" />
              Login / Register
            </Button>
          </Link>
        )}
      </div>
    );
  }

  // Desktop view with dropdown
  return (
    <div className="flex items-center gap-2">
      {/* Show Mana balance */}
      <ManaBalance />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative rounded-full h-8 w-8 flex items-center justify-center"
          >
            <Avatar className="h-8 w-8 border border-sacred-blue/20">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.username}'s profile`} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <img 
                  src="/assets/sacred_symbol.png" 
                  alt={`${user.username}'s profile`} 
                  className="h-full w-full object-cover"
                />
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 font-raleway">
          <DropdownMenuLabel className="font-cinzel text-sacred-blue">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">Archive Member</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <Link to="/profile">
            <DropdownMenuItem className="cursor-pointer">
              My Profile
            </DropdownMenuItem>
          </Link>
          
          <Link to="/my-scrolls">
            <DropdownMenuItem className="cursor-pointer">
              My Collection
            </DropdownMenuItem>
          </Link>
          
          <Link to="/mana">
            <DropdownMenuItem className="cursor-pointer">
              <Sparkles className="h-4 w-4 mr-2" />
              Manage Mana
            </DropdownMenuItem>
          </Link>
          
          <Link to="/inventory">
            <DropdownMenuItem className="cursor-pointer">
              <Backpack className="h-4 w-4 mr-2" />
              Inventory
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <Link to="/admin">
            <DropdownMenuItem className="cursor-pointer">
              Admin Dashboard
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}