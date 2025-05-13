import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertContactMessageSchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend the schema with validation
const formSchema = insertContactMessageSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters long" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been received by the Keepers. They will respond soon.",
      });
      form.reset();
      setIsSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    await mutation.mutateAsync(data);
  };
  
  if (isSubmitted) {
    return (
      <div className="bg-sacred-white rounded-xl shadow-md border border-sacred-blue/10 p-8">
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-sacred-blue mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-cinzel text-xl text-sacred-blue mb-2">Thank You for Your Message</h3>
          <p className="font-raleway text-sacred-gray mb-6">
            The Keepers have received your inquiry and will respond soon.
          </p>
          <Button 
            type="button" 
            onClick={() => setIsSubmitted(false)}
            className="bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sacred-white rounded-xl shadow-md border border-sacred-blue/10 p-8">
      <h3 className="font-cinzel text-xl text-sacred-blue mb-4">Send a Message</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-raleway text-sacred-gray">Your Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-sacred-white border-sacred-blue/20 font-raleway text-sacred-gray"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-raleway text-sacred-gray">Your Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    className="bg-sacred-white border-sacred-blue/20 font-raleway text-sacred-gray"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-raleway text-sacred-gray">Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-sacred-white border-sacred-blue/20 font-raleway text-sacred-gray">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                    <SelectItem value="Oracle Assistance">Oracle Assistance</SelectItem>
                    <SelectItem value="Scroll Access Request">Scroll Access Request</SelectItem>
                    <SelectItem value="Share Personal Insights">Share Personal Insights</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-raleway text-sacred-gray">Your Message</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={4} 
                    className="bg-sacred-white border-sacred-blue/20 font-raleway text-sacred-gray"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-wide py-2 rounded transition-colors duration-300"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sending Message..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
