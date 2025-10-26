"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoadingScreen() {
  const [showText, setShowText] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show text after 1.5 seconds (logo displays for 1.5 sec)
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 1500)

    // Show loading animation after 2.5 seconds (text displays for 1 sec)
    const loaderTimer = setTimeout(() => {
      setShowLoader(true)
    }, 2500)

    // Redirect to app after 5.5 seconds total (loading animation shows for 3 sec)
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard")
    }, 5500)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(loaderTimer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center">
      {/* Logo Container - Always visible first */}
      <div className="mb-8 animate-fade-in">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <svg className="w-16 h-16 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>
      </div>

      {/* Welcome Text - Shows after 1.5 seconds */}
      {showText && (
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to</h1>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Health Vault
          </h2>
          <p className="text-slate-300 mt-4 text-sm">Your secure medical records</p>
        </div>
      )}

      {showLoader && (
        <div className="mt-12 flex gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      )}
    </div>
  )
}
