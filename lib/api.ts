import { auth, getDbInstance } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

function getBaseUrl(): string {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (configured) return configured.replace(/\/$/, "");
    // Same-origin /api/* is proxied to the FastAPI backend via next.config rewrites.
    if (typeof window !== "undefined") return "";
    return process.env.API_PROXY_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${getBaseUrl()}${path}`;
    const request = async (forceRefresh: boolean) => {
        const authHeaders = await getAuthHeaders(forceRefresh);
        return fetch(url, {
            ...options,
            headers: { ...authHeaders, ...(options.headers || {}) },
        });
    };

    let response = await request(false);
    if (response.status === 401 && auth.currentUser) {
        response = await request(true);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        const message =
            response.status === 401
                ? "Session expired. Please sign out and sign in again."
                : error.detail || `API error: ${response.status}`;
        throw new Error(message);
    }
    return response.json() as Promise<T>;
}

export async function uploadDocument(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const upload = async (forceRefresh: boolean) => {
        const authHeaders = await getAuthHeaders(forceRefresh);
        return fetch(`${getBaseUrl()}/api/upload`, {
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
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Please sign in to continue");
    }

    const db = getDbInstance();
    const documentsQuery = query(
        collection(db, "documents"),
        where("user_id", "==", user.uid)
    );
    const snapshot = await getDocs(documentsQuery);
    const documents = snapshot.docs
        .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
        }) as Document)
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

    return { documents, count: documents.length };
}

export async function getDocument(documentId: string): Promise<Document> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Please sign in to continue");
    }

    const db = getDbInstance();
    const snapshot = await getDoc(doc(db, "documents", documentId));
    if (!snapshot.exists()) {
        throw new Error("Document not found.");
    }

    const document = {
        id: snapshot.id,
        ...snapshot.data(),
    } as Document;
    if (document.user_id !== user.uid) {
        throw new Error("Document not found.");
    }

    return document;
}

export async function deleteDocument(documentId: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/documents/${documentId}`, { method: "DELETE" });
}

export async function getInsights(): Promise<Insights> {
    const { documents } = await listDocuments();
    const documentTypes: Record<string, number> = {};
    const topicCounts: Record<string, number> = {};
    const allActionItems: Insights["all_action_items"] = [];

    for (const document of documents) {
        const documentType = document.document_type || "Other";
        documentTypes[documentType] = (documentTypes[documentType] || 0) + 1;

        for (const topic of document.key_topics || []) {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }

        for (const item of document.action_items || []) {
            allActionItems.push({
                text: item,
                source: document.filename,
                document_id: document.id,
            });
        }
    }

    return {
        total_documents: documents.length,
        total_pages: documents.reduce((total, document) => total + Number(document.page_count || 0), 0),
        total_chunks: documents.reduce((total, document) => total + Number(document.chunk_count || 0), 0),
        total_size_bytes: documents.reduce(
            (total, document) => total + Number(document.file_size_bytes || 0),
            0
        ),
        document_types: documentTypes,
        top_topics: Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15),
        all_action_items: allActionItems,
    };
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
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Please sign in to continue");
    }

    const constraints = [where("user_id", "==", user.uid)];
    if (documentId) {
        constraints.push(where("document_id", "==", documentId));
    }

    const db = getDbInstance();
    const historyQuery = query(collection(db, "chat_history"), ...constraints);
    const snapshot = await getDocs(historyQuery);
    const history = snapshot.docs
        .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
        }) as ChatMessage)
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
        .slice(0, limit)
        .reverse();

    return { history };
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
}

export async function getUserPlan(): Promise<UserPlan> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Please sign in to continue");
    }

    const db = getDbInstance();
    const [planSnapshot, documentsResult] = await Promise.all([
        getDoc(doc(db, "user_plans", user.uid)),
        listDocuments(),
    ]);
    const documents = documentsResult.documents;
    const storedPlan = planSnapshot.exists() ? planSnapshot.data() : {};

    return {
        plan: (storedPlan.plan as UserPlan["plan"]) || "free",
        questions_today: Number(storedPlan.questions_today || 0),
        questions_limit: Number(storedPlan.questions_limit || 20),
        pdf_count: documents.length,
        pdf_limit: Number(storedPlan.pdf_limit || 10),
        storage_used_bytes: documents.reduce(
            (total, document) => total + Number(document.file_size_bytes || 0),
            0
        ),
        storage_limit_bytes: Number(storedPlan.storage_limit_bytes || 5242880),
        billing_cycle_start:
            String(storedPlan.billing_cycle_start || storedPlan.created_at || new Date().toISOString()),
        razorpay_subscription_id:
            typeof storedPlan.razorpay_subscription_id === "string"
                ? storedPlan.razorpay_subscription_id
                : undefined,
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
