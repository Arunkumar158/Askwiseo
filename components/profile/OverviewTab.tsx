"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare, 
  HardDrive, 
  Upload, 
  Search,
  Clock
} from "lucide-react";

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Files Uploaded</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questions Asked</p>
              <h3 className="text-2xl font-bold">156</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HardDrive className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <h3 className="text-2xl font-bold">2.4 GB</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          <Button className="flex-1" variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Ask a Question
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Uploaded "Q4 Financial Report.pdf"</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Referral Banner */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Invite a Friend</h3>
            <p className="text-muted-foreground">Get 100 questions free when they join!</p>
          </div>
          <Button>Share Invite Link</Button>
        </div>
      </Card>
    </div>
  );
} 