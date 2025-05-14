import { useAuth } from "@/hooks/use-auth";
import { useUserScrolls } from "@/hooks/use-user-scrolls";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Loader2, Scroll as ScrollIcon, Lock, LockOpen, Upload, Camera, UserCircle, FileImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Define types for the component props
interface ProfilePictureSectionProps {
  user: UserType;
  onUpdate: (user: UserType) => void;
}

// Component for profile picture upload and customization
function ProfilePictureSection({ user, onUpdate }: ProfilePictureSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Predefined avatar options
  const avatarOptions = [
    '/assets/default_avatar.svg',
    '/assets/avatars/mystical_1.svg',
    '/assets/avatars/mystical_2.svg',
    '/assets/avatars/mystical_3.svg',
    '/assets/avatars/mystical_4.svg',
  ];
  
  // Handle avatar selection from predefined options
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
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB in size.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profileImage', selectedFile);
      
      // Simulate progress (in a real app, you'd use upload progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + 20;
          return next < 90 ? next : 90;
        });
      }, 500);
      
      // Upload the file using apiRequest which handles authentication properly
      // First, check if user is still authenticated
      const authCheck = await apiRequest("GET", "/api/user");
      if (!authCheck.ok) {
        // User is not authenticated, redirect to login
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
        throw new Error("Authentication required");
      }
      
      // Now proceed with the upload
      const response = await fetch('/api/user/upload-profile-picture', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload profile picture");
      }
      
      const data = await response.json();
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], { user: data.user });
      
      // Call the parent's update function
      if (onUpdate) onUpdate(data.user);
      
      // Cleanup the preview URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile picture has been uploaded successfully.",
      });
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Reset selected file
  const resetFileSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          resetFileSelection();
        }
      }}>
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
              Select a mystical avatar or upload your own photo.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="avatars" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="avatars">Preset Avatars</TabsTrigger>
              <TabsTrigger value="upload">Upload Photo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="avatars">
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
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="flex flex-col items-center py-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                
                {/* Preview or drop zone */}
                <div 
                  className={`w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center mb-4 ${
                    previewUrl ? 'border-sacred-blue' : 'border-sacred-blue/30 hover:border-sacred-blue/60'
                  }`}
                  onClick={!isUploading && !previewUrl ? triggerFileInput : undefined}
                  style={{ cursor: !isUploading && !previewUrl ? 'pointer' : 'default' }}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      {!isUploading && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFileSelection();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6L18 18"></path>
                          </svg>
                        </Button>
                      )}
                    </div>
                  ) : isUploading ? (
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-sacred-blue mx-auto mb-2" />
                      <p className="text-sm text-sacred-gray">{uploadProgress}% Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <FileImage className="h-12 w-12 text-sacred-blue/60 mx-auto mb-2" />
                      <p className="text-sacred-blue font-medium">Click to select an image</p>
                      <p className="text-sacred-gray text-sm mt-1">JPEG, PNG, GIF or WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    Select Image
                  </Button>
                  <Button 
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                    className="bg-sacred-blue hover:bg-sacred-blue/80"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : 'Upload Image'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
  const { user, isLoading } = useAuth();
  const { userScrolls, isLoadingScrolls } = useUserScrolls();
  const [userData, setUserData] = useState<UserType | null>(null);
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Update userData when user changes
  useEffect(() => {
    if (user) {
      setUserData(user);
    } else if (!isLoading && !user) {
      // Not loading and no user means we're not authenticated
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile",
        variant: "destructive",
      });
      // Redirect to auth page
      navigate('/auth');
    }
  }, [user, isLoading, navigate, toast]);

  // Show loading state
  if (isLoading || (!userData && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sacred-blue" />
      </div>
    );
  }
  
  // If no user data, don't render anything (we're redirecting)
  if (!userData) {
    return null;
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