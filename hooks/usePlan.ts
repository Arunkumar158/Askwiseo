import { useState, useEffect, useCallback } from "react";
import { UserPlan, getUserPlan, apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export function usePlan() {
    const { user, loading: authLoading } = useAuth();
    const [plan, setPlan] = useState<UserPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlan = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserPlan();
            setPlan(data);
            setError(null);
        } catch (err: any) {
            const message = err.message || "Server temporarily unavailable. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            fetchPlan();
        } else {
            setPlan(null);
            setLoading(false);
        }
    }, [user, authLoading, fetchPlan]);

    const startUpgrade = async (planType: string) => {
        try {
            const res = await apiFetch<{ approval_url: string }>("/api/billing/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_type: planType }),
            });
            if (res.approval_url) {
                window.location.href = res.approval_url;
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to initiate upgrade");
        }
    };

    const isFree = plan?.plan === "free";
    const isStarter = plan?.plan === "starter";
    const isPro = plan?.plan === "pro";
    const isEnterprise = plan?.plan === "enterprise";

    const canUpload = plan ? plan.pdf_count < plan.pdf_limit && plan.storage_used_bytes < plan.storage_limit_bytes : false;
    const canAskQuestion = plan ? plan.questions_today < plan.questions_limit : false;

    return {
        plan,
        loading,
        error,
        isFree,
        isStarter,
        isPro,
        isEnterprise,
        canUpload,
        canAskQuestion,
        startUpgrade,
        refetch: fetchPlan
    };
}
