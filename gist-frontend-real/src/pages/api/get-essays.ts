// pages/api/get-essays.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, batchName } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (!batchName || typeof batchName !== 'string') {
        return res.status(400).json({ error: 'Batch name is required' });
    }

    try {
        // List all files in the user's folder
        console.log(batchName)
        const { data: files, error } = await supabase.storage
            .from(`essays`)
            .list(`${userId}/${batchName}`);
    
        if (error) throw error;
        console.log('files:', files.length);
        // Get public URLs for each file
        const filesWithUrls = await Promise.all(
            files.map(async (file) => {
                const { data: { publicUrl } } = supabase.storage
                    .from('essays')
                    .getPublicUrl(`${userId}/${batchName}/${file.name}`);

                return {
                    name: file.name,
                    url: publicUrl,
                    created_at: file.created_at,
                };
            })
        );

        return res.status(200).json(filesWithUrls);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}