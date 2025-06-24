import { useState } from 'react';

export const useStorageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    setIsUploading(true);
    try {
      // TODO: Implémenter l'upload de fichier
      console.log('Upload fichier:', file.name, 'vers:', path);
      return 'url-temporaire';
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadFile,
  };
};
