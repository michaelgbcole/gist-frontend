import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, File } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { on } from 'events';

interface FileInfo {
  name: string;
  url: string;
  created_at: string;
  size?: number;
}

interface Rubric {
  id: string;
  rubricJSON: {
    title: string;
    criteria: {
      name: string;
      description: string;
      points: number;
    }[];
  };
}

interface BatchCreatorProps {
  userId: string;
  supabase: any;
  name: string;
  onClose: () => void;
}

const BatchCreator: React.FC<BatchCreatorProps> = ({ userId, supabase, name: batchName, onClose }) => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newFiles, setNewFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    if (userId) {
      fetchFiles(userId, batchName);
      fetchRubrics(userId);
    }
  }, [userId]);

  const fetchFiles = async (userId: string, batchName: string) => {
    try {
      const response = await fetch(`/api/get-essays?userId=${userId}&batchName=${batchName}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      const filteredData = data.filter((file: FileInfo) => file.name !== '.emptyFolderPlaceholder');
      setNewFiles(filteredData);
      setSelectedFiles(filteredData); // Automatically select all files
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    }
  };

  const fetchRubrics = async (userId: string) => {
    try {
      const response = await fetch(`/api/get-rubrics?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch rubrics');
      const data = await response.json();
      setRubrics(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rubrics",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userId) return;
    const files = Array.from(event.target.files);
    setUploading(true);
    try {
      for (const file of files) {
        const { data, error } = await supabase.storage
          .from('essays')
          .upload(`${userId}/${batchName}/${file.name}`, file);
        if (error) throw error;
        toast({
          title: "Success",
          description: `File ${file.name} uploaded successfully`,
        });
        console.log('data', data);
      }
      await fetchFiles(userId, batchName); // Fetch files again to update the list and auto-select
    } catch (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error) || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };


  const handleRubricSelect = (rubricId: string) => {
    const selected = rubrics.find(rubric => rubric.id === rubricId) || null;
    setSelectedRubric(selected);
  };

  const handleStartBatch = () => {
    const rubricId = selectedRubric?.id;
    fetch('/api/start-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedFiles,
        rubricId,
        batchName,
        userId,
      }),
    })
    onClose()
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className=''>
      <DialogHeader>
        <DialogTitle>Batch Creator</DialogTitle>
      </DialogHeader>
    <ScrollArea>
      <Card>
        <CardHeader>
          <CardTitle>Batch Creator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div className="flex items-center space-x-2">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              multiple
              className="flex-grow"
            />
            <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading || batchName === ''}>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {newFiles.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center">
                      <File className="mr-2 h-4 w-4" />
                      {file.name}
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
          <Button onClick={handleStartBatch} disabled={selectedFiles.length === 0}>
            Start Batch
          </Button>
        </CardContent>
      </Card>
    </ScrollArea>
    </DialogContent>
    </Dialog>
  );
};

export default BatchCreator;