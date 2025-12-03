import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CreateEventHeaderProps {
  iconColor: string;
  valueColor: string;
}

export function CreateEventHeader({
  iconColor,
  valueColor,
}: CreateEventHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/admin/events" passHref>
          <Button variant="ghost" size="sm" className={iconColor} asChild>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </a>
          </Button>
        </Link>
        <div>
          <h1 className={`text-2xl font-bold ${valueColor}`}>
            Create New Event
          </h1>
          <p className={iconColor}>Fill in all the event details</p>
        </div>
      </div>
    </CardHeader>
  );
}
