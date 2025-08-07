"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainContent } from "@/components/main-content"
import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { userApi } from "@/lib/api-client"

export default function HomePage() {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<{
    type: "home" | "group" | "section" | "questions" | "settings" | "test" | "results"
    id?: string
    group?: string
    sectionId?: string
    data?: any
  }>({ type: "home" })
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  
  useEffect(() => {
    // Check for user_id cookie when component mounts
    const getCookieValue = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? match[2] : null
    }
    
    const userId = getCookieValue('user_id')
    console.log('Home page loaded with user ID from cookie:', userId);
    
    if (!userId) {
      // Redirect to the user page if no user_id cookie exists
      router.push('/user')
    } else if (userId.startsWith('temp_')) {
      // If it's a temporary ID, we'll still allow access but show a warning
      console.log('Using temporary user ID - proceeding with limited functionality');
      setApiError("Using temporary user ID. Some features may be limited. Please update your profile to create a permanent account.");
      setLoading(false);
    } else {
      // Verify the user exists in the API
      const verifyUser = async () => {
        try {
          console.log('Verifying user with ID:', userId);
          await userApi.getUser(userId)
          setLoading(false)
        } catch (error) {
          console.error("Error verifying user:", error)
          
          // Check if error is due to API connection issues
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // If API is not available, we'll still allow access with a warning
            console.log('API connection issue - proceeding with limited functionality');
            setApiError("API connection issue. Some features may be limited.");
            setLoading(false);
          } else if (typeof error === 'object' && error !== null && 'message' in error && 
                    typeof error.message === 'string' && error.message.includes('404')) {
            // Handle 404 errors specifically
            console.log('User not found in API (404 error) - proceeding with limited functionality');
            setApiError("User not found in database. Some features may be limited.");
            setLoading(false);
          } else if (userId.startsWith('temp_')) {
            // If it's a temporary ID, we'll still allow access
            console.log('Using temporary user ID - proceeding with limited functionality');
            setApiError("Using temporary user ID. Some features may be limited.");
            setLoading(false);
          } else {
            // If user doesn't exist in the API, clear cookie and redirect to /user
            document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            router.push('/user')
          }
        }
      }
      
      verifyUser()
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">PsychoMetric Pro</h1>
                      <p className="text-sm text-gray-600">Student Assessment Platform</p>
                    </div>
                  </div>
                  <div>
                    {/* We'll determine the link client-side but use Link for better routing */}
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => {
                        // Get user ID from cookie
                        const userId = document.cookie
                          .split('; ')
                          .find(row => row.startsWith('user_id='))
                          ?.split('=')[1];
                        
                        console.log('Profile button clicked, userId from cookie:', userId);
                        
                        // Navigate to the appropriate page
                        if (userId) {
                          console.log('Navigating to user profile:', `/user/${userId}`);
                          window.location.href = `/user/${userId}`;
                        } else {
                          console.log('No user ID found, navigating to user registration');
                          window.location.href = '/user';
                        }
                      }}
                    >
                      My Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        // Clear the cookie and redirect to user page
                        document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                        router.push('/user');
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </header>
            
            {/* API Error Banner */}
            {apiError && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center">
                  <p className="text-amber-800 text-sm">{apiError}</p>
                </div>
              </div>
            )}
            
            {/* Main content */}
            <div className="flex-1 overflow-auto">
              <MainContent 
                selectedItem={selectedItem} 
                onItemSelect={setSelectedItem} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
