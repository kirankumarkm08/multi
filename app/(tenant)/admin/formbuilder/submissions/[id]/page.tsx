"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tenantApi } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // assuming you have this context for token

const Page = () => {
  const params = useParams();
  const submissionId = Number(params.id);
  const { token } = useAuth(); // or wherever your token is stored

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId || !token) {
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await tenantApi.getSubmissions(token, submissionId);
        console.log("submissions response:", res);
        setData(res?.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [submissionId, token]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading submissions...
      </div>
    );

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No submission data found.
      </div>
    );
  }

  const { form, statistics, submissions = [] } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        <Badge variant="outline">{form?.name || "Unknown Form"}</Badge>
      </div>

      {/* Form Info */}
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Form ID</p>
              <p className="font-medium">{form?.form_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Slug</p>
              <p className="font-medium">{form?.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{form?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Submissions</p>
            <p className="text-lg font-semibold">
              {statistics?.total_submissions}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unique Submitters</p>
            <p className="text-lg font-semibold">
              {statistics?.unique_submitters}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Count</p>
            <p className="text-lg font-semibold">{statistics?.current_count}</p>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No submissions yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub: any) => (
                  <TableRow key={sub.form_submission_id}>
                    <TableCell>{sub.form_submission_id}</TableCell>
                    <TableCell>{sub.submission_identifier}</TableCell>
                    <TableCell>{sub.ip_address}</TableCell>
                    <TableCell>{sub.submitted_at}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sub.field_breakdown?.map(
                          (field: any, index: number) => (
                            <div key={index} className="text-sm">
                              <span className="font-semibold">
                                {field.field_label}:
                              </span>{" "}
                              {String(field.value)}
                            </div>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
