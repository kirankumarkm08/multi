import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="text-center p-8">
          <div className="text-8xl font-bold text-gray-300 dark:text-gray-600 mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="w-full">
            <Link href="/">
              Go Back Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}