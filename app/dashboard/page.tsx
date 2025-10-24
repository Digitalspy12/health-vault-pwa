"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import ProfileForm from "@/components/profile-form"
import MedicalHistoryForm from "@/components/medical-history-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Health Vault</h1>
            <p className="text-blue-100 text-sm">{user?.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="bg-white text-blue-600 hover:bg-blue-50 border-0"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Personal Information</h2>
              <ProfileForm userId={user?.id} />
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Medical History</h2>
              <MedicalHistoryForm userId={user?.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
