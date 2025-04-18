"use client";

import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import SeekerDashboard from "./components/SeekerDashboard";
import ProviderDashboard from "./components/ProviderDashboard";

export default function Home() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/auth/login");
    }
  }, [token, router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {user.role === "seeker" ? <SeekerDashboard /> : <ProviderDashboard />}
    </main>
  );
}
