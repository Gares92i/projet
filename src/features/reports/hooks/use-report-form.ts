import { useState, useEffect } from 'react';

export interface AnnotationReserve {
  id: string;
  type: string;
  data: any;
}

export const useReportForm = (projectId: string) => {
  const [formData, setFormData] = useState({});
  const [annotations, setAnnotations] = useState<AnnotationReserve[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const saveReport = async (data: any) => {
    // TODO: Implémenter la sauvegarde du rapport
    console.log('Sauvegarder rapport:', data);
  };

  const addAnnotation = (annotation: AnnotationReserve) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  return {
    formData,
    annotations,
    isLoading,
    saveReport,
    addAnnotation,
  };
};
