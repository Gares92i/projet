import React, { useRef, useState } from 'react';
import { uploadProjectImage } from '../services/projectService';

interface ProjectImageUploadProps {
  projectId: string;
  currentImageUrl?: string;
  onUploadSuccess?: (imageUrl: string) => void;
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({
  projectId,
  currentImageUrl,
  onUploadSuccess,
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const imageUrl = await uploadProjectImage(projectId, file);
      setPreview(imageUrl);
      onUploadSuccess?.(imageUrl);
    } catch (err) {
      alert('Erreur lors de l’upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}>
        {loading ? 'Upload en cours...' : 'Choisir une image'}
      </button>
      {preview && (
        <div style={{ marginTop: 10 }}>
          <img src={preview} alt="Aperçu" style={{ maxWidth: 200, borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
};

export default ProjectImageUpload; 