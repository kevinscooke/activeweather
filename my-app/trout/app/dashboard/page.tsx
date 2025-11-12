"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getChecklistsByLocation, deleteChecklist, LocationGroup, ChecklistSummary } from "@/lib/dashboard";
import { getCurrentUser, signOut } from "@/lib/auth";
import Link from "next/link";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function Dashboard() {
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<ChecklistSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { user } = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      setUser(user);
      try {
        const groups = await getChecklistsByLocation(user.id);
        console.log('Loaded location groups:', groups);
        setLocationGroups(groups);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading reviews. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteClick = (e: React.MouseEvent, checklist: ChecklistSummary) => {
    e.preventDefault();
    e.stopPropagation();
    setChecklistToDelete(checklist);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!checklistToDelete || !user) return;

    setDeleting(true);
    try {
      await deleteChecklist(checklistToDelete.id, user.id);
      // Reload the dashboard
      const groups = await getChecklistsByLocation(user.id);
      setLocationGroups(groups);
      setDeleteModalOpen(false);
      setChecklistToDelete(null);
    } catch (error) {
      console.error('Error deleting checklist:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCompletionPercentage = (summary: ChecklistSummary) => {
    if (summary.totalItems === 0) return 0;
    return Math.round((summary.completedItems / summary.totalItems) * 100);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Completed Reviews Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Reviews grouped by location number
              </p>
            </div>
            <div className="flex gap-3 items-center">
              {user && (
                <span className="text-sm text-gray-600">{user.email}</span>
              )}
              <Link
                href="/checklist?new=true"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                New Review
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Location Groups */}
        {locationGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-2">No reviews found yet.</p>
            <p className="text-sm text-gray-500 mb-4">
              Complete a checklist and it will appear here grouped by location number.
            </p>
            <Link
              href="/checklist?new=true"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Start Your First Review
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {locationGroups.map((group) => (
              <div
                key={group.locationNumber}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Location: {group.locationNumber}
                    </h2>
                    {group.client && (
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {group.client}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {group.checklists.length} review{group.checklists.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="space-y-3">
                  {group.checklists.map((checklist) => (
                    <div
                      key={checklist.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/review/${checklist.id}`}
                          className="flex-1"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Review #{checklist.id.slice(0, 8)}
                            </span>
                            {checklist.completedAt && (
                              <span className="text-xs text-gray-500">
                                Completed: {formatDate(checklist.completedAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Progress: </span>
                              <span className="font-medium text-gray-900">
                                {getCompletionPercentage(checklist)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Completed: </span>
                              <span className="font-medium text-green-600">
                                {checklist.completedItems}/{checklist.totalItems}
                              </span>
                            </div>
                            {checklist.failedItems > 0 && (
                              <div>
                                <span className="text-gray-600">Failed: </span>
                                <span className="font-medium text-red-600">
                                  {checklist.failedItems}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${getCompletionPercentage(checklist)}%` }}
                            />
                          </div>
                        </Link>
                        <div className="ml-4 flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteClick(e, checklist)}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete review"
                          >
                            Delete
                          </button>
                          <Link
                            href={`/review/${checklist.id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setChecklistToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        checklistInfo={checklistToDelete ? {
          locationNumber: checklistToDelete.locationNumber,
          client: checklistToDelete.client,
          completedAt: checklistToDelete.completedAt,
        } : undefined}
      />
    </main>
  );
}

