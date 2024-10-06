"use client";

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type FileInfo = {
    name: string;
    url: string;
    created_at: string;
};

export default function FileUploadDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [uploading, setUploading] = useState(false);
    
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
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('essays')
                .upload(`${user.id}/${file.name}`, file);

            if (error) throw error;

            toast({
                title: "Success",
                description: "File uploaded successfully",
            });

            // Refresh file list
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
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete file",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="bg-black text-white">
            <CardHeader>
                <CardTitle>File Upload Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Button
                            variant="secondary"
                            disabled={uploading}
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt"
                        />
                    </div>

                    <div className="grid gap-4">
                        {files.map((file, index) => (
                            <Card key={index} className="bg-gray-800">
                                <CardContent className="flex items-center justify-between p-4">
                                    <span className="truncate">{file.name}</span>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(file.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}