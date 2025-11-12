import { ChecklistItem, Client } from "@/types";

export const initialChecklistItems: ChecklistItem[] = [
  // CE - Cost Sheet
  {
    id: "ce-1",
    question: "Does the price make sense?",
    answer: null,
    section: "ce",
  },
  {
    id: "ce-2",
    question: "Do we need to include ER or inspection costs? (Walgreens, Target, Dollar General)",
    answer: null,
    section: "ce",
    conditional: {
      client: ["Walgreens", "Dollar General"],
      show: true,
    },
  },
  {
    id: "ce-3",
    question: "Is the State filled out and taxes populated in states where it needs to?",
    answer: null,
    section: "ce",
  },
  {
    id: "ce-4",
    question: "Sub or Apex Super?",
    answer: null,
    section: "ce",
    answerType: "subsuper",
  },
  {
    id: "ce-5",
    question: "Mob/Demob for equipment?",
    answer: null,
    section: "ce",
  },
  {
    id: "ce-6",
    question: "Is this a concrete job? If so, is a breaker added?",
    answer: null,
    section: "ce",
  },
  // SOW Document
  {
    id: "sow-1",
    question: "Is the date updated?",
    answer: null,
    section: "sow",
  },
  {
    id: "sow-2",
    question: "Does everything make sense?",
    answer: null,
    section: "sow",
  },
  {
    id: "sow-3",
    question: "Are all brand specific fields filled out?",
    answer: null,
    section: "sow",
  },
  {
    id: "sow-4",
    question: "Formatting (Header, Spacing)",
    answer: null,
    section: "sow",
  },
  {
    id: "sow-5",
    question: "Update price on SOW document?",
    answer: null,
    section: "sow",
  },
  // PA Folder
  {
    id: "pa-1",
    question: "Is the PA folder created with a copy in the main project drive?",
    answer: null,
    section: "pa",
  },
];

export const clients: Client[] = [
  "Costco",
  "Home Depot",
  "Lowes",
  "Publix",
  "Dollar General",
  "ExtraSpace",
  "Wawa",
  "Walgreens",
  "Other",
];

