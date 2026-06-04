import { useState, useCallback } from "react";
import { sendChatMessage, getChatHistory, ChatSource } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export interface LocalMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: ChatSource[];
    timestamp: string;
    isLoading?: boolean;
    error_code?: string;
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
                {
                    id: `${h.id}-q`,
                    role: "user" as const,
                    content: h.question,
                    timestamp: h.created_at,
                },
                {
                    id: `${h.id}-a`,
                    role: "assistant" as const,
                    content: h.answer,
                    sources: h.sources,
                    timestamp: h.created_at,
                },
            ]);
            setMessages(msgs);
            setHistoryLoaded(true);
        } catch {
            // Silent fail — fresh chat is fine
        }
    }, [user, documentId, historyLoaded]);

    const sendMessage = useCallback(
        async (question: string) => {
            if (!user) {
                toast.error("Please sign in");
                return;
            }
            if (!question.trim() || loading) return;

            // NOTE: Do NOT manually fetch the token here — apiFetch / getAuthHeaders
            // already handles token retrieval and force-refresh on 401.  The previous
            // double-fetch added latency and could cause race conditions if the token
            // was refreshed between the two calls.

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
                    id: result.chat_id ?? `assistant-${Date.now()}`,
                    role: "assistant",
                    content: result.answer,
                    sources: result.sources,
                    timestamp: new Date().toISOString(),
                    error_code: result.error_code,
                };
                setMessages((prev) => [
                    ...prev.filter((m) => !m.isLoading),
                    assistantMsg,
                ]);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Server temporarily unavailable. Please try again.";
                toast.error(message);
                const errorMsg: LocalMessage = {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content: message,
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [
                    ...prev.filter((m) => !m.isLoading),
                    errorMsg,
                ]);
            } finally {
                setLoading(false);
            }
        },
        [user, documentId, loading]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
        setHistoryLoaded(false);
    }, []);

    return { messages, loading, sendMessage, loadHistory, clearMessages };
}
