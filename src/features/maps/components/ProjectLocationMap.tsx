import React from 'react';

interface ProjectLocationMapProps {
  address: string;
  height?: string;
}

export const ProjectLocationMap: React.FC<ProjectLocationMapProps> = ({ 
  address, 
  height = "200px" 
}) => {
  return (
    <div 
      className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center text-gray-500">
        <div className="text-sm mb-2">Carte pour :</div>
        <div className="font-medium">{address}</div>
        <div className="text-xs mt-2">Intégration carte à implémenter</div>
      </div>
    </div>
  );
}; 