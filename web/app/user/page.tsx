"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StudentForm } from "@/components/student-form"

export default function UserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  useEffect(() => {
    // Function to get cookie value
    const getCookieValue = (name: string) => {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];
    }
    
    // Get the user ID from cookie
    const userId = getCookieValue('user_id')
    console.log('User page loaded, userId from cookie:', userId)
    
    if (userId) {
      // If user_id exists, redirect to the specific user page
      console.log('Redirecting to user profile:', `/user/${userId}`)
      
      // Use window.location for a hard redirect that will work more reliably
      window.location.href = `/user/${userId}`
    } else {
      // Only show the form if there's no user ID
      console.log('No user ID found, showing registration form')
      setShowForm(true)
      setLoading(false)
    }
  }, [])

  // Show loading or the form if no redirect happens
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 md:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        ) : showForm ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                PsychoMetric Tests
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                Comprehensive psychometric assessments designed for students of all ages
              </p>
            </div>
            {/* Student form */}
            <StudentForm />
          </>
        ) : null}
      </div>
    </div>
  )
}
