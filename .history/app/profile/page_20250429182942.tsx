"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading, handleLogout } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Email</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Account Created</h3>
              <p className="text-muted-foreground">
                {new Date(user.metadata.creationTime!).toLocaleDateString()}
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 