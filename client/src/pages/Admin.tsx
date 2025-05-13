import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  createdAt: string;
};

export default function Admin() {
  const { user } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Export emails function
  const exportUserEmails = () => {
    const emailsText = sortedUsers.map(user => user.email).join('\n');
    const blob = new Blob([emailsText], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = href;
    link.download = 'sacred-archive-user-emails.txt';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  // Fetch all users if the current user is authenticated
  const { 
    data: users = [], 
    isLoading,
    isError,
    error
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user, // Only run query if user is authenticated
  });

  // Sort users by creation date (newest first)
  const sortedUsers = [...users].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-12 px-4"
    >
      <Helmet>
        <title>Admin Dashboard | Sacred Archive</title>
        <meta name="description" content="Administrator dashboard for the Sacred Archive." />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-cinzel text-sacred-blue flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Admin Dashboard
          </h1>
          
          <div className="text-sm text-sacred-gray bg-sacred-blue/5 px-4 py-2 rounded-md">
            Logged in as <span className="font-medium">{user.username}</span>
          </div>
        </div>

        {isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-8">
            <p className="font-medium">Error fetching users</p>
            <p className="text-sm">{(error as Error).message || "An unknown error occurred"}</p>
          </div>
        ) : null}

        <div className="bg-white shadow rounded-lg overflow-hidden border border-sacred-blue/10">
          <div className="p-6 border-b border-sacred-blue/10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-cinzel text-sacred-blue">Registered Users</h2>
              <p className="text-sacred-gray text-sm mt-1">
                All users who have registered with the Sacred Archive
              </p>
            </div>
            <Button 
              onClick={exportUserEmails}
              variant="outline"
              className="text-sacred-blue border-sacred-blue/30 hover:bg-sacred-blue/10"
              disabled={users.length === 0}
            >
              Export User Emails
            </Button>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-sacred-blue" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sacred-gray">
              <p>No users have registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of all registered users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()} at{" "}
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-sm"
                          onClick={() => setIsAlertOpen(true)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sacred-gray text-sm">
          <p>
            In a production environment, this page would be restricted to admin users only.
            <br />
            Currently, any authenticated user can view this information for demonstration purposes.
          </p>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Features</AlertDialogTitle>
            <AlertDialogDescription>
              In a production environment, this would provide access to detailed user information
              and administrative actions like suspending accounts, resetting passwords, etc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}