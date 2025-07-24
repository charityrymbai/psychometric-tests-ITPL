import { ReactNode } from "react"
import { TreeSidebar } from "@/components/tree-sidebar"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  // You may want to pass real selectedItem/onItemSelect if you want sidebar to be interactive
  return (
    <div className="flex min-h-screen">
      <aside className="w-80 border-r bg-white">
        <TreeSidebar />
      </aside>
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {children}
      </main>
    </div>
  )
}
