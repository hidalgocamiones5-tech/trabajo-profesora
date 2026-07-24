export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'alta' | 'media' | 'baja';
  dueDate: string;
  completed: boolean;
}

export interface Topic {
  id: string;
  number: number;
  title: string;
  summary: string;
}

export interface TranscriptSnippet {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  strategicDecisions: string[];
  tasks: Task[];
  topics: Topic[];
  transcript: TranscriptSnippet[];
}
