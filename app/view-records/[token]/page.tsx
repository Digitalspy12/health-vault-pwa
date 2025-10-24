"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UserProfile {
  full_name: string
  date_of_birth: string
  blood_type: string
  gender: string
  phone_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  allergies: string
  current_medications: string
  chronic_conditions: string
  insurance_provider: string
  insurance_policy_number: string
}

interface MedicalRecord {
  id: string
  condition_name: string
  diagnosis_date: string
  description: string
  status: string
}

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  upload_date: string
  file_path: string
}

export default function ViewRecordsPage() {
  const params = useParams()
  const token = params.token as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("profile")
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Extract user ID from token
        const userId = token.split("-")[0]

        // Verify token is valid (check if QR code exists)
        const { data: qrData, error: qrError } = await supabase
          .from("qr_codes")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .single()

        if (qrError || !qrData) {
          setError("Invalid or expired QR code")
          setLoading(false)
          return
        }

        // Fetch profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch medical history
        const { data: historyData } = await supabase
          .from("medical_history")
          .select("*")
          .eq("user_id", userId)
          .order("diagnosis_date", { ascending: false })

        if (historyData) {
          setMedicalHistory(historyData)
        }

        // Fetch documents
        const { data: docsData } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", userId)
          .order("upload_date", { ascending: false })

        if (docsData) {
          setDocuments(docsData)
        }
      } catch (err) {
        setError("Error loading records")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchRecords()
    }
  }, [token, supabase])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading medical records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 bg-card border border-border max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-card-foreground mb-2">Unable to Load Records</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-blue-100 text-sm">Shared via Health Vault QR Code</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("medical")}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeTab === "medical"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Medical History
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeTab === "documents"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Documents
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && profile && (
          <div className="space-y-4">
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-lg font-bold text-card-foreground mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-foreground">{profile.full_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold text-foreground">
                    {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blood Type</p>
                  <p className="font-semibold text-foreground">{profile.blood_type || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-semibold text-foreground">{profile.gender || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-semibold text-foreground">{profile.phone_number || "Not provided"}</p>
                </div>
              </div>
            </Card>

            {profile.emergency_contact_name && (
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-lg font-bold text-card-foreground mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Contact Name</p>
                    <p className="font-semibold text-foreground">{profile.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact Phone</p>
                    <p className="font-semibold text-foreground">{profile.emergency_contact_phone}</p>
                  </div>
                </div>
              </Card>
            )}

            {(profile.allergies || profile.current_medications || profile.chronic_conditions) && (
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-lg font-bold text-card-foreground mb-4">Medical Information</h2>
                <div className="space-y-4">
                  {profile.allergies && (
                    <div>
                      <p className="text-xs text-muted-foreground">Allergies</p>
                      <p className="font-semibold text-foreground">{profile.allergies}</p>
                    </div>
                  )}
                  {profile.current_medications && (
                    <div>
                      <p className="text-xs text-muted-foreground">Current Medications</p>
                      <p className="font-semibold text-foreground">{profile.current_medications}</p>
                    </div>
                  )}
                  {profile.chronic_conditions && (
                    <div>
                      <p className="text-xs text-muted-foreground">Chronic Conditions</p>
                      <p className="font-semibold text-foreground">{profile.chronic_conditions}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {(profile.insurance_provider || profile.insurance_policy_number) && (
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-lg font-bold text-card-foreground mb-4">Insurance Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.insurance_provider && (
                    <div>
                      <p className="text-xs text-muted-foreground">Insurance Provider</p>
                      <p className="font-semibold text-foreground">{profile.insurance_provider}</p>
                    </div>
                  )}
                  {profile.insurance_policy_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">Policy Number</p>
                      <p className="font-semibold text-foreground">{profile.insurance_policy_number}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === "medical" && (
          <div className="space-y-3">
            {medicalHistory.length === 0 ? (
              <Card className="p-6 bg-card border border-border text-center">
                <p className="text-muted-foreground">No medical history records available</p>
              </Card>
            ) : (
              medicalHistory.map((record) => (
                <Card key={record.id} className="p-4 bg-card border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-card-foreground">{record.condition_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.diagnosis_date ? new Date(record.diagnosis_date).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        record.status === "active"
                          ? "bg-red-100 text-red-700"
                          : record.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                  {record.description && <p className="text-sm text-foreground">{record.description}</p>}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <Card className="p-6 bg-card border border-border text-center">
                <p className="text-muted-foreground">No documents available</p>
              </Card>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id} className="p-4 bg-card border border-border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-card-foreground">{doc.file_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} • {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => window.open(doc.file_path, "_blank")}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
