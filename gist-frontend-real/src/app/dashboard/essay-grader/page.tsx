"use client"

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import RubricMaker from '@/components/rubric-creator'
import FileUploadDialog from '@/components/file-uploader'


export default function FileUploadDashboard() {
  const [user, setUser] = useState<User | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    getUser()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Essay Grading Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
          <FileUploadDialog userId={user?.id ?? ''} supabase={supabase} />
      </CardContent>
    </Card>
  )
}