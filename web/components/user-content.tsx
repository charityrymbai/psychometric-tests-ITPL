"use client"

import { useState, useEffect } from "react"
// import { TreeSidebar } from "@/components/tree-sidebar"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, GraduationCap, Brain, Target, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Use NEXT_PUBLIC_ prefix for env variables in Next.js frontend
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
}

interface UserContentProps {
  userId: string;
}

// Define the type for the selected item
type SelectedItemType = {
  type: "home" | "group" | "section" | "questions" | "test" | "results";
  id?: string;
  groupId?: string;
  sectionId?: string;
  data?: any;
}

export function UserContent({ userId }: UserContentProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<SelectedItemType>({ type: "home" });
  const [groups, setGroups] = useState<any[]>([]);
  // Mock data for TreeSidebar that matches its interface
  // const [treeData, setTreeData] = useState<any[]>([]);

  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     try {
  //       const res = await fetch(`${BACKEND_BASE_URL}/groups/getAll`);
  //       if (!res.ok) {
  //         throw new Error(`Failed to fetch groups: ${res.status}`);
  //       }
  //       const data = await res.json();
  //       setGroups(data);
        
  //       // Format the data for the TreeSidebar component
  //       const formattedData = data.map((group: any) => ({
  //         id: group.id,
  //         name: group.name,
  //         sections: group.sections || []
  //       }));
  //       setTreeData(formattedData);
  //     } catch (error) {
  //       console.error("Error fetching groups:", error);
  //     }
  //   };

  //   fetchGroups();
  // }, []);

  // Check if user exists - if not, redirect to home
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/users/${userId}`);
        if (!res.ok) {
          // User doesn't exist or other error
          console.error("User not found or error fetching user");
          router.push('/');
        }
      } catch (error) {
        console.error("Error checking user:", error);
        router.push('/');
      }
    };

    checkUser();
  }, [userId, router]);

  // Custom handler for item selection to match TreeSidebar expectations
  const handleItemSelect = (item: { type: string; id: string }) => {
    setSelectedItem({
      ...selectedItem,
      type: item.type as any,
      id: item.id
    });
  };

  // Simplify the selected item for the TreeSidebar
  const simplifiedSelectedItem = selectedItem ? {
    type: selectedItem.type,
    id: selectedItem.id || ""
  } : null;

  return (
    <div className="grid grid-cols-3 h-screen w-screen">
      {/* Pass correctly formatted data to TreeSidebar */}
      {/* <TreeSidebar 
        data={treeData} 
        onItemSelect={handleItemSelect} 
        selectedItem={simplifiedSelectedItem} 
      /> */}
      
      <MainContent selectedItem={selectedItem} onItemSelect={(item) => setSelectedItem(item)}>
        {selectedItem.type === "home" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome to your psychometric assessment dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/settings">
                  <Button variant="outline">Settings</Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Available Assessment Groups</h2>
                
                {groups.length === 0 ? (
                  <div className="text-center p-12 border rounded-lg bg-muted/10">
                    <h3 className="text-xl font-medium mb-2">No assessment groups available</h3>
                    <p className="text-muted-foreground mb-4">
                      There are currently no assessment groups assigned to you.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                      <Card key={group.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                        <CardHeader className="pb-4">
                          <div 
                            className="flex cursor-pointer items-start"
                            onClick={() => setSelectedItem({
                              type: "group",
                              id: group.id
                            })}
                          >
                            <div className="space-y-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                {group.name}
                                <Badge variant="outline" className="ml-2 text-xs font-normal">
                                  {group.sections?.length || 0} {group.sections?.length === 1 ? 'Section' : 'Sections'}
                                </Badge>
                              </CardTitle>
                              <Badge variant="secondary" className="mt-1">
                                {group.tags?.map((tag: string) => tag).join(', ') || 'No tags'}
                              </Badge>
                              <CardDescription className="text-sm pt-2">
                                {group.description || 'No description available'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedItem({
                                type: "group",
                                id: group.id
                              })}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </MainContent>
    </div>
  );
}
