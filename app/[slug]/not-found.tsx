import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full border-none shadow-none bg-transparent">
        <CardContent className="text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FileQuestion className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full h-12 text-base" size="lg">
              <Link href="/">
                Return Home
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/contact-us">
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
