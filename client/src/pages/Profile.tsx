import { useAuth } from "@/hooks/use-auth";
import { useUserScrolls } from "@/hooks/use-user-scrolls";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Loader2, Scroll as ScrollIcon, Lock, LockOpen, Upload, Camera, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define types for the component props
interface ProfilePictureSectionProps {
  user: UserType;
  onUpdate: (user: UserType) => void;
}

// Component for profile picture upload and customization
function ProfilePictureSection({ user, onUpdate }: ProfilePictureSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Predefined avatar options
  const avatarOptions = [
    '/assets/default_avatar.svg',
    '/assets/avatars/mystical_1.svg',
    '/assets/avatars/mystical_2.svg',
    '/assets/avatars/mystical_3.svg',
    '/assets/avatars/mystical_4.svg',
  ];
  
  const handleAvatarSelect = async (avatarPath: string) => {
    try {
      setIsUploading(true);
      
      const response = await apiRequest("POST", "/api/user/profile-picture", {
        profilePicture: avatarPath
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile picture");
      }
      
      const data = await response.json();
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], { user: data.user });
      
      // Call the parent's update function
      if (onUpdate) onUpdate(data.user);
      
      toast({
        title: "Profile Updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center mb-8">
      <Avatar className="h-24 w-24 border-2 border-sacred-blue/30 mb-4">
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={`${user.username}'s profile`} 
            className="h-full w-full object-cover"
          />
        ) : (
          <AvatarFallback className="bg-sacred-blue/10 text-sacred-blue font-cinzel text-2xl">
            {user.username[0].toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-sacred-blue border-sacred-blue/20 font-raleway">
            <Camera className="h-4 w-4 mr-2" />
            Change Avatar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-sacred-blue">Choose Your Avatar</DialogTitle>
            <DialogDescription className="font-raleway text-sacred-gray">
              Select a mystical avatar to represent your journey in the Archive.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 py-4">
            {avatarOptions.map((avatar, index) => (
              <div 
                key={index}
                className={`relative cursor-pointer rounded-full overflow-hidden border-2 ${
                  user.profilePicture === avatar ? 'border-sacred-blue' : 'border-transparent hover:border-sacred-blue/50'
                }`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                <img 
                  src={avatar} 
                  alt={`Avatar option ${index + 1}`} 
                  className="h-20 w-20 object-cover"
                />
                {isUploading && user.profilePicture === avatar && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Define the User type to match our auth context
type UserType = {
  id: number;
  username: string;
  profilePicture?: string;
};

export default function Profile() {
  const { user } = useAuth();
  const { userScrolls, isLoadingScrolls } = useUserScrolls();
  const [userData, setUserData] = useState<UserType | null>(null);

  // Update userData when user changes
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sacred-blue" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12 px-4"
    >
      <Helmet>
        <title>Your Sacred Journey | Akashic Archive</title>
        <meta
          name="description"
          content="View your progress through the Sacred Archive and track your unlocked scrolls."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-cinzel text-sacred-blue mb-4">
            Your Sacred Journey
          </h1>
          <p className="text-sacred-gray font-raleway max-w-2xl mx-auto">
            Welcome back, <span className="font-medium">{userData.username}</span>. 
            Your path through the Archive is recorded here. Return to continue 
            your journey of discovery.
          </p>
        </div>
        
        {/* Profile Picture Section */}
        <ProfilePictureSection 
          user={userData} 
          onUpdate={(updatedUser: UserType) => setUserData(updatedUser)} 
        />

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white border-sacred-blue/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sacred-blue font-cinzel text-lg">
                Journey Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sacred-blue font-cinzel">
                {isLoadingScrolls ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  "Seeker"
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-sacred-blue/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sacred-blue font-cinzel text-lg">
                Scrolls Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sacred-blue font-cinzel">
                {isLoadingScrolls ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  userScrolls.length
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-sacred-blue/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sacred-blue font-cinzel text-lg">
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-medium text-sacred-blue font-cinzel">
                {new Date().toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unlocked Scrolls */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-cinzel text-sacred-blue mb-6 flex items-center">
            <ScrollIcon className="h-6 w-6 mr-2" />
            Your Unlocked Scrolls
          </h2>
          
          {isLoadingScrolls ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sacred-blue" />
            </div>
          ) : userScrolls.length === 0 ? (
            <div className="text-center py-12 bg-sacred-blue/5 rounded-lg border border-sacred-blue/10">
              <div className="mb-4">
                <Lock className="h-12 w-12 mx-auto text-sacred-gray/50" />
              </div>
              <h3 className="text-xl font-cinzel text-sacred-blue mb-2">
                No Scrolls Unlocked Yet
              </h3>
              <p className="text-sacred-gray font-raleway max-w-md mx-auto mb-6">
                Your journey is just beginning. Discover ancient knowledge by unlocking 
                sacred scrolls with the right keys.
              </p>
              <Link href="/scrolls">
                <Button className="bg-sacred-blue hover:bg-sacred-blue-light text-white font-cinzel">
                  Explore the Scrolls
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userScrolls.map((scroll) => (
                <Card key={scroll.id} className="bg-white border-sacred-blue/10 overflow-hidden">
                  <div className="flex">
                    {scroll.image && (
                      <div 
                        className="w-1/3 bg-sacred-blue/5 flex items-center justify-center p-4"
                      >
                        <img 
                          src={scroll.image} 
                          alt={scroll.title}
                          className="max-h-24 object-contain"
                        />
                      </div>
                    )}
                    <div className={scroll.image ? "w-2/3" : "w-full"}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sacred-blue font-cinzel text-lg">
                            {scroll.title}
                          </CardTitle>
                          <Badge className="bg-sacred-blue text-white font-cinzel ml-2">
                            <LockOpen className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 font-raleway">
                          {scroll.content.substring(0, 100)}...
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Link href={`/scrolls#scroll-${scroll.id}`}>
                          <Button variant="outline" size="sm">
                            View Scroll
                          </Button>
                        </Link>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}