import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function initializeDirectories() {
  const publicDir = join(process.cwd(), 'public');
  const uploadsDir = join(publicDir, 'uploads');

  try {
    // Ensure public directory exists
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }

    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
} 