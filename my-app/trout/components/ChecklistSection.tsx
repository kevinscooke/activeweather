"use client";

import { ChecklistItem, Answer, Client } from "@/types";
import { shouldShowQuestion } from "@/lib/utils";

interface ChecklistSectionProps {
  title: string;
  items: ChecklistItem[];
  selectedClient: Client | "";
  onAnswerChange: (itemId: string, answer: Answer) => void;
  readOnly?: boolean;
}

export default function ChecklistSection({
  title,
  items,
  selectedClient,
  onAnswerChange,
  readOnly = false,
}: ChecklistSectionProps) {
  const visibleItems = items.filter((item) =>
    shouldShowQuestion(item, selectedClient)
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {visibleItems.map((item) => {
          const isSubSuper = item.answerType === "subsuper";
          
          return (
            <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="text-sm font-medium text-gray-700 mb-2">{item.question}</p>
              <div className="flex gap-2">
                {isSubSuper ? (
                  <>
                    <button
                      onClick={() => !readOnly && onAnswerChange(item.id, "apex")}
                      disabled={readOnly}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.answer === "apex"
                          ? "bg-orange-600 text-white ring-2 ring-orange-300"
                          : readOnly
                          ? item.answer === null
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Apex
                    </button>
                    <button
                      onClick={() => !readOnly && onAnswerChange(item.id, "super")}
                      disabled={readOnly}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.answer === "super"
                          ? "bg-purple-600 text-white ring-2 ring-purple-300"
                          : readOnly
                          ? item.answer === null
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Super
                    </button>
                    <button
                      onClick={() => !readOnly && onAnswerChange(item.id, "sub")}
                      disabled={readOnly}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.answer === "sub"
                          ? "bg-blue-600 text-white ring-2 ring-blue-300"
                          : readOnly
                          ? item.answer === null
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Sub
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => !readOnly && onAnswerChange(item.id, "yes")}
                      disabled={readOnly}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.answer === "yes"
                          ? "bg-green-600 text-white ring-2 ring-green-300"
                          : readOnly
                          ? item.answer === null
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => !readOnly && onAnswerChange(item.id, "no")}
                      disabled={readOnly}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.answer === "no"
                          ? "bg-red-600 text-white ring-2 ring-red-300"
                          : readOnly
                          ? item.answer === null
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      No
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

