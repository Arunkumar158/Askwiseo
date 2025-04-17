"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  User,
  Lock,
  FileText,
  CreditCard,
  Settings,
  Download,
  Trash2,
  Moon,
  Sun,
  Send,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [betaAssistant, setBetaAssistant] = useState(false);
  const [autoTagging, setAutoTagging] = useState(true);
  const [aiSummaries, setAiSummaries] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [googleDrive, setGoogleDrive] = useState(false);
  const [slack, setSlack] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

      {/* Account Info */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Your Name"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <Input
            type="email"
            placeholder="Email"
            className="bg-gray-800 border-gray-700 text-white"
          />
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Dark Mode</span>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Settings */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5" />
            Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-white">Storage Usage</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full w-[40%]"></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">4/10 PDFs used</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Auto-tagging</span>
            <Switch
              checked={autoTagging}
              onCheckedChange={setAutoTagging}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">AI-powered summaries</span>
            <Switch
              checked={aiSummaries}
              onCheckedChange={setAiSummaries}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lock className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Two-Factor Authentication</span>
            <Switch
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Activity Logs
          </Button>
          <Button variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear My Data
          </Button>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Google Drive</span>
            <Switch
              checked={googleDrive}
              onCheckedChange={setGoogleDrive}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Slack</span>
            <Switch
              checked={slack}
              onCheckedChange={setSlack}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-white mb-2">API Key (Pro Only)</p>
            <Input
              type="password"
              value="••••••••••••••••"
              className="bg-gray-700 border-gray-600 text-white"
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-white font-medium">Current Plan: Pro</p>
            <p className="text-sm text-gray-400">$29/month</p>
          </div>
          <Button variant="outline" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Change Payment Method
          </Button>
          <div className="space-y-2">
            <p className="text-white font-medium">Recent Invoices</p>
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-white">Invoice #1234 - $29.00</p>
              <p className="text-sm text-gray-400">March 1, 2024</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              Cancel Plan
            </Button>
            <Button className="flex-1">
              Upgrade to Enterprise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beta Features */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plus className="w-5 h-5" />
            Beta Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Askwiseo Assistant (Beta)</span>
            <Switch
              checked={betaAssistant}
              onCheckedChange={setBetaAssistant}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          <Textarea
            placeholder="Share your feedback on beta features..."
            className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Support & Feedback */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <HelpCircle className="w-5 h-5" />
            Support & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Help Center
          </Button>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Submit Feature Request
            </Button>
            <Button variant="outline" className="w-full">
              Report a Bug
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 md:hidden">
        <Button className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  );
} 