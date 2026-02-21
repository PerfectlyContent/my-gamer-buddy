import { getSupabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const supabase = getSupabase();
  const ext = path.extname(file.originalname);
  const fileName = `${uuidv4()}${ext}`;
  const filePath = `chat-images/${fileName}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
  return data.publicUrl;
}
