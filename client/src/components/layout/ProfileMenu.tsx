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
import { Link } from "wouter";
import { User, LogOut } from "lucide-react";

export default function ProfileMenu() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <Link href="/auth">
        <Button
          variant="ghost"
          className="font-cinzel text-sacred-blue hover:text-sacred-blue-light hover:bg-sacred-blue/10"
        >
          <User className="h-5 w-5 mr-2" />
          Login
        </Button>
      </Link>
    );
  }

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
        
        <Link href="/scrolls">
          <DropdownMenuItem className="cursor-pointer">
            My Scrolls
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