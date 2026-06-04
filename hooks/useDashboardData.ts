// hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from "react";
import { listDocuments, getInsights, getUserPlan, Document, Insights, UserPlan } from "@/lib/api";

export interface DashboardData {
  documents: Document[];
  insights: Insights;
  plan: UserPlan;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [documents, insights, plan] = await Promise.all([
        listDocuments().then((r) => r.documents),
        getInsights(),
        getUserPlan(),
      ]);
      setData({ documents, insights, plan });
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}
