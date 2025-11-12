"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChecklistData, ChecklistItem, Answer, Client, LogEntry } from "@/types";
import { initialChecklistItems, clients } from "@/lib/checklistData";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  createLogEntry,
  calculateProgress,
  shouldShowQuestion,
  getESTTimestamp,
  clearLocalStorage,
} from "@/lib/utils";
import { saveToSupabase, loadFromSupabase, checkSupabaseConnection } from "@/lib/supabaseSync";
import { applyConditionalRules } from "@/lib/conditionalRules";
import { getCurrentUser, onAuthStateChange, signOut } from "@/lib/auth";
import ChecklistSection from "@/components/ChecklistSection";
import ProgressIndicator from "@/components/ProgressIndicator";
import NotesSection from "@/components/NotesSection";
import AuthModal from "@/components/AuthModal";

export default function ChecklistPage() {
  const router = useRouter();
  const [data, setData] = useState<ChecklistData>({
    client: "",
    locationNumber: "",
    items: initialChecklistItems,
    notes: [],
    startTime: null,
    completedAt: null,
    lastSaved: null,
  });

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline" | "error">("synced");
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSyncRef = useRef<ChecklistData | null>(null);
  const isNewChecklist = useRef(false);
  const isSyncingRef = useRef(false);
  const checklistIdRef = useRef<string | undefined>(undefined);

  // Check if this is a "new" checklist request (from URL param or button)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      // Clear everything and start fresh
      clearLocalStorage();
      isNewChecklist.current = true;
      // Clear any existing checklist ID to force creation of new one
      checklistIdRef.current = undefined;
      setData({
        id: undefined, // Important: no ID means it will create a new checklist
        client: "",
        locationNumber: "",
        items: initialChecklistItems,
        notes: [createLogEntry("New checklist started", undefined, undefined)],
        startTime: Date.now(),
        completedAt: null,
        lastSaved: Date.now(),
      });
      setHasLoaded(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', '/checklist');
      return;
    }
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auth state listener
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      if (!user) {
        // Not logged in, redirect to home/login
        router.push('/');
        return;
      }

      setUser(user);

      if (isNewChecklist.current) {
        // New checklist, skip loading
        return;
      }

      // Load data for existing user
      loadData(user.id);
    };

    checkAuth();

    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        router.push('/');
      } else if (!isNewChecklist.current) {
        loadData(user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const loadData = async (userId: string) => {
    try {
      const supabaseOnline = await checkSupabaseConnection();
      if (supabaseOnline && isOnline) {
        const supabaseData = await loadFromSupabase(userId);
        if (supabaseData) {
          const resumeLog = createLogEntry("Checklist loaded from cloud", undefined, undefined);
          if (supabaseData.id) {
            checklistIdRef.current = supabaseData.id;
          }
          setData({
            ...supabaseData,
            notes: [...supabaseData.notes, resumeLog],
          });
          setIsResumed(true);
          setHasLoaded(true);
          saveToLocalStorage(supabaseData);
          return;
        }
      }
    } catch (error) {
      console.error("Error loading from Supabase:", error);
    }

    loadLocalData();
  };

  const loadLocalData = () => {
    if (isNewChecklist.current) return;

    const saved = loadFromLocalStorage();
    if (saved) {
      const itemsMap = new Map(saved.items?.map(item => [item.id, item]) || []);
      const mergedItems = initialChecklistItems.map(initialItem => {
        const savedItem = itemsMap.get(initialItem.id);
        if (savedItem) {
          return {
            ...initialItem,
            answer: savedItem.answer,
            question: savedItem.question,
          };
        }
        return initialItem;
      });

      const resumeLog = createLogEntry("Checklist resumed - local data loaded", undefined, undefined);
      setData({
        ...saved,
        items: mergedItems,
        notes: [...saved.notes, resumeLog],
      });
      setIsResumed(true);
    } else {
      setData((prev) => ({
        ...prev,
        startTime: Date.now(),
        notes: [
          createLogEntry("Checklist started", undefined, undefined),
        ],
      }));
    }
    setHasLoaded(true);
  };

  // Auto-save to localStorage immediately on changes
  useEffect(() => {
    if (!hasLoaded) return;

    const updatedData = {
      ...data,
      lastSaved: Date.now(),
    };

    // Preserve the checklist ID if it exists
    if (checklistIdRef.current && !updatedData.id) {
      updatedData.id = checklistIdRef.current;
    }

    saveToLocalStorage(updatedData);

    if (user && isOnline) {
      pendingSyncRef.current = updatedData;
    }
  }, [data, hasLoaded, user, isOnline]);

  // Periodic sync to Supabase (every 30 seconds)
  useEffect(() => {
    if (!user || !isOnline) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    const pendingData = pendingSyncRef.current;
    if (pendingData && !lastSyncTime) {
      syncToSupabase(pendingData);
    }

    syncIntervalRef.current = setInterval(() => {
      const pending = pendingSyncRef.current;
      if (pending) {
        syncToSupabase(pending);
        pendingSyncRef.current = null;
      }
    }, 30000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOnline]);

  const syncToSupabase = async (dataToSync: ChecklistData) => {
    if (!user) return;
    
    // Prevent concurrent syncs
    if (isSyncingRef.current) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    // Ensure we use the latest checklist ID if it exists
    const dataWithId = {
      ...dataToSync,
      id: dataToSync.id || checklistIdRef.current,
    };

    isSyncingRef.current = true;
    setSyncStatus("syncing");
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const errorMsg = "Supabase not configured. Check your .env.local file.";
        console.error(errorMsg);
        setSyncError(errorMsg);
        setSyncStatus("error");
        isSyncingRef.current = false;
        return;
      }

      const supabaseOnline = await checkSupabaseConnection();
      if (supabaseOnline) {
        const checklistId = await saveToSupabase(dataWithId, user.id);
        if (checklistId) {
          checklistIdRef.current = checklistId;
          setData((prev) => ({ ...prev, id: checklistId }));
          setSyncStatus("synced");
          setLastSyncTime(Date.now());
          setSyncError(null);
          // Update pendingSyncRef with the new ID to prevent duplicate creation
          if (pendingSyncRef.current) {
            pendingSyncRef.current = { ...pendingSyncRef.current, id: checklistId };
          }
        } else {
          const errorMsg = "Failed to save checklist - no ID returned";
          console.error(errorMsg);
          setSyncError(errorMsg);
          setSyncStatus("error");
        }
      } else {
        setSyncStatus("offline");
        setSyncError("Cannot connect to Supabase");
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.code || "Unknown sync error";
      console.error("Error syncing to Supabase:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      setSyncError(errorMsg);
      setSyncStatus("error");
    } finally {
      isSyncingRef.current = false;
    }
  };

  const triggerSync = () => {
    if (pendingSyncRef.current) {
      syncToSupabase(pendingSyncRef.current);
    } else {
      syncToSupabase(data);
    }
  };

  const handleClientChange = (client: Client | "") => {
    const logEntry = createLogEntry(
      `Client changed to: ${client || "None"}`,
      undefined,
      undefined
    );
    setData((prev) => ({
      ...prev,
      client,
      notes: [...prev.notes, logEntry],
    }));
  };

  const handleLocationChange = (locationNumber: string) => {
    setData((prev) => ({
      ...prev,
      locationNumber,
    }));
  };

  const handleAnswerChange = (itemId: string, answer: Answer) => {
    setData((prev) => {
      // First, update the item that was changed
      let updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, answer } : item
      );
      
      // Apply conditional rules based on the changed answer
      const { items: itemsAfterRules, appliedRules } = applyConditionalRules(updatedItems, itemId, answer);
      updatedItems = itemsAfterRules;
      
      const item = updatedItems.find((i) => i.id === itemId);
      
      // Create log entries
      const logEntries = [
        createLogEntry(
          `Answered "${answer}" to: ${item?.question || itemId}`,
          itemId,
          item?.question
        ),
      ];
      
      // Add log entries for any conditional rules that were applied
      for (const appliedRule of appliedRules) {
        logEntries.push(
          createLogEntry(
            `Auto-set "${appliedRule.newAnswer}" to: ${appliedRule.targetItemQuestion} (${appliedRule.rule.description || 'conditional rule'})`,
            appliedRule.targetItemId,
            appliedRule.targetItemQuestion
          )
        );
      }

      const visibleItems = updatedItems.filter((i) =>
        shouldShowQuestion(i, prev.client)
      );
      const allCompleted = visibleItems.every((i) => i.answer !== null);
      
      const newData = {
        ...prev,
        items: updatedItems,
        notes: [...prev.notes, ...logEntries],
        completedAt: allCompleted && !prev.completedAt ? Date.now() : prev.completedAt,
      };

      if (allCompleted && !prev.completedAt && user && isOnline) {
        setTimeout(() => triggerSync(), 500);
      }

      return newData;
    });
  };

  const handleAddNote = (message: string) => {
    const logEntry = createLogEntry(message, undefined, undefined);
    setData((prev) => ({
      ...prev,
      notes: [...prev.notes, logEntry],
    }));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset? This will clear all data.")) {
      clearLocalStorage();
      checklistIdRef.current = undefined;
      const resetData: ChecklistData = {
        client: "",
        locationNumber: "",
        items: initialChecklistItems,
        notes: [createLogEntry("Checklist reset", undefined, undefined)],
        startTime: Date.now(),
        completedAt: null,
        lastSaved: Date.now(),
      };
      setData(resetData);
      saveToLocalStorage(resetData);
      if (user) {
        syncToSupabase(resetData);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    loadLocalData();
  };

  const visibleItems = data.items.filter((item) =>
    shouldShowQuestion(item, data.client)
  );
  const progress = calculateProgress(visibleItems);

  const ceItems = data.items.filter((item) => item.section === "ce");
  const sowItems = data.items.filter((item) => item.section === "sow");
  const paItems = data.items.filter((item) => item.section === "pa");

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "synced":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-blue-100 text-blue-800";
      case "offline":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case "synced":
        if (lastSyncTime) {
          const secondsAgo = Math.floor((Date.now() - lastSyncTime) / 1000);
          if (secondsAgo < 60) {
            return `✓ Synced ${secondsAgo}s ago`;
          }
          return `✓ Synced ${Math.floor(secondsAgo / 60)}m ago`;
        }
        return "✓ Synced";
      case "syncing":
        return "⟳ Syncing...";
      case "offline":
        return "⚠ Offline";
      case "error":
        return "✗ Sync Error";
      default:
        return "?";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-4 px-4" style={{ maxHeight: '1080px', overflow: 'auto' }}>
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Estimating Apex - Quality Assurance Checklist
              </h1>
              <p className="text-xs text-gray-600">Version 1.0.1</p>
            </div>
            <div className="flex gap-2 items-center">
              {isResumed && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium">
                  ✓ Data Restored
                </div>
              )}
              {user && (
                <>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`px-3 py-1 rounded-md text-xs font-medium ${getSyncStatusColor()}`}>
                      {getSyncStatusText()}
                    </div>
                    {syncError && syncStatus === "error" && (
                      <div className="text-xs text-red-600 max-w-xs text-right" title={syncError}>
                        {syncError.length > 50 ? syncError.substring(0, 50) + "..." : syncError}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    View Reviews
                  </Link>
                </>
              )}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={data.client}
                onChange={(e) => handleClientChange(e.target.value as Client | "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Number
              </label>
              <input
                type="text"
                value={data.locationNumber}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Enter location number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <ProgressIndicator
            completed={progress.completed}
            total={progress.total}
            percentage={progress.percentage}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Checklist Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* SOW and CE side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChecklistSection
                title="SOW Document"
                items={sowItems}
                selectedClient={data.client}
                onAnswerChange={handleAnswerChange}
              />
              <ChecklistSection
                title="CE – Cost Sheet"
                items={ceItems}
                selectedClient={data.client}
                onAnswerChange={handleAnswerChange}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ChecklistSection
              title="PA Folder"
              items={paItems}
              selectedClient={data.client}
              onAnswerChange={handleAnswerChange}
            />
            <NotesSection notes={data.notes} onAddNote={handleAddNote} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {data.lastSaved && (
              <span>
                Last saved: {new Date(data.lastSaved).toLocaleTimeString()}
                {!user && " (local only)"}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reset Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />
    </main>
  );
}

