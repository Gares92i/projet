import React, { useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";
import { createApiClient } from "@/features/common/services/apiClient";

interface ProjectImageCardProps {
  imageUrl?: string;
  projectName: string;
  onImageUploaded?: (imageUrl: string) => void;
  projectId: string;
}

export function ProjectImageCard({ imageUrl, projectName, onImageUploaded, projectId }: ProjectImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const api = createApiClient();
      const response = await api.post<{ imageUrl: string }>(`/projects/${projectId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("Image uploadée !");
      if (onImageUploaded) onImageUploaded(response.imageUrl);
    } catch (err) {
      console.error("Erreur lors de l'upload:", err);
      toast.error("Échec de l'upload");
    }
  };

  return (
    <div className="space-y-2">
      {imageUrl && (
        <img src={imageUrl} alt={projectName} className="w-full rounded-md mb-2" />
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
} 