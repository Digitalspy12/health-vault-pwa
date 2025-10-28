-- This script fixes public access for QR code sharing
-- Run this in the Supabase SQL Editor after running the initial schema

-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own medical history" ON medical_history;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;

-- Create new policies that allow public access via QR code
-- Profiles: Allow public read access (for QR code sharing)
CREATE POLICY "Public can view profiles via QR" ON profiles
  FOR SELECT USING (true);

-- Medical History: Allow public read access (for QR code sharing)
CREATE POLICY "Public can view medical history via QR" ON medical_history
  FOR SELECT USING (true);

-- Documents: Allow public read access (for QR code sharing)
CREATE POLICY "Public can view documents via QR" ON documents
  FOR SELECT USING (true);

-- Keep write policies restricted to authenticated users
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own medical history" ON medical_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical history" ON medical_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical history" ON medical_history
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Fix storage bucket policies to allow public access to files
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;

CREATE POLICY "Public can read documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'medical-documents');
