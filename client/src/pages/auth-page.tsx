import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  // If already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-sacred-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <Helmet>
        <title>Sacred Archive | Access the Knowledge</title>
        <meta
          name="description"
          content="Join the Sacred Archive to unlock ancient wisdom and preserve your journey through the scrolls of knowledge."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column: Auth forms */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-sacred-blue/10">
          <div className="mx-auto max-w-sm">
            <h2 className="text-center text-3xl font-bold font-cinzel text-sacred-blue mb-6">
              Access the Archive
            </h2>

            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="font-cinzel">Login</TabsTrigger>
                <TabsTrigger value="register" className="font-cinzel">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel">Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              className="font-raleway"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel">
                            Password (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password if needed"
                              className="font-raleway"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entering...
                        </>
                      ) : (
                        "Enter the Archive"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel">Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Choose a username"
                              className="font-raleway"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel">Email (Required)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              className="font-raleway"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel">Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number (optional)"
                              className="font-raleway"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel">
                            Password (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password (optional)"
                              className="font-raleway"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Join the Sacred Archive"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center text-sm text-sacred-gray">
              <p>
                {activeTab === "login"
                  ? "No account yet? "
                  : "Already have an account? "}
                <Button
                  variant="link"
                  className="text-sacred-blue p-0 h-auto font-normal"
                  onClick={() =>
                    setActiveTab(activeTab === "login" ? "register" : "login")
                  }
                >
                  {activeTab === "login" ? "Register here" : "Login here"}
                </Button>
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Hero/info section */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold font-cinzel text-sacred-blue mb-6">
            Preserve Your Journey
          </h1>
          
          <div className="space-y-6 text-sacred-gray font-raleway">
            <p className="text-lg">
              The Sacred Archive allows you to track your progress as you
              uncover the ancient wisdom contained within the scrolls.
            </p>
            
            <div className="bg-sacred-blue/5 p-6 rounded-lg border border-sacred-blue/10">
              <h3 className="font-cinzel text-xl text-sacred-blue mb-3">
                Benefits of Registration
              </h3>
              <ul className="space-y-2 text-left list-disc list-inside">
                <li>Track which scrolls you've unlocked</li>
                <li>Continue your journey across multiple sessions</li>
                <li>Receive notifications when new scrolls are discovered</li>
                <li>Contribute to the collective wisdom of the Archive</li>
              </ul>
            </div>
            
            <p>
              Your path through the Archive is unique. By creating an account,
              your discoveries will be preserved for your return.
            </p>
          </div>
          
          <div className="mt-8 hidden md:block">
            <div className="w-24 h-24 mx-auto">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full text-sacred-blue/20"
              >
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}