"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/loading-screen"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 3-second loading screen
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Redirect to auth or dashboard
      router.push("/auth/signin")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  if (isLoading) {
    return <LoadingScreen />
  }

  return null
}
