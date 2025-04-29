"use client";

import { FeedbackModal } from "./ui/feedback-modal";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function FeedbackButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleFeedbackSubmit = async (data: {
    rating: number;
    feedback: string;
    email?: string;
  }) => {
    try {
      if (!isAuthenticated) {
        toast.error("Please sign in to submit feedback");
        return;
      }

      const user = auth.currentUser;
      if (!user || !user.email) {
        toast.error("User not authenticated. Please sign in again.");
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
        createdAt: serverTimestamp(),
        userId: user.uid,
        rating: data.rating
      };

      console.log("Feedback data:", feedbackData);
      
      try {
        const docRef = await addDoc(feedbackRef, feedbackData);
        console.log("Feedback submitted successfully with ID:", docRef.id);
        return true;
      } catch (writeError: any) {
        console.error("Firestore write error:", {
          code: writeError.code,
          message: writeError.message,
          name: writeError.name
        });
        
        if (writeError.code === 'permission-denied') {
          toast.error("You don't have permission to submit feedback. Please sign in again.");
        } else if (writeError.code === 'unavailable') {
          toast.error("Network error. Please check your internet connection.");
        } else {
          toast.error("Failed to submit feedback. Please try again.");
        }
        throw writeError;
      }
    } catch (error: any) {
      console.error("Detailed error submitting feedback:", {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  };

  return <FeedbackModal onSubmit={handleFeedbackSubmit} />;
} 