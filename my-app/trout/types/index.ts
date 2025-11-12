export type Client =
  | "Costco"
  | "Home Depot"
  | "Lowes"
  | "Publix"
  | "Dollar General"
  | "ExtraSpace"
  | "Wawa"
  | "Walgreens"
  | "Other";

export type Answer = "yes" | "no" | "sub" | "super" | "apex" | null;
export type AnswerType = "yesno" | "subsuper";

export interface ChecklistItem {
  id: string;
  question: string;
  answer: Answer;
  section: "ce" | "sow" | "pa";
  answerType?: AnswerType; // "yesno" (default) or "subsuper"
  conditional?: {
    client: Client[];
    show: boolean;
  };
}

export interface ChecklistData {
  id?: string; // Supabase UUID
  client: Client | "";
  locationNumber: string;
  items: ChecklistItem[];
  notes: LogEntry[];
  startTime: number | null;
  completedAt: number | null;
  lastSaved: number | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  date: string;
  message: string;
  itemId?: string;
  itemQuestion?: string;
}

export interface Metrics {
  totalChecks: number;
  completedChecks: number;
  failedChecks: number;
  completionTime: number | null;
  commonFailures: { question: string; count: number }[];
}

