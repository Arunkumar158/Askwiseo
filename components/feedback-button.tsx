"use client";

import { FeedbackModal } from "./ui/feedback-modal";

export function FeedbackButton() {
  const handleFeedbackSubmit = async (data: {
    rating: number;
    feedback: string;
    email?: string;
  }) => {
    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", data);
    
    // Example API call (uncomment and modify as needed):
    // await fetch("/api/feedback", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data),
    // });
  };

  return <FeedbackModal onSubmit={handleFeedbackSubmit} />;
} 