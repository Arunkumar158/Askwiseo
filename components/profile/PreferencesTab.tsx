"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      {/* Display Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Display Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Default View</Label>
              <p className="text-sm text-muted-foreground">
                Choose how your documents are displayed
              </p>
            </div>
            <Select defaultValue="grid">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your account
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Document Processing Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your documents are processed
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* AI Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">AI Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Get AI-powered suggestions while asking questions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Beta Features</Label>
              <p className="text-sm text-muted-foreground">
                Access experimental AI features
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
    </div>
  );
} 