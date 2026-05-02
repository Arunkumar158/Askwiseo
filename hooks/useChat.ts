import { useState, useCallback } from "react";
import { sendChatMessage, getChatHistory, ChatSource } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export interface LocalMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: ChatSource[];
    timestamp: string;
    isLoading?: boolean;
}

export function useChat(documentId?: string) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const loadHistory = useCallback(async () => {
        if (!user || historyLoaded) return;
        try {
            const { history } = await getChatHistory(documentId, 20);
            const msgs: LocalMessage[] = history.flatMap((h) => [
                { id: `${h.id}-q`, role: "user" as const, content: h.question, timestamp: h.created_at },
                { id: `${h.id}-a`, role: "assistant" as const, content: h.answer, sources: h.sources, timestamp: h.created_at },
            ]);
            setMessages(msgs);
            setHistoryLoaded(true);
        } catch {
            // Silent fail — fresh chat is fine
        }
    }, [user, documentId, historyLoaded]);

    const sendMessage = useCallback(async (question: string) => {
        if (!user) { toast.error("Please sign in"); return; }
        if (!question.trim() || loading) return;

        // Check if user token is available before sending
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
            toast.error("Please sign in again");
            return;
        }

        const userMsg: LocalMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: question,
            timestamp: new Date().toISOString(),
        };

        const loadingMsg: LocalMessage = {
            id: `loading-${Date.now()}`,
            role: "assistant",
            content: "",
            isLoading: true,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg, loadingMsg]);
        setLoading(true);

        try {
            const result = await sendChatMessage(question, documentId, true);
            const assistantMsg: LocalMessage = {
                id: result.chat_id,
                role: "assistant",
                content: result.answer,
                sources: result.sources,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev.filter((m) => !m.isLoading), assistantMsg]);
        } catch (err: any) {
            const errorMsg: LocalMessage = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: `Error: ${err.message || "Failed to get a response"}`,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev.filter((m) => !m.isLoading), errorMsg]);
        } finally {
            setLoading(false);
        }
    }, [user, documentId, loading]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setHistoryLoaded(false);
    }, []);

    return { messages, loading, sendMessage, loadHistory, clearMessages };
}