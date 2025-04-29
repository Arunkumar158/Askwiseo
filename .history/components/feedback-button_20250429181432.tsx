"use client";

import { FeedbackModal } from "./ui/feedback-modal";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export function FeedbackButton() {
  const handleFeedbackSubmit = async (data: {
    rating: number;
    feedback: string;
    email?: string;
  }) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in to submit feedback");
        return;
      }

      if (!data.feedback.trim()) {
        toast.error("Please enter your feedback");
        return;
      }

      // Map rating to emoji
      const emojiMap = {
        1: "😡",
        2: "😕",
        3: "🙂",
        4: "😃",
        5: "🤩"
      };

      await addDoc(collection(db, "feedbacks"), {
        email: user.email,
        feedback: data.feedback.trim(),
        emoji: emojiMap[data.rating as keyof typeof emojiMap],
        createdAt: serverTimestamp()
      });

      // Return true to indicate successful submission
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  return <FeedbackModal onSubmit={handleFeedbackSubmit} />;
} 