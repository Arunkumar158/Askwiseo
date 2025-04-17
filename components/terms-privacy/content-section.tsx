"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export function ContentSection() {
  const [activeTab, setActiveTab] = useState("terms");

  // Handle hash changes for direct navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#privacy") {
        setActiveTab("privacy");
      } else {
        setActiveTab("terms");
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
        </TabsList>
        
        <TabsContent
          value="terms"
          className="mt-8 transition-opacity duration-300"
        >
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground">Last updated: April 13, 2025</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using Askwiseo, you agree to be bound by these Terms of Service.</p>
            
            <h2>2. Description of Service</h2>
            <p>Askwiseo is an AI-powered platform that provides intelligent assistance and automation tools.</p>
            
            <h2>3. User Responsibilities</h2>
            <ul>
              <li>Provide accurate information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service in compliance with applicable laws</li>
            </ul>
            
            <h2>4. Intellectual Property</h2>
            <p>All content and materials available on Askwiseo are protected by intellectual property rights.</p>
          </div>
        </TabsContent>
        
        <TabsContent
          value="privacy"
          className="mt-8 transition-opacity duration-300"
        >
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground">Last updated: April 13, 2025</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Account information (name, email, etc.)</li>
              <li>Usage data and analytics</li>
              <li>Communication preferences</li>
            </ul>
            
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Send important updates and notifications</li>
              <li>Analyze and enhance user experience</li>
            </ul>
            
            <h2>3. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li>OpenAI API for AI processing</li>
              <li>Firebase for authentication and data storage</li>
              <li>Razorpay for payment processing</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 