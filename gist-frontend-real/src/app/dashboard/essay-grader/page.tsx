"use client";

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import ResponsiveMenuBar from '@/components/nav-bar'
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Upload, Trash2, Download, Eye, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NavBar from '@/components/nav-bar';
import Footer from '@/components/footer';

type FileInfo = {
    name: string;
    url: string;
    created_at: string;
    size?: number;
};

export default function FileUploadDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                fetchFiles(user.id);
            }
        };
        getUser();
    }, []);

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0] || !user) return;

        const file = event.target.files[0];
        setUploading(true);

        try {
            const { data, error } = await supabase.storage
                .from('essays')
                .upload(`${user.id}/${file.name}`, file);

            if (error) throw error;

            toast({
                title: "Success",
                description: "File uploaded successfully",
            });

            await fetchFiles(user.id);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to upload file",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!user) return;

        try {
            const { error } = await supabase.storage
                .from('essays')
                .remove([`${user.id}/${fileName}`]);

            if (error) throw error;

            toast({
                title: "Success",
                description: "File deleted successfully",
            });

            await fetchFiles(user.id);
            setSelectedFile(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete file",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    };

    return (
        <>
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ResponsiveMenuBar />
      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-12">
            <Card 
                className="bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors" 
                onClick={() => files.length > 0 && setSelectedFile(files[0])}
            >
                <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                    <Upload className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-semibold text-center">
                        {files.length} File{files.length !== 1 ? 's' : ''} Uploaded
                    </h3>
                </CardContent>
            </Card>

        </main>
        <Footer />
    </div>

            {/* File Details Dialog */}
            <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
                <DialogContent className="bg-black text-white">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center">
                            <span>File Details</span>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => document.getElementById('fileInput')?.click()}
                            disabled={uploading}
                            className="mr-2"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Upload New File'}
                        </Button>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt"
                        />
                    </div>
                    <DialogDescription className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-white">Name</TableHead>
                                    <TableHead className="text-white">Date</TableHead>
                                    <TableHead className="text-white">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.name}>
                                        <TableCell className="border-t border-gray-700">
                                            {file.name}
                                        </TableCell>
                                        <TableCell className="border-t border-gray-700">
                                            {formatDate(file.created_at)}
                                        </TableCell>
                                        <TableCell className="border-t border-gray-700">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    onClick={() => window.open(file.url, '_blank')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(file.url, '_blank');
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(file.name);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </>
    );
}