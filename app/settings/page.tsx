"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User as UserIcon,
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
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { 
  updateProfile, 
  updatePassword, 
  deleteUser, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Types
interface StorageUsage {
  used: number;
  total: number;
  unit: string;
}

interface Invoice {
  id: string;
  amount: number;
  date: string;
}

export default function SettingsPage() {
  const { user, logOut } = useAuth();
  const { documents, formatFileSize } = useDocuments();
  const router = useRouter();

  // State with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return true;
  });
  const [betaAssistant, setBetaAssistant] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('betaAssistant') === 'true';
    }
    return false;
  });
  const [autoTagging, setAutoTagging] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoTagging') === 'true';
    }
    return true;
  });
  const [aiSummaries, setAiSummaries] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiSummaries') === 'true';
    }
    return true;
  });
  const [twoFactor, setTwoFactor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('twoFactor') === 'true';
    }
    return false;
  });
  const [googleDrive, setGoogleDrive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('googleDrive') === 'true';
    }
    return false;
  });
  const [slack, setSlack] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('slack') === 'true';
    }
    return false;
  });

  // Form states
  const [name, setName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('••••••••••••••••');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync name when user object is loaded
  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
  }, [user]);

  // Real data calculations
  const totalUsedSize = documents.reduce((acc, doc) => acc + (doc.file_size_bytes || 0), 0);
  const storageUsage = {
    used: documents.length,
    total: 10, // Example limit, could be dynamic
    unit: 'PDFs',
    sizeUsed: formatFileSize(totalUsedSize)
  };

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('betaAssistant', betaAssistant.toString());
  }, [betaAssistant]);

  useEffect(() => {
    localStorage.setItem('autoTagging', autoTagging.toString());
  }, [autoTagging]);

  useEffect(() => {
    localStorage.setItem('aiSummaries', aiSummaries.toString());
  }, [aiSummaries]);

  useEffect(() => {
    localStorage.setItem('twoFactor', twoFactor.toString());
  }, [twoFactor]);

  useEffect(() => {
    localStorage.setItem('googleDrive', googleDrive.toString());
  }, [googleDrive]);

  useEffect(() => {
    localStorage.setItem('slack', slack.toString());
  }, [slack]);

  // Integration handlers
  const handleGoogleDriveToggle = () => {
    setGoogleDrive(!googleDrive);
    // Mock integration logic
    console.log('Google Drive integration:', !googleDrive ? 'enabled' : 'disabled');
  };

  const handleSlackToggle = () => {
    setSlack(!slack);
    // Mock integration logic
    console.log('Slack integration:', !slack ? 'enabled' : 'disabled');
  };

  // Real Auth Handlers
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: name });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully");
      setShowChangePasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || "Failed to update password. Check your current password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    
    try {
      const credential = EmailAuthProvider.credential(user.email, deleteConfirmPassword);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account. Check your password.");
    }
  };

  // Confirmation dialogs
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

      <div className="space-y-6 md:space-y-8">
        {/* Account Info */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Account Information
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-800">
                {user?.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    width={80} 
                    height={80} 
                    className="object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <Input
                  placeholder="Your Name"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving || name === user?.displayName}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
            <Input
              type="email"
              placeholder="Email"
              className="bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
              value={user?.email || ''}
              disabled
              readOnly
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Change Password</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter your current and new password to update.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      type="password"
                      placeholder="Current Password"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Delete Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      This action cannot be undone. All your data will be permanently deleted. 
                      Please enter your password to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      type="password"
                      placeholder="Your Password"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={deleteConfirmPassword}
                      onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((storageUsage.used / storageUsage.total) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-400">
                  {storageUsage.used} / {storageUsage.total} {storageUsage.unit} used
                </p>
                <p className="text-sm font-medium text-blue-400">
                  {storageUsage.sizeUsed}
                </p>
              </div>
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
            <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear My Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Clear Data</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    This will permanently delete all your data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowClearDataDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive">Clear Data</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                onCheckedChange={handleGoogleDriveToggle}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Slack</span>
              <Switch
                checked={slack}
                onCheckedChange={handleSlackToggle}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-white mb-2">API Key (Pro Only)</p>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  disabled
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-800 border-dashed text-center">
                <p className="text-sm text-gray-500 italic">Billing integration is coming soon</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
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
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
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
      </div>

      {/* Mobile Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 md:hidden z-50">
        <Button 
          className="w-full" 
          onClick={handleSaveProfile}
          disabled={isSaving || name === user?.displayName}
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}