"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle,
  CreditCard,
  ArrowUpRight
} from "lucide-react";

export function PlanUsageTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Pro Plan</h2>
            <p className="text-muted-foreground mb-4">
              Your current plan includes advanced features and higher usage limits.
            </p>
            <Button>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade to Enterprise
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Storage Usage</span>
                <span className="text-sm font-medium">2.4 GB / 10 GB</span>
              </div>
              <Progress value={24} />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Questions This Month</span>
                <span className="text-sm font-medium">156 / 1000</span>
              </div>
              <Progress value={15.6} />
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Features */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Plan Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-medium">10 GB Storage</p>
              <p className="text-sm text-muted-foreground">Store and process your documents</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-medium">1000 Questions/month</p>
              <p className="text-sm text-muted-foreground">Ask questions about your documents</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-medium">Advanced AI Models</p>
              <p className="text-sm text-muted-foreground">Access to GPT-4 and specialized models</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-medium">Priority Support</p>
              <p className="text-sm text-muted-foreground">24/7 email and chat support</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Billing History</h2>
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">March 2024</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$29.00</p>
                <p className="text-sm text-green-600">Paid</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 