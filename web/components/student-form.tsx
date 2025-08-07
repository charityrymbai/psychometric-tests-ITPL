"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { userApi } from "@/lib/api-client"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  class: z.coerce.number().int().positive({
    message: "Class must be a positive integer.",
  }),
})

export function StudentForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Initialize form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      class: "",
    },
  })
  
  const [apiError, setApiError] = useState<string | null>(null)

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setApiError(null)
    
    try {
      // Parse the class field as a number
      const formattedData = {
        ...data,
        class: parseInt(data.class, 10)
      }
      
      let userId;
      
      // Generate a temporary ID for the API - using a numeric ID since the database requires it
      const tempId = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
      
      // Call API to create user
      try {
        console.log('Attempting to create user via API with numeric ID:', tempId);
        // Pass the temp ID as a parameter - backend requires an ID parameter to be a number
        const newUser = await userApi.createUser(tempId.toString(), formattedData)
        
        // Log the complete response for debugging
        console.log('Raw user creation response:', JSON.stringify(newUser));
        
        // Check all possible ways the ID might be returned
        // The API could return user_id, id, userId, or _id
        userId = newUser.user_id || newUser.id || newUser.userId || newUser._id;
        
        // If there's a message property but no direct ID property, try to parse the response
        if (!userId && typeof newUser === 'object' && newUser.message) {
          console.log('No direct ID found, attempting to extract from response');
          
          // Some APIs return the ID in the message or embed it somewhere else
          const responseStr = JSON.stringify(newUser);
          
          // Try to find any ID pattern in the response
          const idMatch = responseStr.match(/"user_id"\s*:\s*"([^"]+)"|"id"\s*:\s*"([^"]+)"|"userId"\s*:\s*"([^"]+)"|"_id"\s*:\s*"([^"]+)"/);
          if (idMatch) {
            // Find the first non-undefined group (the actual ID)
            userId = idMatch.slice(1).find(match => match !== undefined);
            console.log('Extracted ID from response:', userId);
          }
        }
        
        if (!userId) {
          console.error('API returned success but no user ID was found in response', newUser);
          userId = `temp_${Date.now()}`;
          setApiError("Warning: API did not return a valid user ID. Using temporary ID instead.");
        } else {
          console.log('User created successfully with ID:', userId);
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Fallback for demo/development: Generate a temporary ID if API fails
        userId = `temp_${Date.now()}`;
        setApiError("Warning: Using temporary user ID due to API connection issues. Some features may be limited.");
        console.log('Using temporary user ID:', userId);
      }
      
      // Set the user_id cookie (expires in 7 days)
      const cookieValue = `user_id=${userId}; path=/; max-age=${60 * 60 * 24 * 7}`;
      console.log('Setting cookie with value:', cookieValue);
      document.cookie = cookieValue;
      
      // Double-check what was actually set
      setTimeout(() => {
        const getCookieValue = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        };
        
        const actualCookieValue = getCookieValue('user_id');
        console.log('Verified cookie value after setting:', actualCookieValue);
      }, 100);
      
      // Navigate to the home page after creating user
      router.push('/')
    } catch (error) {
      console.error("Error submitting form:", error)
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">Student Information</CardTitle>
          <CardDescription>Enter your name and class details below.</CardDescription>
        </CardHeader>
        <CardContent>
          {apiError && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              {apiError}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="text-base">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your name" 
                        {...field} 
                        className="py-6 px-4 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Your full name as it appears on official documents.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="class"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="text-base">Class</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your class" 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="py-6 px-4 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Your current class number (positive integer only).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 text-base font-medium mt-4" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Start Assessment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
