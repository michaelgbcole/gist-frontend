import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Upload, File, ChevronUp, ChevronDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parse } from 'path'

type FileInfo = {
  name: string
  url: string
  created_at: string
  size?: number
}

type rubricJSON = {
  title: string
  criteria: {
    name: string
    description: string
    points: number
  }[]
}

type Rubric = {
  id: string
  rubricJSON: rubricJSON
}

type response = {
  feedback: string
  score: number
}

interface BatchCreatorProps {
  userId: string
  supabase: any
  name: string
}

export default function BatchCreator({ userId, supabase, name: batchName }: BatchCreatorProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]); const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newFiles, setNewFiles] = useState<FileInfo[]>([])



  useEffect(() => {
    if (userId) {
      fetchFiles(userId, batchName)
      fetchRubrics(userId)
    }
  }, [userId])



  const fetchFiles = async (userId: string, batchName: string) => {
    try {
      const response = await fetch(`/api/get-essays?userId=${userId}&batchName=${batchName}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      const data = await response.json()
      console.log('data type shiitiiit', data)
      const filteredData = data.filter((file: FileInfo) => file.name !== '.emptyFolderPlaceholder')
      setNewFiles(filteredData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      })
    }
  }

  const fetchRubrics = async (userId: string) => {
    try {
      const response = await fetch(`/api/get-rubrics?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch rubrics')
      const data = await response.json()
      setRubrics(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rubrics",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !userId) return
    const file = event.target.files[0]
    setUploading(true)
    fetchFiles(userId, batchName)
    try {
      const { data, error } = await supabase.storage
        .from('essays')
        .upload(`${userId}/${batchName}/${file.name}`, file)

      if (error) throw error

      toast({
        title: "Success",
        description: "File uploaded successfully",
      })

        fetchFiles(userId, batchName)
    } catch (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error) || "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(file)) {
        return prevSelectedFiles.filter((f) => f !== file);
      } else {
        return [...prevSelectedFiles, file];
      }
    });
  };

  const handleRubricSelect = (rubricId: string) => {
    const selected = rubrics.find(rubric => rubric.id === rubricId) || null
    setSelectedRubric(selected)
  }

  return (
    <ScrollArea className="h-[60vh]">
        <Card>
          <CardHeader>
            <CardTitle>Batch Creator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-grow"
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading || batchName == ''}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Files</h3>
              
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {newFiles.map((file, index) => (
            <TableRow key={index}>
              <TableCell className="flex items-center">
                <File className="mr-2 h-4 w-4" />
                {file.name}
              </TableCell>
              <TableCell>
                <Button
                  variant={selectedFiles.includes(file) ? "default" : "outline"}
                  onClick={() => handleFileSelect(file)}
                >
                  {selectedFiles.includes(file) ? "Deselect" : "Select"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
                  </TableBody>
                </Table>

              <Select onValueChange={(value) => handleRubricSelect(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rubric" />
              </SelectTrigger>
              <SelectContent>
                {rubrics.map((rubric) => (
                  <SelectItem key={rubric.id} value={rubric.id}>
                    {rubric.rubricJSON?.title ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            <Button disabled={selectedFiles.length === 0}>
              Start Batch
            </Button>
          </CardContent>
        </Card>
    </ScrollArea>
  )
}