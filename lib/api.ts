import { auth } from "@/lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in to continue");
  }
  try {
    const token = await user.getIdToken(true); // force refresh
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    throw new Error("Authentication failed. Please sign in again.");
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...authHeaders, ...(options.headers || {}) },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `API error: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export async function uploadDocument(file: File): Promise<UploadResult> {
    const authHeaders = await getAuthHeaders();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${BASE_URL}/api/upload`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
    });
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
    return apiFetch(`/api/documents/${documentId}`);
}

export async function deleteDocument(documentId: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/documents/${documentId}`, { method: "DELETE" });
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
    return apiFetch(`/api/chat/history?${params}`);
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}