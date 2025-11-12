"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, onAuthStateChange } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
      setLoading(false);
      
      if (user) {
        // User is logged in, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User is not logged in, show login modal
        setShowAuthModal(true);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Estimating Apex
          </h1>
          <p className="text-gray-600 mb-6">
            Quality Assurance Checklist Application
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please sign in to access your reviews and start a new checklist.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Version 1.0.1
        </p>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        allowClose={false}
      />
    </main>
  );
}
