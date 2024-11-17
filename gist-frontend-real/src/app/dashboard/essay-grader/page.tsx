"use client";
import React, { useState, useEffect } from 'react';
import Frame from "@/components/new-ui/main-frame";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardIcon, PencilIcon, WandIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface FileInfo {
  name: string;
}

type JSONRUBRIC = {
  title: string;
}

interface Rubric {
  id: string;
  rubricJSON: JSONRUBRIC;
}

const Grader = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [batchName, setBatchName] = useState('');
  const [newFiles, setNewFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rubricTitles, setRubricsTitles] = useState<string[]>([]);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch current user's ID on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      console.log('trying')
      fetchFiles(userId, batchName);
      fetchRubrics(userId);
    }
  }, [userId, batchName]);

  const fetchFiles = async (userId: string, batchName: string) => {
    try {
      const response = await fetch(`/api/get-essays?userId=${userId}&batchName=${batchName}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      const filteredData = data.filter((file: FileInfo) => file.name !== '.emptyFolderPlaceholder');
      setNewFiles(filteredData);
      setSelectedFiles(filteredData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    }
  };

  const fetchRubrics = async (userId: string) => {
    console.log('fetching rubrics')
    try {
      const response = await fetch(`/api/get-rubrics?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch rubrics');
      const data = await response.json();
      const rubricTitles = data.map((rubric: Rubric) => rubric.rubricJSON);
      console.log('rubric titles', rubricTitles);
      setRubrics(data);
      setRubricsTitles(rubricTitles);
      console.log('data frrfrfr', rubricTitles)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rubrics",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userId || !batchName) {
      toast({
        title: "Error",
        description: "Please enter a batch name first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const files = Array.from(event.target.files);

    try {
      for (const file of files) {
        const { error } = await supabase.storage
          .from('essays')
          .upload(`${userId}/${batchName}/${file.name}`, file);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Files uploaded successfully`,
      });

      // Refresh file list
      await fetchFiles(userId, batchName);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRubricSelect = (rubricId: string) => {
    console.log('rubricId', rubricId)
    const selected = rubrics.find(rubric => rubric.id === rubricId) || null;
    setSelectedRubric(selected);
  };

  const handleStartBatch = async () => {
    if (!selectedRubric || !batchName || selectedFiles.length === 0) {
      console.log('batchName', batchName)
      console.log('selectedFiles', selectedFiles)
      console.log('selectedRubric', selectedRubric)
      console.log('userId', userId)
      toast({
        title: "Error",
        description: "Please select a rubric, enter a batch name, and upload files",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/start-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedFiles,
          rubricId: selectedRubric.id,
          batchName,
          userId,
        }),
      });
      router.push('/dashboard')

      if (!response.ok) throw new Error('Failed to start batch');

      toast({
        title: "Success",
        description: "Batch started successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start batch",
        variant: "destructive",
      });
    }
  };

  return (
    <Frame>
      <Card className="w-full max-w-4xl p-5 space-y-5">
        <div className="flex gap-4">
          <Select onValueChange={handleRubricSelect}>
            <SelectTrigger
              className="w-full h-20 bg-[#bba8ff] rounded-lg shadow-md flex items-center justify-start px-6 gap-4"
            >
              <ClipboardIcon className="h-6 w-6 text-white" />
              <SelectValue placeholder="Select Rubric" />
            </SelectTrigger>
            <SelectContent>
            {rubrics.map((rubric: any, index) => (
              <SelectItem key={index} value={rubric.id}>
                {rubric.rubricJSON?.title}
              </SelectItem>
            ))
            }

            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Input
            className="w-72 h-[67px] bg-[#85e0a3] rounded-[17px] pl-12 text-[#00000080] font-bold"
            placeholder="Batch Name"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <PencilIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#00000080]" />
        </div>

        <div>
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-full h-[227px] bg-blue-50 border border-dashed border-black rounded flex flex-col items-center justify-center gap-2">
              <span className="text-3xl font-bold text-[#66666666] tracking-tight">
                {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
              </span>
              {selectedFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected
                </div>
              )}
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading || !batchName}
            accept=".pdf,.doc,.docx,.txt"
          />
        </div>

        <div className="flex justify-end">
          <Card 
            onClick={handleStartBatch}
            className="w-[282px] h-[82px] bg-[#85e0a3] rounded-[9.59px] border border-black shadow-md flex items-center justify-center gap-4 cursor-pointer hover:bg-[#75d093] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[#333333] text-4xl font-bold tracking-tight">
              Start
            </span>
            <WandIcon className="h-12 w-12 text-[#333333]" />
          </Card>
        </div>
      </Card>
    </Frame>
  );
};

export default Grader;