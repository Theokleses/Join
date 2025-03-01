import { Icontacts } from './icontacts';

export interface Itasks {
  id?: string;
  title: string;
  description: string;
  status?: string;
  category: 'Technical Task' | 'User Story';
  subtask?: string[];
  subtaskStatus?: boolean[];
  prio: 'Urgent' | 'Medium' | 'Low';
  assigned?: Icontacts[];
  dueDate: string;
}
