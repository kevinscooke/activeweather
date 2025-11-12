import { supabase } from './supabase';
import { ChecklistData, ChecklistItem, LogEntry } from '@/types';
import { initialChecklistItems } from './checklistData';

/**
 * Save checklist data to Supabase
 */
export async function saveToSupabase(data: ChecklistData, userId: string): Promise<string | null> {
  try {
    // Validate Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured. Please check your .env.local file.');
    }

    // Upsert checklist - update existing or create new
    let checklistId: string | null = data.id || null;

    if (checklistId) {
      // Update existing checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .update({
          client: data.client || null,
          location_number: data.locationNumber || null,
          start_time: data.startTime ? new Date(data.startTime).toISOString() : null,
          completed_at: data.completedAt ? new Date(data.completedAt).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', checklistId)
        .eq('user_id', userId)
        .select()
        .single();

      if (checklistError) throw checklistError;
      if (!checklist) throw new Error('Checklist not found');
    } else {
      // Always create a NEW checklist when no ID is provided
      // This ensures "New Review" creates a fresh checklist every time
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .insert({
          user_id: userId,
          client: data.client || null,
          location_number: data.locationNumber || null,
          start_time: data.startTime ? new Date(data.startTime).toISOString() : null,
          completed_at: data.completedAt ? new Date(data.completedAt).toISOString() : null,
        })
        .select()
        .single();

      if (checklistError) {
        console.error('Error creating new checklist:', checklistError);
        throw checklistError;
      }
      if (!checklist) throw new Error('Failed to create checklist');
      checklistId = checklist.id;
    }


    // Delete existing items and log entries for this checklist
    const { error: deleteItemsError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('checklist_id', checklistId);
    
    if (deleteItemsError) {
      console.error('Error deleting existing items:', deleteItemsError);
      throw deleteItemsError;
    }

    const { error: deleteLogsError } = await supabase
      .from('log_entries')
      .delete()
      .eq('checklist_id', checklistId);
    
    if (deleteLogsError) {
      console.error('Error deleting existing logs:', deleteLogsError);
      throw deleteLogsError;
    }

    // Insert checklist items (only if we have items to insert)
    if (data.items && data.items.length > 0) {
      const itemsToInsert = data.items.map(item => ({
        checklist_id: checklistId,
        item_id: item.id,
        question: item.question,
        answer: item.answer,
        section: item.section,
      }));

      console.log('Saving items to database:', itemsToInsert);
      console.log('Items with answers being saved:', itemsToInsert.filter(item => item.answer !== null));

      // Use upsert instead of insert to handle duplicates gracefully
      const { error: itemsError } = await supabase
        .from('checklist_items')
        .upsert(itemsToInsert, {
          onConflict: 'checklist_id,item_id',
        });

      if (itemsError) {
        console.error('Error upserting items:', itemsError);
        throw itemsError;
      }
      
      console.log('Items saved successfully');
    }

    // Insert log entries
    if (data.notes && data.notes.length > 0) {
      const logsToInsert = data.notes.map(note => ({
        checklist_id: checklistId,
        message: note.message,
        item_id: note.itemId || null,
        item_question: note.itemQuestion || null,
        timestamp: note.timestamp,
        date: note.date,
      }));

      const { error: logsError } = await supabase
        .from('log_entries')
        .insert(logsToInsert);

      if (logsError) throw logsError;
    }

    return checklistId;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
}

/**
 * Load checklist data from Supabase
 */
export async function loadFromSupabase(userId: string): Promise<ChecklistData | null> {
  try {
    // Get the most recent checklist for this user
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (checklistError) {
      // No checklist found is okay
      if (checklistError.code === 'PGRST116') {
        return null;
      }
      throw checklistError;
    }

    if (!checklist) return null;

    // Get checklist items
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklist.id)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

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
    console.error('Error loading from Supabase:', error);
    throw error;
  }
}

/**
 * Check if user is online and Supabase is accessible
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('checklists').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

