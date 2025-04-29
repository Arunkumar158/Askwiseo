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

      console.log("Submitting feedback to Firestore...");
      const feedbackRef = collection(db, "feedbacks");
      const feedbackData = {
        email: user.email,
        feedback: data.feedback.trim(),
        emoji: emojiMap[data.rating as keyof typeof emojiMap],
        createdAt: serverTimestamp()
      };

      console.log("Feedback data:", feedbackData);
      const docRef = await addDoc(feedbackRef, feedbackData);
      console.log("Feedback submitted successfully with ID:", docRef.id);

      // Return true to indicate successful submission
      return true;
    } catch (error: any) {
      console.error("Detailed error submitting feedback:", {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      if (error.code === 'permission-denied') {
        toast.error("You don't have permission to submit feedback. Please sign in again.");
      } else if (error.code === 'unavailable') {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
      throw error;
    }
  };

  return <FeedbackModal onSubmit={handleFeedbackSubmit} />;
} 