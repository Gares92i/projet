import React, { useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

export function ProjectImageCard({ imageUrl, projectName, onImageUploaded, projectId }) {
  const fileInputRef = useRef(null);
  const { getToken } = useAuth();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de l'upload");
      const data = await res.json();
      toast.success("Image uploadée !");
      if (onImageUploaded) onImageUploaded(data.imageUrl);
    } catch (err) {
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