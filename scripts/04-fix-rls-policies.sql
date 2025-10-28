-- This script fixes RLS policies for public access using the correct table names
-- Run this in the Supabase SQL Editor

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can view profiles via QR" ON user_profiles;

DROP POLICY IF EXISTS "Users can insert their own medical history" ON medical_records;
DROP POLICY IF EXISTS "Users can update their own medical history" ON medical_records;
DROP POLICY IF EXISTS "Users can delete their own medical history" ON medical_records;
DROP POLICY IF EXISTS "Public can view medical history via QR" ON medical_records;

DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Public can view documents via QR" ON documents;

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_access_logs ENABLE ROW LEVEL SECURITY;

-- USER PROFILES TABLE POLICIES
-- Allow public read access for QR code sharing
CREATE POLICY "Public can view profiles via QR" ON user_profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- MEDICAL RECORDS TABLE POLICIES
-- Allow public read access for QR code sharing
CREATE POLICY "Public can view medical records via QR" ON medical_records
  FOR SELECT USING (true);

-- Allow users to insert their own medical records
CREATE POLICY "Users can insert their own medical records" ON medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own medical records
CREATE POLICY "Users can update their own medical records" ON medical_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own medical records
CREATE POLICY "Users can delete their own medical records" ON medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- DOCUMENTS TABLE POLICIES
-- Allow public read access for QR code sharing
CREATE POLICY "Public can view documents via QR" ON documents
  FOR SELECT USING (true);

-- Allow users to insert their own documents
CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- QR ACCESS LOGS TABLE POLICIES
-- Allow users to insert their own QR access logs
CREATE POLICY "Users can insert their own QR logs" ON qr_access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own QR access logs
CREATE POLICY "Users can view their own QR logs" ON qr_access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- STORAGE BUCKET POLICIES
-- Allow public read access to medical documents
DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;

CREATE POLICY "Public can read medical documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'medical-documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medical-documents' AND auth.role() = 'authenticated');

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents from storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
