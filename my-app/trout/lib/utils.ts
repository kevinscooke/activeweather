import { ChecklistData, LogEntry, Client, Answer } from "@/types";

export function getESTTimestamp(): { timestamp: string; date: string } {
  const now = new Date();
  const estDate = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  const timestamp = estDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  
  const date = estDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return { timestamp, date };
}

export function createLogEntry(
  message: string,
  itemId?: string,
  itemQuestion?: string
): LogEntry {
  const { timestamp, date } = getESTTimestamp();
  return {
    id: Date.now().toString(),
    timestamp,
    date,
    message,
    itemId,
    itemQuestion,
  };
}

export function saveToLocalStorage(data: ChecklistData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("estimatingApexChecklist", JSON.stringify(data));
  }
}

export function loadFromLocalStorage(): ChecklistData | null {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("estimatingApexChecklist");
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return null;
}

export function clearLocalStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("estimatingApexChecklist");
  }
}

export function shouldShowQuestion(
  item: { conditional?: { client: Client[]; show: boolean } },
  selectedClient: Client | ""
): boolean {
  if (!item.conditional) return true;
  if (!selectedClient) return false;
  return item.conditional.client.includes(selectedClient);
}

export function calculateProgress(items: { answer: Answer }[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = items.length;
  const completed = items.filter((item) => item.answer !== null).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

export function calculateMetrics(
  data: ChecklistData,
  items: { answer: Answer; question: string }[]
): {
  totalChecks: number;
  completedChecks: number;
  failedChecks: number;
  completionTime: number | null;
  commonFailures: { question: string; count: number }[];
} {
  const totalChecks = items.length;
  const completedChecks = items.filter((item) => item.answer !== null).length;
  const failedChecks = items.filter((item) => item.answer === "no").length;
  
  let completionTime: number | null = null;
  if (data.startTime && data.completedAt) {
    completionTime = Math.round((data.completedAt - data.startTime) / 1000); // seconds
  }
  
  // Track common failures (for future enhancement)
  const commonFailures: { question: string; count: number }[] = [];
  
  return {
    totalChecks,
    completedChecks,
    failedChecks,
    completionTime,
    commonFailures,
  };
}

