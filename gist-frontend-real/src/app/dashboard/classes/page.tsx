"use client";
import React, { useState, useEffect } from 'react';
import Frame from "@/components/new-ui/main-frame";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, UsersIcon, GraduationCapIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createBrowserClient } from '@supabase/ssr';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TrashIcon } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface ClassData {
  id: string;
  name: string;
  description: string;
  studentCount: number;
  students: Student[];
}

interface StudentInput {
  name: string;
  email: string;
}

const ClassManager = () => {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isNewClassDialogOpen, setIsNewClassDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [students, setStudents] = useState<StudentInput[]>([
    { name: '', email: '' }
  ]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [newStudents, setNewStudents] = useState<StudentInput[]>([{ name: '', email: '' }]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/get-classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ teacherId: userId }),
        });

        if (!response.ok) throw new Error('Failed to fetch classes');
        
        const data = await response.json();
        setClasses(data.classes);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [userId]);

  const handleAddStudent = () => {
    setStudents([...students, { name: '', email: '' }]);
  };

  const handleStudentChange = (index: number, field: keyof StudentInput, value: string) => {
    const updatedStudents = students.map((student, i) => {
      if (i === index) {
        return { ...student, [field]: value };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handleRemoveStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleCreateClass = async () => {
    if (!newClassName || students.some(s => !s.name || !s.email)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/create-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: userId,
          name: newClassName,
          description: newClassDescription,
          students: students.filter(s => s.name && s.email), // Only send filled student data
        }),
      });

      if (!response.ok) throw new Error('Failed to create class');

      toast({
        title: "Success",
        description: "Class created successfully",
      });
      setIsNewClassDialogOpen(false);
      // Reset form
      setNewClassName('');
      setNewClassDescription('');
      setStudents([{ name: '', email: '' }]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudentFromClass = async (studentId: string) => {
    try {
      const response = await fetch('/api/edit-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass?.id,
          userId,
          studentsToRemove: [studentId],
        }),
      });

      if (!response.ok) throw new Error('Failed to remove student');

      toast({
        title: "Success",
        description: "Student removed successfully",
      });
      
      // Update the UI
      if (selectedClass) {
        setSelectedClass({
          ...selectedClass,
          students: selectedClass.students.filter(s => s.id !== studentId),
          studentCount: selectedClass.studentCount - 1
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const response = await fetch('/api/edit-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          userId,
          action: 'delete_class',
        }),
      });

      if (!response.ok) throw new Error('Failed to delete class');

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      // Update the UI by removing the deleted class
      setClasses(classes.filter(c => c.id !== classId));
      setSelectedClass(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const handleAddNewStudent = () => {
    setNewStudents([...newStudents, { name: '', email: '' }]);
  };

  const handleNewStudentChange = (index: number, field: keyof StudentInput, value: string) => {
    const updated = newStudents.map((student, i) => {
      if (i === index) {
        return { ...student, [field]: value };
      }
      return student;
    });
    setNewStudents(updated);
  };

  const handleAddStudentsToClass = async () => {
    if (!selectedClass || newStudents.some(s => !s.name || !s.email)) {
      toast({
        title: "Error",
        description: "Please fill in all student fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/edit-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass.id,
          userId,
          action: 'add_students',
          studentsToAdd: newStudents.filter(s => s.name && s.email),
        }),
      });

      if (!response.ok) throw new Error('Failed to add students');

      const { students } = await response.json();
      
      // Update UI
      setSelectedClass({
        ...selectedClass,
        students: [...selectedClass.students, ...students],
        studentCount: selectedClass.studentCount + students.length
      });

      setIsAddStudentDialogOpen(false);
      setNewStudents([{ name: '', email: '' }]);
      
      toast({
        title: "Success",
        description: "Students added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add students",
        variant: "destructive",
      });
    }
  };

  return (
    <Frame>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">My Classes</h1>
          <Dialog open={isNewClassDialogOpen} onOpenChange={setIsNewClassDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Set up a new class for your students.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Class Name
                  </label>
                  <Input 
                    id="name" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Enter class name..." 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input 
                    id="description" 
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                    placeholder="Enter class description..." 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium">Students</label>
                  {students.map((student, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Name"
                        value={student.name}
                        onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        value={student.email}
                        onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveStudent(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleAddStudent}
                  >
                    Add Student
                  </Button>
                </div>
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleCreateClass}
              >
                Create Class
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading state
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading classes...
            </div>
          ) : classes.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12 text-gray-500">
              No classes found. Create your first class to get started.
            </div>
          ) : (
            // Map through actual classes instead of mock data
            classes.map((classData) => (
              <Dialog key={classData.id}>
                <DialogTrigger asChild>
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedClass(classData)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-purple-700">{classData.name}</h2>
                      <UsersIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-gray-600 mb-4">{classData.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <GraduationCapIcon className="h-4 w-4 mr-2" />
                      {classData.studentCount} students
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <DialogTitle>Class Details</DialogTitle>
                        <DialogDescription>
                          Manage your class and students.
                        </DialogDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the class and remove all associated student data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => selectedClass && handleDeleteClass(selectedClass.id)}
                            >
                              Delete Class
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Students</h3>
                      <div className="space-y-2">
                        {selectedClass?.students.map((student) => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveStudentFromClass(student.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedClass(null)}
                      >
                        Close
                      </Button>
                      <Button 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => setIsAddStudentDialogOpen(true)}
                      >
                        Add Students
                      </Button>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Class
                        </Button>
                      </AlertDialogTrigger>
                      {/* ... existing alert dialog content ... */}
                    </AlertDialog>
                  </div>
                </DialogContent>

                {/* Add new dialog for adding students */}
                <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Students</DialogTitle>
                      <DialogDescription>
                        Add new students to {selectedClass?.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {newStudents.map((student, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Name"
                            value={student.name}
                            onChange={(e) => handleNewStudentChange(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Email"
                            value={student.email}
                            onChange={(e) => handleNewStudentChange(index, 'email', e.target.value)}
                          />
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={handleAddNewStudent}
                      >
                        Add Another
                      </Button>
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                      onClick={handleAddStudentsToClass}
                    >
                      Add Students
                    </Button>
                  </DialogContent>
                </Dialog>
              </Dialog>
            ))
          )}
        </div>
      </div>
    </Frame>
  );
};

export default ClassManager;
