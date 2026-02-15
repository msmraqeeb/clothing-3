import { supabase } from '../lib/supabase';

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary environment variables are missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();

        // Persist to Media History in Supabase Settings
        // This ensures all uploaded images are available in the ImageLibrary
        try {
            const { data: existing } = await supabase.from('settings').select('value').eq('key', 'media_history').maybeSingle();
            const currentHistory = Array.isArray(existing?.value) ? existing.value : [];

            // Add new image to history
            const newEntry = {
                url: data.secure_url,
                name: file.name,
                created_at: new Date().toISOString()
            };

            // Prevent duplicate URLs if needed, though Cloudinary returns unique usually
            const updatedHistory = [newEntry, ...currentHistory].slice(0, 500); // Keep last 500 images to prevent bloat

            await supabase.from('settings').upsert({
                key: 'media_history',
                value: updatedHistory
            });
        } catch (err) {
            console.warn('Failed to save to media history:', err);
            // Non-blocking error
        }

        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};
