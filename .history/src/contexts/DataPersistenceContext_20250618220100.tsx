import React, { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
// Ajouter ces imports
import { ExtendedLotTravaux } from "@/types/project";
import { PlanningItem } from "@/types/planningTypes";

import { Annotation, ProjectMilestone, ProjectDocument } from "@/app/styles/index";

import { ProjectTask } from "@/types/taskTypes";

// Types pour les différentes tables
type TableTypes =
  | "descriptif"
  | "planning"
  | "documents"
  | "annotations"
  | "milestones"
  | "tasks";

// Définir des types pour les données de chaque table
interface TableDataMap {
  descriptif: ExtendedLotTravaux[];
  planning: PlanningItem[];
  documents: ProjectDocument[];
  annotations: Annotation[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
}

// Interface générique pour le contexte
interface DataPersistenceContextType {
  saveTableData: <T extends TableTypes>(
    projectId: string,
    tableType: T,
    data: TableDataMap[T]
  ) => void;
  getTableData: <T extends TableTypes>(
    projectId: string,
    tableType: T
  ) => TableDataMap[T] | null;
}

const DataPersistenceContext = createContext<
  DataPersistenceContextType | undefined
>(undefined);

export const DataPersistenceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Utiliser un seul point de stockage pour toutes les données du projet
  const [projectsData, setProjectsData] = useLocalStorage<
    Record<string, Record<string, unknown>>
  >("app-projects-data", {});

  const saveTableData = useCallback(
    <T extends TableTypes>(
      projectId: string,
      tableType: T,
      data: TableDataMap[T]
    ) => {
      setProjectsData((prevData: Record<string, Record<string, unknown>>) => {
        const projectData = prevData[projectId] || {};

        return {
          ...prevData,
          [projectId]: {
            ...projectData,
            [tableType]: data,
            lastUpdated: new Date().toISOString(),
          },
        };
      });
    },
    [setProjectsData]
  );

  const getTableData = useCallback(
    <T extends TableTypes>(
      projectId: string,
      tableType: T
    ): TableDataMap[T] | null => {
      return (projectsData[projectId]?.[tableType] as TableDataMap[T]) || null;
    },
    [projectsData]
  );

  return (
    <DataPersistenceContext.Provider value={{ saveTableData, getTableData }}>
      {children}
    </DataPersistenceContext.Provider>
  );
};

export const usePersistence = () => {
  const context = useContext(DataPersistenceContext);
  if (context === undefined) {
    throw new Error(
      "usePersistence must be used within a DataPersistenceProvider"
    );
  }
  return context;
};
