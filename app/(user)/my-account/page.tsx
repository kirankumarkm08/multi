"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthStorage } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut } from "lucide-react";

export default function MyAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!AuthStorage.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get user data
    const { user: userData } = AuthStorage.getAuth();
    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    AuthStorage.clearAuth();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">My Account</CardTitle>
            <User className="h-6 w-6 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-gray-500">Name</span>
                <span className="text-lg font-medium">{user?.name || "N/A"}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-lg font-medium">{user?.email || "N/A"}</span>
              </div>

              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
