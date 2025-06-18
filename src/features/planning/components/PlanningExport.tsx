import React from "react";
import { Button } from "@/ui/button";
import { FileText } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import PlanningPDF from './PlanningPDF';
import { Task, Group } from '../types/planning';

interface PlanningExportProps {
  projectId: string;
  visitDate: string;
  children?: React.ReactNode;
  id?: string;
  items?: Task[];
  groups?: Group[];
}

const PlanningExport: React.FC<PlanningExportProps> = ({
  projectId,
  visitDate,
  id,
  items = [],
  groups = [],
}) => {
  return (
    <div id={id}>
      <PDFDownloadLink
        document={
          <PlanningPDF
            projectId={projectId}
            visitDate={visitDate}
            items={items}
            groups={groups}
            options={{
              paperFormat: "A4",
              orientation: "landscape",
              dateRange: "all",
              showTaskNames: true,
              singlePage: true,
              fitToPage: true,
              quality: 2,
              customStartDate: new Date(),
              customEndDate: new Date()
            }}
          />
        }
        fileName={`Planning-Projet-${projectId}.pdf`}
      >
        {({ loading, error }) => (
          <Button
            id="planning-export-button"
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <FileText size={16} className="mr-1" />
            {loading ? "Préparation..." : "Exporter PDF"}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default PlanningExport;
