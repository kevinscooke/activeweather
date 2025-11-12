import { Answer, ChecklistItem } from "@/types";

/**
 * Conditional Rules System
 * 
 * This file centralizes all conditional logic for easy review and optimization.
 * Rules are applied when answers change to automatically update dependent questions.
 * 
 * Structure:
 * - Each rule defines: trigger item ID, trigger answer value, target item ID, target answer value
 * - Rules are evaluated in order when an answer changes
 * - Rules can be easily added, modified, or optimized here
 */

export interface ConditionalRule {
  /**
   * The item ID that triggers this rule when its answer matches triggerAnswer
   */
  triggerItemId: string;
  
  /**
   * The answer value that triggers this rule (null means any answer change)
   */
  triggerAnswer: Answer | null;
  
  /**
   * The item ID that will be automatically updated
   */
  targetItemId: string;
  
  /**
   * The answer value to set on the target item
   */
  targetAnswer: Answer;
  
  /**
   * Optional: Description of the rule for documentation
   */
  description?: string;
}

/**
 * All conditional rules in the system
 * 
 * Add new rules here following the pattern:
 * {
 *   triggerItemId: "item-id-that-triggers",
 *   triggerAnswer: "answer-value-that-triggers" | null,
 *   targetItemId: "item-id-to-update",
 *   targetAnswer: "answer-value-to-set",
 *   description: "Human-readable description"
 * }
 */
export const CONDITIONAL_RULES: ConditionalRule[] = [
  // Rule 1: When "Sub" is selected for "Sub or Apex Super?", set "Mob/Demob for equipment?" to "No"
  {
    triggerItemId: "ce-4", // "Sub or Apex Super?"
    triggerAnswer: "sub",
    targetItemId: "ce-5", // "Mob/Demob for equipment?"
    targetAnswer: "no",
    description: "Sub jobs don't require Mob/Demob equipment",
  },
  
  // Add more rules here as needed:
  // {
  //   triggerItemId: "ce-X",
  //   triggerAnswer: "yes",
  //   targetItemId: "ce-Y",
  //   targetAnswer: "no",
  //   description: "Description of the rule",
  // },
];

export interface AppliedRule {
  rule: ConditionalRule;
  targetItemId: string;
  targetItemQuestion: string;
  previousAnswer: Answer;
  newAnswer: Answer;
}

/**
 * Apply conditional rules based on a changed answer
 * 
 * @param items - Current checklist items
 * @param changedItemId - ID of the item that was just changed
 * @param changedAnswer - New answer value for the changed item
 * @returns Object containing updated items and information about applied rules
 */
export function applyConditionalRules(
  items: ChecklistItem[],
  changedItemId: string,
  changedAnswer: Answer
): { items: ChecklistItem[]; appliedRules: AppliedRule[] } {
  // Find all rules that match the changed item
  const applicableRules = CONDITIONAL_RULES.filter(
    (rule) =>
      rule.triggerItemId === changedItemId &&
      (rule.triggerAnswer === null || rule.triggerAnswer === changedAnswer)
  );

  // If no rules apply, return items unchanged
  if (applicableRules.length === 0) {
    return { items, appliedRules: [] };
  }

  // Apply each rule
  let updatedItems = [...items];
  const appliedRules: AppliedRule[] = [];
  
  for (const rule of applicableRules) {
    const targetItemIndex = updatedItems.findIndex(
      (item) => item.id === rule.targetItemId
    );

    if (targetItemIndex !== -1) {
      const targetItem = updatedItems[targetItemIndex];
      const previousAnswer = targetItem.answer;
      
      // Only apply if the answer would actually change
      if (previousAnswer !== rule.targetAnswer) {
        // Update the target item with the rule's answer
        updatedItems[targetItemIndex] = {
          ...targetItem,
          answer: rule.targetAnswer,
        };
        
        appliedRules.push({
          rule,
          targetItemId: rule.targetItemId,
          targetItemQuestion: targetItem.question,
          previousAnswer,
          newAnswer: rule.targetAnswer,
        });
        
        console.log(
          `Applied rule: ${rule.description || `When ${rule.triggerItemId} is ${rule.triggerAnswer}, set ${rule.targetItemId} to ${rule.targetAnswer}`}`
        );
      }
    }
  }

  return { items: updatedItems, appliedRules };
}

/**
 * Get all rules that affect a specific item
 * Useful for documentation and debugging
 */
export function getRulesForItem(itemId: string): ConditionalRule[] {
  return CONDITIONAL_RULES.filter(
    (rule) => rule.triggerItemId === itemId || rule.targetItemId === itemId
  );
}

/**
 * Get a summary of all rules for review
 */
export function getAllRulesSummary(): string {
  return CONDITIONAL_RULES.map((rule, index) => {
    const triggerItem = rule.triggerItemId;
    const targetItem = rule.targetItemId;
    const triggerAnswer = rule.triggerAnswer === null ? "any change" : rule.triggerAnswer;
    const description = rule.description || "No description";
    
    return `Rule ${index + 1}: When "${triggerItem}" is "${triggerAnswer}", set "${targetItem}" to "${rule.targetAnswer}"\n   ${description}`;
  }).join("\n\n");
}

