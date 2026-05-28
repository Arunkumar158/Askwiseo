import { auth } from "@/lib/firebase";

const SERVER_UNAVAILABLE_MESSAGE = "Server temporarily unavailable. Please try again.";

function getBaseUrl(): string {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (configured) return configured.replace(/\/$/, "");
    // Same-origin /api/* is proxied to the FastAPI backend via next.config rewrites.
    if (typeof window !== "undefined") return "";
    return process.env.API_PROXY_URL?.replace(/\/$/, "") || "";
}

export interface Document {
    id: string;
    user_id: string;
    filename: string;
    page_count: number;
    chunk_count: number;
    file_size_bytes: number;
    status: "ready" | "processing" | "error";
    created_at: string;
    updated_at: string;
    summary?: string;
    key_topics?: string[];
    document_type?: string;
    action_items?: string[];
    file_url?: string;
}

export interface ChatSource {
    filename: string;
    document_id: string;
    chunk_index: number;
    score: number;
    excerpt: string;
}

export interface ChatMessage {
    id: string;
    document_id?: string | null;
    question: string;
    answer: string;
    sources: ChatSource[];
    created_at: string;
}

export interface UploadResult {
    success: boolean;
    document: Document;
    chunk_count: number;
    page_count: number;
}

export interface ChatResult {
    answer: string;
    sources: ChatSource[];
    chat_id: string;
    error_code?: string;
}

export interface Insights {
    total_documents: number;
    total_pages: number;
    total_chunks: number;
    total_size_bytes: number;
    document_types: Record<string, number>;
    top_topics: { topic: string; count: number }[];
    all_action_items: { text: string; source: string; document_id: string }[];
}

async function getAuthHeaders(forceRefresh = false): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Please sign in to continue");
    }
    try {
        const token = await user.getIdToken(forceRefresh);
        return { Authorization: `Bearer ${token}` };
    } catch {
        throw new Error("Authentication failed. Please sign in again.");
    }
}

async function fetchWithNetworkMessage(url: string, init: RequestInit): Promise<Response> {
    try {
        return await fetch(url, init);
    } catch {
        throw new Error(SERVER_UNAVAILABLE_MESSAGE);
    }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${getBaseUrl()}${path}`;
    const method = (options.method || "GET").toUpperCase();
    const canRetryNetwork = method === "GET" || method === "HEAD";
    const request = async (forceRefresh: boolean) => {
        const authHeaders = await getAuthHeaders(forceRefresh);
        return fetchWithNetworkMessage(url, {
            ...options,
            headers: { ...authHeaders, ...(options.headers || {}) },
        });
    };

    let response: Response;
    try {
        response = await request(false);
    } catch (error) {
        if (!canRetryNetwork) throw error;
        response = await request(false);
    }

    if (response.status === 401 && auth.currentUser) {
        response = await request(true);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        const message =
            response.status === 401
                ? "Session expired. Please sign out and sign in again."
                : error.detail || `API error: ${response.status}`;
        throw new Error(message || SERVER_UNAVAILABLE_MESSAGE);
    }
    return response.json() as Promise<T>;
}

export async function uploadDocument(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const upload = async (forceRefresh: boolean) => {
        const authHeaders = await getAuthHeaders(forceRefresh);
        return fetchWithNetworkMessage(`${getBaseUrl()}/api/upload`, {
            method: "POST",
            headers: authHeaders,
            body: formData,
        });
    };

    let response = await upload(false);
    if (response.status === 401 && auth.currentUser) {
        response = await upload(true);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(error.detail || "Upload failed");
    }
    return response.json();
}

export async function listDocuments(): Promise<{ documents: Document[]; count: number }> {
    return apiFetch("/api/documents");
}

export async function getDocument(documentId: string): Promise<Document> {
    return apiFetch(`/api/documents/${encodeURIComponent(documentId)}`);
}

export async function deleteDocument(documentId: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/documents/${documentId}`, { method: "DELETE" });
}

export async function getInsights(): Promise<Insights> {
    return apiFetch("/api/documents/insights");
}

export async function sendChatMessage(
    question: string,
    documentId?: string,
    includeHistory: boolean = true
): Promise<ChatResult> {
    return apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            question,
            document_id: documentId || null,
            include_history: includeHistory,
        }),
    });
}

export async function getChatHistory(
    documentId?: string,
    limit: number = 20
): Promise<{ history: ChatMessage[] }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (documentId) params.set("document_id", documentId);
    return apiFetch(`/api/chat/history?${params.toString()}`);
}

export interface UserPlan {
    plan: "free" | "starter" | "pro" | "enterprise";
    questions_today: number;
    questions_limit: number;
    pdf_count: number;
    pdf_limit: number;
    storage_used_bytes: number;
    storage_limit_bytes: number;
    billing_cycle_start: string;
    razorpay_subscription_id?: string;
    paypal_subscription_id?: string;
}

export async function getUserPlan(): Promise<UserPlan> {
    const plan = await apiFetch<Partial<UserPlan> & { created_at?: string }>("/api/plan");
    return {
        plan: plan.plan || "free",
        questions_today: Number(plan.questions_today || 0),
        questions_limit: Number(plan.questions_limit || 20),
        pdf_count: Number(plan.pdf_count || 0),
        pdf_limit: Number(plan.pdf_limit || 10),
        storage_used_bytes: Number(plan.storage_used_bytes || 0),
        storage_limit_bytes: Number(plan.storage_limit_bytes || 5242880),
        billing_cycle_start: String(
            plan.billing_cycle_start || plan.created_at || new Date().toISOString()
        ),
        razorpay_subscription_id: plan.razorpay_subscription_id,
        paypal_subscription_id: plan.paypal_subscription_id,
    };
}

export async function createRazorpayOrder(planId: string): Promise<{ order_id: string; amount: number; currency: string }> {
    return apiFetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
    });
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
