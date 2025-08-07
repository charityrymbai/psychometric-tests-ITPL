"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { userApi, DIRECT_SERVER_URL } from "@/lib/api-client"

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    class: 0
  })
  
  useEffect(() => {
    // Check for user_id cookie when component mounts
    const getCookieValue = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? match[2] : null
    }
    
    const cookieUserId = getCookieValue('user_id')
    
    // If no user_id cookie exists or it doesn't match the URL parameter, redirect to /user
    if (!cookieUserId) {
      router.push('/user')
    } else if (cookieUserId !== userId) {
      // If cookie user_id doesn't match URL parameter, redirect to the correct user page
      router.push(`/user/${cookieUserId}`)
    } else {
      // Fetch user data from API
      const fetchUser = async () => {
        try {
          console.log('Fetching user data for ID:', userId);
          const userData = await userApi.getUser(userId)
          // Handle case where class might be returned as string
          const userClass = typeof userData.class === 'string' ? parseInt(userData.class, 10) : userData.class;
          
          setUser({
            ...userData,
            class: userClass
          })
          setFormData({
            name: userData.name,
            class: userClass
          })
        } catch (error) {
          console.error("Error fetching user:", error)
          
          // Check if error is due to API connection issues
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // If API is not available, create a placeholder user
            console.log('API connection issue - creating placeholder user');
            setApiError("API connection issue. Using local data only.");
            setUser({
              id: userId,
              name: userId.startsWith('temp_') ? 'Temporary User' : 'User',
              class: 0
            });
            setFormData({
              name: userId.startsWith('temp_') ? 'Temporary User' : 'User',
              class: 0
            });
          } else if (typeof error === 'object' && error !== null && 'message' in error && 
                    typeof error.message === 'string' && error.message.includes('404')) {
            // Handle 404 errors specifically
            console.log('User not found in API (404 error)');
            setApiError("User not found in database. Using local data only.");
            setUser({
              id: userId,
              name: userId.startsWith('temp_') ? 'Temporary User' : 'User',
              class: 0
            });
            setFormData({
              name: userId.startsWith('temp_') ? 'Temporary User' : 'User',
              class: 0
            });
          } else if (userId.startsWith('temp_')) {
            // If it's a temporary ID, create a placeholder user
            console.log('Using temporary user ID - creating placeholder user');
            setApiError("Using temporary user ID. Some features may be limited.");
            setUser({
              id: userId,
              name: 'Temporary User',
              class: 0
            });
            setFormData({
              name: 'Temporary User',
              class: 0
            });
          } else {
            // If user doesn't exist in the API, clear cookie and redirect to /user
            document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            router.push('/user')
          }
        } finally {
          setLoading(false)
        }
      }
      
      fetchUser()
    }
  }, [router, userId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'class' ? (parseInt(value) || 0) : value
    });
  }

  /**
   * Handles updating user information
   * - Attempts to update user on the server
   * - Falls back to local updates if server is unavailable or returns 404
   * - Updates UI state based on the result
   */

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      
      const userData = {
        name: formData.name,
        class: formData.class
      };

      // Check if this is a temporary user ID that needs conversion to a permanent ID
      const isTemporaryUser = userId.startsWith('temp_');
      
      // If it's a temporary user, we'll try to create a new user instead of updating
      if (isTemporaryUser) {
        try {
          console.log('Converting temporary user to permanent user...');
          // Generate a numeric ID for the backend since it requires an integer
          const tempNumericId = Math.floor(1000 + Math.random() * 9000);
          // Use the createUser API to get a permanent ID
          const newUser = await userApi.createUser(tempNumericId.toString(), userData);
          
          console.log('Create user response:', newUser);
          // Extract user_id from response - the API returns either { id: "1" } or { user_id: "1" }
          const permanentId = newUser.user_id || newUser.id;
          
          if (permanentId) {
            // Got a permanent ID, update the cookie
            console.log('Converted to permanent user ID:', permanentId);
            
            // Update the cookie with the new permanent ID
            document.cookie = `user_id=${permanentId}; path=/; max-age=${60 * 60 * 24 * 7}`;
            
            // Redirect to the new user profile page
            setApiError("User account created successfully. Redirecting...");
            setTimeout(() => {
              router.push(`/user/${permanentId}`);
            }, 1500);
            return;
          }
        } catch (createError) {
          console.error('Failed to convert temporary user:', createError);
          // Continue with local update if creation fails
        }
      }

      // Regular update flow (for permanent users or if conversion failed)
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        
        const requestOptions = {
          method: "POST", // Using POST for updates as per your API implementation
          headers: myHeaders,
          body: JSON.stringify(userData),
          redirect: "follow" as RequestRedirect
        };

        const response = await fetch(`${DIRECT_SERVER_URL}/user/${userId}`, requestOptions);
        
        if (response.ok) {
          const result = await response.json();
          // Update the user state with what we get back from the server
          // Handle case where class might be returned as string by ensuring it's a number
          const updatedClass = typeof result.class === 'string' ? parseInt(result.class, 10) : result.class;
          
          setUser({
            ...user,
            name: result.name || formData.name,
            class: updatedClass || formData.class
          });
          setApiError(null);
          setIsEditing(false);
        } else if (response.status === 404) {
          console.error("User not found on server when updating");
          // Even if the API returns 404, we'll update the local user state
          setUser({
            ...user,
            name: formData.name,
            class: formData.class
          });
          setApiError("Warning: Changes saved locally only. Server could not find user.");
          setIsEditing(false);
        } else {
          throw new Error(`Error updating user: ${response.status}`);
        }
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          console.error("API connection issue when updating user");
          // Even if the API is unavailable, we'll update the local user state
          setUser({
            ...user,
            name: formData.name,
            class: formData.class
          });
          setApiError("Warning: Changes saved locally only. Could not connect to server.");
          setIsEditing(false);
        } else {
          throw error; // Re-throw for the outer catch block
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setApiError("Failed to update user information. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // User profile display
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 md:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        ) : user ? (
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Welcome to Your PsychoMetric Tests
            </h1>
            
            {apiError && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 mx-auto max-w-lg">
                {apiError}
              </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">Student Profile</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-start">
                    <label className="text-gray-700 mb-1">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <label className="text-gray-700 mb-1">Class:</label>
                    <input
                      type="number"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleUpdateUser}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name,
                          class: user.class
                        });
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg mb-2">
                    <span className="font-medium">Name:</span> {user.name}
                  </p>
                  <p className="text-lg mb-2">
                    <span className="font-medium">Class:</span> {user.class}
                  </p>
                  <p className="text-lg mb-2">
                    <span className="font-medium">ID:</span> {user.id || user.user_id}
                  </p>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
            <div className="mt-8">
              <button 
                onClick={() => {
                  // Clear the cookie and redirect to user page
                  document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  router.push('/user');
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-red-600">User not found</p>
            <button 
              onClick={() => router.push('/user')}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}