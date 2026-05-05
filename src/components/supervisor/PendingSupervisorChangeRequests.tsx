"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface SupervisorChangeRequest {
  id: string;
  employee: {
    id: string;
    name: string;
    email: string;
    employeeCode: string | null;
  };
  currentSupervisor: {
    id: string;
    name: string;
    email: string;
  } | null;
  newSupervisor: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

interface PendingSupervisorChangeRequestsProps {
  requests: SupervisorChangeRequest[];
}

export default function PendingSupervisorChangeRequests({
  requests,
}: PendingSupervisorChangeRequestsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localRequests, setLocalRequests] = useState(requests);

  const handleApprove = async (requestId: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/supervisor-request/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve request");
      }

      setMessage({ type: "success", text: data.message });
      setLocalRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to approve request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Optional reason for rejection:");

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/supervisor-request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, reason: reason || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject request");
      }

      setMessage({ type: "success", text: data.message });
      setLocalRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to reject request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (localRequests.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-start gap-3">
        <Clock className="mt-1 h-5 w-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            Pending Supervisor Change Requests
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Your employees have requested to change their supervisor. Please review and approve or
            reject these requests.
          </p>

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className="mb-4"
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {localRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-blue-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Employee: <span className="text-blue-600">{request.employee.name}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Email: {request.employee.email}
                        {request.employee.employeeCode && (
                          <> • Code: {request.employee.employeeCode}</>
                        )}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Current Supervisor</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        {request.currentSupervisor?.name || "Unassigned"}
                      </p>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-slate-400 text-lg">→</div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 font-medium">Requested Supervisor</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        {request.newSupervisor.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(request.id)}
                    disabled={isLoading}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request.id)}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
