"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadChecklistById } from "@/lib/dashboard";
import { getCurrentUser, signOut } from "@/lib/auth";
import { ChecklistData } from "@/types";
import ChecklistSection from "@/components/ChecklistSection";
import NotesSection from "@/components/NotesSection";
import MetricsDisplay from "@/components/MetricsDisplay";
import { calculateMetrics, calculateProgress, shouldShowQuestion } from "@/lib/utils";
import Link from "next/link";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadReview = async () => {
      const { user } = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      setUser(user);

      try {
        const checklistId = params.id as string;
        const checklistData = await loadChecklistById(checklistId, user.id);
        if (!checklistData) {
          router.push('/dashboard');
          return;
        }
        console.log('Loaded checklist data:', checklistData);
        console.log('Items with answers:', checklistData.items.filter(item => item.answer !== null));
        setData(checklistData);
      } catch (error) {
        console.error('Error loading review:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadReview();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading review...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const visibleItems = data.items.filter((item) =>
    shouldShowQuestion(item, data.client)
  );
  const progress = calculateProgress(visibleItems);
  const metrics = calculateMetrics(data, visibleItems);

  const ceItems = data.items.filter((item) => item.section === "ce");
  const sowItems = data.items.filter((item) => item.section === "sow");
  const paItems = data.items.filter((item) => item.section === "pa");

  return (
    <main className="min-h-screen bg-gray-50 py-4 px-4" style={{ maxHeight: '1080px', overflow: 'auto' }}>
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Review: {data.locationNumber || 'No Location'}
              </h1>
              <p className="text-xs text-gray-600">
                {data.client && `Client: ${data.client}`}
                {data.completedAt && ` • Completed: ${new Date(data.completedAt).toLocaleString()}`}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                ← Back to Dashboard
              </Link>
              <Link
                href="/checklist?new=true"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                New Review
              </Link>
              {user && (
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
            <strong>Debug:</strong> Total items: {data.items.length}, 
            Items with answers: {data.items.filter(i => i.answer !== null).length},
            CE items: {ceItems.length}, SOW items: {sowItems.length}, PA items: {paItems.length}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {progress.completed} of {progress.total} checks completed
              </span>
              <span className="text-sm font-semibold text-gray-900">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Checklist Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* CE and SOW side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChecklistSection
                title="CE – Cost Sheet"
                items={ceItems}
                selectedClient={data.client}
                onAnswerChange={() => {}}
                readOnly={true}
              />
              <ChecklistSection
                title="SOW Document"
                items={sowItems}
                selectedClient={data.client}
                onAnswerChange={() => {}}
                readOnly={true}
              />
            </div>
            {/* PA Folder below */}
            <ChecklistSection
              title="PA Folder"
              items={paItems}
              selectedClient={data.client}
              onAnswerChange={() => {}}
              readOnly={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <MetricsDisplay metrics={metrics} />
            <NotesSection notes={data.notes} onAddNote={() => {}} readOnly={true} />
          </div>
        </div>
      </div>
    </main>
  );
}

