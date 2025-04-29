"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Key, 
  Smartphone,
  LogOut,
  Copy
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"

export function SecurityTab() {
  const { handleLogout } = useAuth()

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>
            <Key className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch />
        </div>
      </Card>

      {/* API Key */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">API Key</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your API Key</Label>
            <div className="flex gap-2">
              <Input 
                value="sk_test_1234567890abcdef" 
                readOnly 
                className="font-mono"
              />
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep this key secure. Never share it publicly.
            </p>
          </div>
          <Button variant="outline">
            <Key className="h-4 w-4 mr-2" />
            Generate New Key
          </Button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout All Devices
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Chrome on Windows</p>
                  <p className="text-sm text-muted-foreground">Last active: 2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Logout</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 