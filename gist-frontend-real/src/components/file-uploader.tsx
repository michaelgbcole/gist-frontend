import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, File } from "lucide-react";

type FileInfo = {
    name: string;
    url: string;
    created_at: string;
    size?: number;
};

type rubricJSON = {
    title: string;
    criteria: {
        name: string;
        description: string;
        points: number;
    }[];
}

type Rubric = {
    id: string;
    rubricJSON: rubricJSON;
};

interface FileUploadDialogProps {
  userId: string;
  supabase: any; // Replace 'any' with the appropriate type if available
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({ userId, supabase }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [selectedRubric, setSelectedRubric] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gradingResult, setGradingResult] = useState<string | null>(null);

  const [grading, setGrading] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'select'>('upload');

  useEffect(() => {
    if (open && userId) {
      fetchFiles(userId);
      fetchRubrics(userId);
    }
  }, [open, userId]);

  const fetchFiles = async (userId: string) => {
    try {
      const response = await fetch(`/api/get-essays?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
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
    if (!event.target.files || !event.target.files[0] || !userId) return;
    const file = event.target.files[0];
    setUploading(true);

    try {
      const { data, error } = await supabase.storage
        .from('essays')
        .upload(`${userId}/${file.name}`, file);

      if (error) throw error;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      await fetchFiles(userId);
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

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
    setStep('select');
  };

  const handleRubricSelect = (rubricId: string) => {
    setSelectedRubric(rubricId);
  };

  const handleGrade = async () => {
    if (!selectedFile || !selectedRubric) return;

    setGrading(true);
    setGradingResult(null);
    try {
      const response = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: selectedFile.url,
          rubricId: selectedRubric,
        }),
      });

      if (!response.ok) throw new Error('Failed to grade essay');

      const result = await response.json();
      setGradingResult(JSON.stringify(result, null, 2));

      toast({
        title: "Success",
        description: "Essay graded successfully",
      });

      // We're not resetting the state here anymore so the user can see the result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grade essay",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Manage Files</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{step === 'upload' ? 'Manage Files' : 'Grade Essay'}</DialogTitle>
        </DialogHeader>
        {step === 'upload' ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold">Your Files</h3>
              {files.length === 0 ? (
                <p>No files uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <File className="mr-2 h-4 w-4" />
                        {file.name}
                      </div>
                      <Button onClick={() => handleFileSelect(file)}>Select</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <p>Selected File: {selectedFile?.name}</p>
            <Select onValueChange={handleRubricSelect}>
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
            <Button onClick={handleGrade} disabled={!selectedRubric || grading}>
              {grading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                'Grade'
              )}
                        </Button>
            {gradingResult && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Grading Result:</h4>
                <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
                  {gradingResult}
                </pre>
              </div>
            )}
            <Button onClick={() => {
              setStep('upload');
              setGradingResult(null);
              setSelectedFile(null);
              setSelectedRubric(null);
            }}>Back</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;