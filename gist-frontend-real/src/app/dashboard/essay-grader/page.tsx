"use client";

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Download, Eye, X, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import dynamic from 'next/dynamic';
import { pdfjs } from 'react-pdf';
import { usePDFJS } from '@/hooks/use-pdfjs';
import { getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import RubricMaker from '@/components/rubric-creator';
import FileUploadDialog from '@/components/file-uploader';


type FileInfo = {
    name: string;
    url: string;
    created_at: string;
    size?: number;
};

type PreviewInfo = {
    file: FileInfo;
    content?: string;
    type: 'pdf' | 'text' | 'doc' | 'unknown';
};

export default function FileUploadDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
    const [previewFile, setPreviewFile] = useState<PreviewInfo | null>(null);
    
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

    const getFileType = (fileName: string): 'pdf' | 'text' | 'doc' | 'unknown' => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'pdf';
            case 'txt':
                return 'text';
            case 'doc':
            case 'docx':
                return 'doc';
            default:
                return 'unknown';
        }
    };

    const handlePreview = async (file: FileInfo) => {
        const fileType = getFileType(file.name);
        setPreviewFile({ file, type: fileType });

        if (fileType === 'text') {
            try {
                const response = await fetch(file.url);
                const content = await response.text();
                setPreviewFile(prev => prev ? { ...prev, content } : null);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load file preview",
                    variant: "destructive",
                });
            }
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
            setPreviewFile(null);
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

    const renderPDFPreview = async (pdfjs: { getDocument: typeof getDocument }) => {
        if (!previewFile || previewFile.type !== 'pdf') return;

        const loadingTask = pdfjs.getDocument(previewFile.file.url);
        const pdf: PDFDocumentProxy = await loadingTask.promise;
        const page: PDFPageProxy = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context!,
            viewport: viewport,
        };
        await page.render(renderContext).promise;
    };

    usePDFJS(renderPDFPreview, [previewFile?.file.url]);

    usePDFJS(renderPDFPreview, [previewFile?.file.url]);

    const renderPreview = () => {
        if (!previewFile) return null;

        switch (previewFile.type) {
            case 'pdf':
                return (
                    <div className="w-full h-[600px] overflow-auto bg-gray-900">
                        <canvas id="pdf-canvas" className="w-full h-full"></canvas>
                    </div>
                );
            case 'text':
                return (
                    <div className="w-full max-h-[600px] overflow-auto p-4 bg-gray-900 rounded">
                        <pre className="whitespace-pre-wrap font-mono text-sm">
                            {previewFile.content}
                        </pre>
                    </div>
                );
            case 'doc':
                return (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded">
                        <FileText className="h-16 w-16 mb-4" />
                        <p className="text-center mb-4">
                            Preview not available for Word documents. Please download the file to view its contents.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => window.open(previewFile.file.url, '_blank')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Document
                        </Button>
                    </div>
                );
            default:
                return (
                    <div className="text-center p-4">
                        Preview not available for this file type.
                    </div>
                );
        }
    };

    return (
        <>
            {/* Main Dashboard Grid Item */}
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
            <RubricMaker userId={user?.id ?? ''} />
            <FileUploadDialog userId={user?.id ?? ''} supabase={supabase} />
            {/* File Details Dialog */}
            <Dialog open={!!selectedFile} onOpenChange={() => {
                setSelectedFile(null);
                setPreviewFile(null);
            }}>
                <DialogContent className="bg-black text-white max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center">
                            <span>File Details</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewFile(null);
                                }}
                            >
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
                        {previewFile ? (
                            <div className="space-y-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setPreviewFile(null)}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Close Preview
                                </Button>
                                {renderPreview()}
                            </div>
                        ) : (
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePreview(file);
                                                        }}
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
                        )}
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </>
    );
}