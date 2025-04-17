"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const EMOJI_SCALE = [
  { emoji: "😡", value: 1, label: "Very Dissatisfied" },
  { emoji: "😕", value: 2, label: "Dissatisfied" },
  { emoji: "🙂", value: 3, label: "Neutral" },
  { emoji: "😃", value: 4, label: "Satisfied" },
  { emoji: "🤩", value: 5, label: "Very Satisfied" },
];

interface FeedbackModalProps {
  onSubmit?: (data: {
    rating: number;
    feedback: string;
    email?: string;
  }) => Promise<void>;
}

export function FeedbackModal({ onSubmit }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ rating, feedback, email });
      }
      toast.success("Thank you for your feedback!");
      setIsOpen(false);
      setRating(0);
      setFeedback("");
      setEmail("");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-200"
        aria-label="Leave Feedback"
      >
        <span className="text-xl">💬</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md p-6 bg-card rounded-lg shadow-lg border animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-2xl font-semibold mb-6">We'd love your feedback!</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Emoji Rating Scale */}
              <div className="space-y-2">
                <label className="text-sm font-medium">How satisfied are you?</label>
                <div className="flex justify-between items-center">
                  {EMOJI_SCALE.map(({ emoji, value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`p-2 rounded-full transition-transform hover:scale-110 ${
                        rating === value ? "ring-2 ring-primary" : ""
                      }`}
                      aria-label={label}
                    >
                      <span className="text-2xl">{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Tell us what's on your mind...
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background"
                  placeholder="Your feedback helps us improve..."
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md border bg-background"
                  placeholder="your@email.com"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 