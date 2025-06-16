export interface Task {
  id: string;
  group: string;
  title: string;
  start_time: number; // Timestamp
  end_time: number;   // Timestamp
  className?: string;
  lotColor?: string;
  canMove?: boolean;
  canResize?: boolean;
  isHeader?: boolean;
}

export interface Group {
  id: string;
  title: string;
  parentId?: string;
  lotColor?: string;
}

export interface ExportOptions {
  paperFormat: string;
  orientation: "portrait" | "landscape";
  dateRange: "all" | "custom" | "visible";
  showTaskNames: boolean;
  singlePage: boolean;
  fitToPage: boolean;
  quality: number;
  customStartDate: Date;
  customEndDate: Date;
}

export interface MonthData {
  name: string;
  days: number;
  startDate?: Date;
}