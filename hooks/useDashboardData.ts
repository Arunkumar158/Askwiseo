// hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from "react";
import { listDocuments, getInsights } from "@/lib/api";
import { getUserPlan } from "@/lib/api";
import { batchRequests } from "@/lib/batchRequests";

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
      const results = await batchRequests([
        () => listDocuments().then(r => r.documents),
        () => getInsights(),
        () => getUserPlan(),
      ]);
      const [documents, insights, plan] = results;
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
