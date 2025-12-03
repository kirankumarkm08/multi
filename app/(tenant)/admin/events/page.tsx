"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, MapPin, Clock, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { eventService } from "@/services/event.service";
import { Event } from "@/types/event";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {toast} from "sonner"

export default function EventsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iconColor = "text-gray-600 dark:text-gray-400";
  const valueColor = "text-blue-400 dark:text-blue-300";

  useEffect(() => {
    if (!token) {
      router.push("/admin-login");
      return;
    }
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setError(err?.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventService.deleteEvent(id);
      await fetchEvents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete event");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };


  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="dark:bg-gray-800 rounded-2xl p-6 border border-gray-800 dark:border-gray-700 hover:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 shadow-lg max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className={`text-2xl font-bold ${valueColor}`}>Events Management</h1>
                <p className={iconColor}>Manage your events</p>
              </div>
            </div>
            <Link href="/admin/events/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              <p className="text-center">{error}</p>
              <div className="text-center mt-4">
                <Button onClick={fetchEvents} variant="outline">
                  Retry
                </Button>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className={`mx-auto h-12 w-12 ${iconColor} mb-4`} />
              <h3 className={`text-lg font-semibold ${valueColor} mb-2`}>
                No events yet
              </h3>
              <p className={`${iconColor} mb-4`}>
                Create your first event to get started.
              </p>
              <Link href="/admin/events/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className={`text-lg font-semibold ${valueColor}`}>All Events</h3>
                <p className={iconColor}>Manage and view all your events</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className={iconColor}>Event</TableHead>
                    <TableHead className={iconColor}>Date & Time</TableHead>
                    <TableHead className={iconColor}>Location</TableHead>
                    <TableHead className={iconColor}>Status</TableHead>
                    <TableHead className={iconColor}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell>
                        <div>
                          <div className={`font-medium ${valueColor}`}>
                            {event.event_name}
                          </div>
                          <div className={`text-sm ${iconColor} truncate max-w-xs`}>
                            {event.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-1 text-sm ${valueColor}`}>
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${iconColor}`}>
                          <Clock className="h-4 w-4" />
                          <span>{new Date(event.start_date).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-1 text-sm ${valueColor}`}>
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-xs">
                            {event.venue_name}, {event.venue_city}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                            className={`${iconColor} hover:${valueColor}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => event.id && handleDelete(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
