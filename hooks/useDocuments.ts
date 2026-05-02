import { useState, useEffect, useCallback } from "react";
import { listDocuments, uploadDocument, deleteDocument, Document, formatFileSize } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export function useDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>("");

    const fetchDocuments = useCallback(async () => {
        if (!user) return;

        // Check if user token is available before fetching
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
            toast.error("Please sign in again");
            return;
        }

        setLoading(true);
        try {
            const { documents } = await listDocuments();
            setDocuments(documents);
        } catch (err: any) {
            toast.error(err.message || "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const upload = useCallback(async (file: File): Promise<Document | null> => {
        if (!user) { toast.error("Please sign in to upload documents"); return null; }
        if (file.type !== "application/pdf") { toast.error("Only PDF files are supported"); return null; }
        if (file.size > 50 * 1024 * 1024) { toast.error("File must be under 50MB"); return null; }

        setUploading(true);
        setUploadProgress("Uploading PDF...");
        try {
            setUploadProgress("Extracting and indexing content...");
            const result = await uploadDocument(file);
            toast.success(`"${file.name}" indexed — ${result.chunk_count} chunks, ${result.page_count} pages`);
            setDocuments((prev) => [result.document, ...prev]);
            return result.document;
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
            return null;
        } finally {
            setUploading(false);
            setUploadProgress("");
        }
    }, [user]);

    const remove = useCallback(async (documentId: string) => {
        const doc = documents.find((d) => d.id === documentId);
        const name = doc?.filename || "document";
        try {
            await deleteDocument(documentId);
            setDocuments((prev) => prev.filter((d) => d.id !== documentId));
            toast.success(`"${name}" deleted`);
        } catch (err: any) {
            toast.error(err.message || "Delete failed");
        }
    }, [documents]);

    return { documents, loading, uploading, uploadProgress, upload, remove, refresh: fetchDocuments, formatFileSize };
}