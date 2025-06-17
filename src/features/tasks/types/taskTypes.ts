export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assignedTo?: string[];
  projectId: string;
  priority?: 'low' | 'medium' | 'high';
}