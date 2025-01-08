"use client";
import React, { useState, useEffect, DragEvent } from 'react';
import Frame from "@/components/new-ui/main-frame";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardIcon, PencilIcon, WandIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import RubricMaker from '@/components/rubric-creator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ManualGrader from '@/components/manual-grader';
import { Button } from '@/components/ui/button';


interface FileInfo {
  name: string;
  assignedStudent?: string; // Add this to track student assignment
}

type JSONRUBRIC = {
  title: string;
  total_points: number;
  criteria: {
    name: string;
    points: number;
    description: string;
  }[];
};

interface ClassData {
  id: string;
  name: string;
  students: StudentData[];
}

interface StudentData {
  id: string;
  name: string;
}

interface Rubric {
  id: string;
  rubricJSON: JSONRUBRIC;
}

// Add this mock data near the top of the file, after interfaces
const mockClassData: ClassData[] = [
  {
    id: "class1",
    name: "English 101",
    students: [
      { id: "s1", name: "John Smith" },
      { id: "s2", name: "Emma Wilson" },
      { id: "s3", name: "Michael Brown" },
    ]
  },
  {
    id: "class2",
    name: "Creative Writing",
    students: [
      { id: "s4", name: "Sarah Johnson" },
      { id: "s5", name: "David Lee" },
      { id: "s6", name: "Lisa Anderson" },
    ]
  }
];

const Grader = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [batchName, setBatchName] = useState('');
  const [newFiles, setNewFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExample, setUploadingExample] = useState(false);
  const [rubricJSON, setRubricJSON] = useState<string[]>([]);
  const router = useRouter();
  const [isStartable, setIsStartable] = useState<boolean>(true); 
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingExample, setIsDraggingExample] = useState(false);
  const [exampleFiles, setExampleFiles] = useState<FileInfo[]>([]); 
  const [isGrading, setIsGrading] = useState(false);
  const [currentFileToGrade, setCurrentFileToGrade] = useState<string>('');
  const [exampleGrades, setExampleGrades] = useState<{[key: string]: any}>({});
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [fileAssignments, setFileAssignments] = useState<Record<string, string>>({});

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

  useEffect(() => {
    // Comment out the API fetch and replace with mock data
    setClasses(mockClassData);
    /* Comment out the actual API call for now
    const fetchClassData = async () => {
      if (userId) {
        try {
          const response = await fetch('/api/get-all-class-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teacherId: userId }),
          });
  
          if (response.ok) {
            const { classes } = await response.json();
            setClasses(classes);
          }
        } catch (error) {
          console.error('Error fetching class data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch class data",
            variant: "destructive",
          });
        }
      }
    };
  
    fetchClassData();
    */
  }, [userId]);

  const handleDrag = (e: DragEvent, setDragging: (dragging: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragging(true);
    } else if (e.type === "dragleave") {
      setDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent, isExample: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId || !batchName) {
      toast({
        title: "Error",
        description: "Please enter a batch name first",
        variant: "destructive",
      });
      return;
    }
  
    isExample ? setUploadingExample(true) : setUploadingMain(true);
    isExample ? setIsDraggingExample(false) : setIsDraggingMain(false);
  
    const droppedFiles = Array.from(e.dataTransfer.files);
  
    try {
      for (const file of droppedFiles) {
        const path = isExample 
          ? `${userId}/${batchName}/examples/${file.name}`
          : `${userId}/${batchName}/tograde/${file.name}`;
  
        const { error } = await supabase.storage
          .from('essays')
          .upload(path, file);
  
        if (error) throw error;
      }
  
      toast({
        title: "Success",
        description: `Files uploaded successfully`,
      });
  
      await fetchFiles(userId, batchName);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      isExample ? setUploadingExample(false) : setUploadingMain(false);
    }
  };

  const fetchFiles = async (userId: string, batchName: string) => {
    try {
      // Fetch main files
      const mainResponse = await fetch(`/api/get-essays?userId=${userId}&batchName=${batchName}&type=tograde`);
      if (!mainResponse.ok) throw new Error('Failed to fetch main files');
      const mainData = await mainResponse.json();
      const filteredMainData = mainData.filter((file: FileInfo) => file.name !== '.emptyFolderPlaceholder');
      setNewFiles(filteredMainData);
      setSelectedFiles(filteredMainData);

      // Fetch example files
      const exampleResponse = await fetch(`/api/get-essays?userId=${userId}&batchName=${batchName}&type=examples`);
      if (!exampleResponse.ok) throw new Error('Failed to fetch example files');
      const exampleData = await exampleResponse.json();
      const filteredExampleData = exampleData.filter((file: FileInfo) => file.name !== '.emptyFolderPlaceholder');
      setExampleFiles(filteredExampleData);
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
      setRubricJSON(rubricTitles);
      console.log('data frrfrfr', rubricTitles)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rubrics",
        variant: "destructive",
      });
    }
  };

  const DisplayFileList = ({ files, title }: { files: FileInfo[], title: string }) => {
    if (files.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-2">{title}:</h3>
        <div className="bg-gray-50 p-3 rounded-lg">
          {files.map((file, index) => (
            <div key={index} className="text-sm text-gray-600">
              {file.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isExample: boolean = false) => {
    if (!event.target.files || event.target.files.length === 0 || !userId || !batchName) {
      toast({
        title: "Error",
        description: "Please enter a batch name first",
        variant: "destructive",
      });
      return;
    }
  
    isExample ? setUploadingExample(true) : setUploadingMain(true);
    const files = Array.from(event.target.files);
  
    try {
      for (const file of files) {
        const path = isExample
          ? `${userId}/${batchName}/examples/${file.name}`
          : `${userId}/${batchName}/tograde/${file.name}`;
  
        const { error } = await supabase.storage
          .from('essays')
          .upload(path, file);
  
        if (error) throw error;
      }
  
      toast({
        title: "Success",
        description: `Files uploaded successfully`,
      });
  
      await fetchFiles(userId, batchName);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      isExample ? setUploadingExample(false) : setUploadingMain(false);
    }
  };

  const handleRubricSelect = (rubricId: string) => {
    console.log('rubricId', rubricId)
    const selected = rubrics.find(rubric => rubric.id === rubricId) || null;
    setSelectedRubric(selected);
  };

  const handleStartBatch = async () => {
    setIsStartable(false)
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

    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('trying')
      const response = await fetch('/api/start-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedFiles,
          exampleFiles,
          exampleGrades,
          rubricId: selectedRubric.id,
          batchName,
          userId,
          classId: selectedClass,
          studentIds: selectedStudents,
          fileAssignments,
        }),
      });
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
    } finally {
    }
  };

  const isReadyToStart = () => {
    const requirements = {
      batchName: !!batchName?.trim(),
      rubric: !!selectedRubric,
      files: selectedFiles.length > 0,
      exampleGrades: exampleFiles.length === 0 || // No example files uploaded
                    (exampleFiles.length > 0 && 
                     exampleFiles.every(file => exampleGrades[file.name])), // All example files graded
      classSelected: !!selectedClass,
      // Remove the studentsSelected requirement since we're using per-file assignments
      allFilesAssigned: selectedFiles.every(file => fileAssignments[file.name]),
    };
    
    return requirements;
  };

  const getMissingRequirements = () => {
    const requirements = isReadyToStart();
    const missing = [];
    
    if (!requirements.batchName) missing.push("Batch name");
    if (!requirements.rubric) missing.push("Rubric selection");
    if (!requirements.files) missing.push("At least one file to grade");
    if (!requirements.exampleGrades) {
      const ungradedCount = exampleFiles.filter(file => !exampleGrades[file.name]).length;
      missing.push(`${ungradedCount} example ${ungradedCount === 1 ? 'essay needs' : 'essays need'} grading`);
    }
    if (!requirements.classSelected) missing.push("Class selection");
    if (!requirements.allFilesAssigned) missing.push("All essays must be assigned to students");
    
    return missing;
  };

  const handleExampleGrade = (fileName: string) => {
    setCurrentFileToGrade(fileName);
    setIsGrading(true);
  };

  const handleGradeSubmit = (grades: any) => {
    setExampleGrades(prev => ({
      ...prev,
      [currentFileToGrade]: grades
    }));
  };

  const handleStudentAssignment = (fileName: string, studentId: string) => {
    setFileAssignments(prev => ({
      ...prev,
      [fileName]: studentId
    }));
  };

  return (
    <Frame>
      <Card className="w-full max-w-4xl p-5 space-y-5">
        {/* Keep the class selector for context, but remove the student selector */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-20 bg-[#bba8ff] rounded-lg shadow-md flex items-center justify-start px-6 gap-4">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classData) => (
                  <SelectItem key={classData.id} value={classData.id}>
                    {classData.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">

          <Select onValueChange={handleRubricSelect}>
            <SelectTrigger
              className="h-20 bg-[#bba8ff] rounded-lg shadow-md flex items-center justify-start px-6 gap-4"
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
          <RubricMaker userId={userId}/>
        <div className="relative">
          <Input
            className="w-72 h-[67px] bg-[#85e0a3] rounded-[17px] pl-12 text-[#00000080] font-bold"
            placeholder="Batch Name"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <PencilIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6  text-[#00000080]" />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Essays to Grade Section - Now First */}
            <div>
              <h3 className="font-bold text-lg mb-2">To Grade:</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center text-sm text-gray-600 p-2 hover:bg-gray-100 rounded-md"
                  >
                    <span className="truncate mr-4 flex-1">{file.name}</span>
                    <Select
                      value={fileAssignments[file.name] || ''}
                      onValueChange={(value) => handleStudentAssignment(file.name, value)}
                      disabled={!selectedClass}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes
                          .find(c => c.id === selectedClass)
                          ?.students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Essays Section - Now Second */}
            <div>
              <h3 className="font-bold text-lg mb-2">Example Essays:</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {exampleFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center text-sm text-gray-600 p-2 hover:bg-gray-100 rounded-md"
                  >
                    <span className="truncate mr-4 flex-1">{file.name}</span>
                    <Button
                      onClick={() => handleExampleGrade(file.name)}
                      className={`min-w-[80px] ${
                        exampleGrades[file.name] 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-[#85e0a3] hover:bg-[#75d093]"
                      }`}
                    >
                      {exampleGrades[file.name] ? "Graded" : "Grade"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* File Upload Dropzones */}
          <div className="flex flex-row gap-4 text-center h-[227px]">
            <div className="flex-1">
              <label htmlFor="main-file-upload" className="cursor-pointer h-full block">
                <div 
                  className={`w-full h-full ${isDraggingMain ? 'bg-blue-100' : 'bg-blue-50'} border border-dashed border-black rounded flex flex-col items-center justify-center gap-2 p-4 relative`}
                  onDragEnter={(e) => handleDrag(e, setIsDraggingMain)}
                  onDragLeave={(e) => handleDrag(e, setIsDraggingMain)}
                  onDragOver={(e) => handleDrag(e, setIsDraggingMain)}
                  onDrop={(e) => handleDrop(e, false)}
                >
                  {uploadingMain ? (
                    <span className="text-3xl font-bold text-[#66666666] tracking-tight">
                      Uploading...
                    </span>
                  ) : selectedFiles.length > 0 ? (
                    <>
                      <span className="text-2xl font-bold text-[#66666666] tracking-tight mb-2">
                        Essays to Grade
                      </span>
                      <div className="text-sm text-gray-600 w-full overflow-y-auto max-h-[120px] scrollbar-thin scrollbar-thumb-gray-300">
                        <div className="space-y-1 px-2">
                          
                        </div>
                      </div>
                      <div className="absolute bottom-3 text-sm text-gray-500">
                        {selectedFiles.length} file(s) selected
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-[#66666666] tracking-tight">
                      Drop files to grade here
                    </span>
                  )}
                </div>
              </label>
              <input
                id="main-file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e, false)}
                disabled={uploadingMain || uploadingExample || !batchName}
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="example-file-upload" className="cursor-pointer h-full block">
                <div 
                  className={`w-full h-full ${isDraggingExample ? 'bg-blue-100' : 'bg-blue-50'} border border-dashed border-black rounded flex flex-col items-center justify-center gap-2 p-4 relative`}
                  onDragEnter={(e) => handleDrag(e, setIsDraggingExample)}
                  onDragLeave={(e) => handleDrag(e, setIsDraggingExample)}
                  onDragOver={(e) => handleDrag(e, setIsDraggingExample)}
                  onDrop={(e) => handleDrop(e, true)}
                >
                  {uploadingExample ? (
                    <span className="text-3xl font-bold text-[#66666666] tracking-tight">
                      Uploading...
                    </span>
                  ) : exampleFiles.length > 0 ? (
                    <>
                      <span className="text-2xl font-bold text-[#66666666] tracking-tight mb-2">
                        Example Essays
                      </span>
                      <div className="text-sm text-gray-600 w-full overflow-y-auto max-h-[120px] scrollbar-thin scrollbar-thumb-gray-300">
                        <div className="space-y-1 px-2">
                          {exampleFiles.map((file, index) => (
                            <div key={index} className="truncate">{file.name}</div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute bottom-3 text-sm text-gray-500">
                        {exampleFiles.length} file(s) selected
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-[#66666666] tracking-tight">
                      Drop example files here
                    </span>
                  )}
                </div>
              </label>
              <input
                id="example-file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e, true)}
                disabled={uploadingMain || uploadingExample || !batchName}
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-end">
                <Card 
                  onClick={handleStartBatch}
                  className={`w-[282px] h-[82px] ${
                    Object.values(isReadyToStart()).every(Boolean)
                      ? "bg-[#85e0a3] hover:bg-[#75d093] cursor-pointer"
                      : "bg-[#cccccc] cursor-not-allowed"
                  } rounded-[9.59px] border border-black shadow-md flex items-center justify-center gap-4 transition-colors`}
                >
                  <span className="text-[#333333] text-4xl font-bold tracking-tight">
                    Start
                  </span>
                  <WandIcon className="h-12 w-12 text-[#333333]" />
                </Card>
              </div>
            </TooltipTrigger>
            {getMissingRequirements().length > 0 && (
              <TooltipContent>
                <p>Missing requirements:</p>
                <ul className="list-disc pl-4">
                  {getMissingRequirements().map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                  {!isReadyToStart().allFilesAssigned && (
                    <li>All essays must be assigned to students</li>
                  )}
                </ul>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {selectedRubric && (
          <ManualGrader
            isOpen={isGrading}
            onClose={() => setIsGrading(false)}
            onSubmit={handleGradeSubmit}
            rubric={selectedRubric.rubricJSON}
            currentFile={currentFileToGrade}
          />
        )}
      </Card>
    </Frame>
  );
};

export default Grader;
