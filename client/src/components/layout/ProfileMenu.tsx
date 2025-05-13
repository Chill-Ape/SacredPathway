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
import { User, LogOut, Library } from "lucide-react";

type ProfileMenuProps = {
  isMobile?: boolean;
  forcedUser?: { id: number; username: string } | null;
};

export default function ProfileMenu({ isMobile = false, forcedUser = null }: ProfileMenuProps) {
  const { user: authUser, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Use either the forcedUser (from parent) or the authUser (from context)
  const user = forcedUser || authUser;

  const handleLogout = () => {
    console.log("Logging out user...");
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
    console.log("ProfileMenu Mobile - User state:", user);
    
    return (
      <div className="w-full space-y-2">
        {user ? (
          <>
            <div className="flex items-center justify-center mb-3">
              <Avatar className="h-12 w-12 border-2 border-sacred-blue/20">
                <AvatarFallback className="bg-sacred-blue/10 text-sacred-blue font-cinzel text-lg">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left">
                <p className="font-cinzel text-sacred-blue font-medium">{user.username}</p>
                <p className="text-xs text-sacred-gray">Archive Member</p>
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
                My Scrolls
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative rounded-full h-8 w-8 flex items-center justify-center"
        >
          <Avatar className="h-8 w-8 border border-sacred-blue/20">
            <AvatarFallback className="bg-sacred-blue/10 text-sacred-blue font-cinzel">
              {user.username[0].toUpperCase()}
            </AvatarFallback>
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
            My Scrolls
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
  );
}