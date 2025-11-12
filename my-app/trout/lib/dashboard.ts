import { supabase } from './supabase';
import { ChecklistData, ChecklistItem, LogEntry } from '@/types';
import { initialChecklistItems } from './checklistData';

export interface ChecklistSummary {
  id: string;
  client: string | null;
  locationNumber: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
}

export interface LocationGroup {
  locationNumber: string;
  client: string | null;
  checklists: ChecklistSummary[];
}

/**
 * Get all checklists for the current user, grouped by location
 */
export async function getChecklistsByLocation(userId: string): Promise<LocationGroup[]> {
  try {
    // Get all checklists for this user
    const { data: checklists, error: checklistsError } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (checklistsError) throw checklistsError;
    if (!checklists || checklists.length === 0) return [];

    // Get checklist items for all checklists
    const checklistIds = checklists.map(c => c.id);
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .in('checklist_id', checklistIds);

    if (itemsError) throw itemsError;

    // Group items by checklist_id
    const itemsByChecklist = new Map<string, any[]>();
    items?.forEach(item => {
      const list = itemsByChecklist.get(item.checklist_id) || [];
      list.push(item);
      itemsByChecklist.set(item.checklist_id, list);
    });

    // Create summaries with stats
    const summaries: ChecklistSummary[] = checklists.map(checklist => {
      const checklistItems = itemsByChecklist.get(checklist.id) || [];
      const completedItems = checklistItems.filter(i => i.answer !== null).length;
      const failedItems = checklistItems.filter(i => i.answer === 'no').length;

      return {
        id: checklist.id,
        client: checklist.client,
        locationNumber: checklist.location_number,
        completedAt: checklist.completed_at,
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
        totalItems: checklistItems.length,
        completedItems,
        failedItems,
      };
    });

    // Group by location number
    const locationMap = new Map<string, LocationGroup>();
    
    summaries.forEach(summary => {
      const location = summary.locationNumber || 'No Location';
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          locationNumber: location,
          client: summary.client,
          checklists: [],
        });
      }
      locationMap.get(location)!.checklists.push(summary);
    });

    // Convert to array and sort by most recent
    return Array.from(locationMap.values()).map(group => ({
      ...group,
      checklists: group.checklists.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    })).sort((a, b) => {
      // Sort by most recent checklist in group
      const aLatest = new Date(a.checklists[0].updatedAt).getTime();
      const bLatest = new Date(b.checklists[0].updatedAt).getTime();
      return bLatest - aLatest;
    });
  } catch (error) {
    console.error('Error loading checklists:', error);
    throw error;
  }
}

/**
 * Load a specific checklist by ID
 */
export async function loadChecklistById(checklistId: string, userId: string): Promise<ChecklistData | null> {
  try {
    // Get checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .eq('user_id', userId)
      .single();

    if (checklistError) throw checklistError;
    if (!checklist) return null;

    // Get checklist items
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklist.id)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;
    
    console.log('Raw items from database:', items);
    console.log('Items with answers:', items?.filter(item => item.answer !== null));

    // Get log entries
    const { data: logs, error: logsError } = await supabase
      .from('log_entries')
      .select('*')
      .eq('checklist_id', checklist.id)
      .order('created_at', { ascending: true });

    if (logsError) throw logsError;

    // Convert to ChecklistData format
    // Merge saved items with initial checklist to preserve answerType and conditional logic
    const itemsMap = new Map(items?.map(item => [item.item_id, item]) || []);
    const checklistItems: ChecklistItem[] = initialChecklistItems.map(initialItem => {
      const savedItem = itemsMap.get(initialItem.id);
      if (savedItem) {
        return {
          ...initialItem, // Preserve answerType and conditional from initial
          answer: savedItem.answer as 'yes' | 'no' | 'sub' | 'super' | 'apex' | null,
          question: savedItem.question, // Use saved question in case it changed
        };
      }
      return initialItem;
    });

    const logEntries: LogEntry[] = logs?.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      date: log.date,
      message: log.message,
      itemId: log.item_id || undefined,
      itemQuestion: log.item_question || undefined,
    })) || [];

    return {
      id: checklist.id,
      client: checklist.client as any || '',
      locationNumber: checklist.location_number || '',
      items: checklistItems.length > 0 ? checklistItems : initialChecklistItems,
      notes: logEntries,
      startTime: checklist.start_time ? new Date(checklist.start_time).getTime() : null,
      completedAt: checklist.completed_at ? new Date(checklist.completed_at).getTime() : null,
      lastSaved: checklist.updated_at ? new Date(checklist.updated_at).getTime() : null,
    };
  } catch (error) {
    console.error('Error loading checklist:', error);
    throw error;
  }
}

/**
 * Delete a checklist and all its related data
 */
export async function deleteChecklist(checklistId: string, userId: string): Promise<void> {
  try {
    // Verify the checklist belongs to the user
    const { data: checklist, error: checkError } = await supabase
      .from('checklists')
      .select('id')
      .eq('id', checklistId)
      .eq('user_id', userId)
      .single();

    if (checkError) throw checkError;
    if (!checklist) throw new Error('Checklist not found or access denied');

    // Delete checklist (cascade will delete items and logs due to ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from('checklists')
      .delete()
      .eq('id', checklistId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting checklist:', error);
    throw error;
  }
}
