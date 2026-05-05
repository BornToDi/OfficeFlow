"use client";

import * as React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SupervisorChangeRequest {
  id: string;
  status: string;
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
  createdAt: string;
  approvedAt: string | null;
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  reason?: string | null;
}

interface SupervisorChangeRequestStatusProps {
  request?: SupervisorChangeRequest | null;
}

export default function SupervisorChangeRequestStatus({
  request,
}: SupervisorChangeRequestStatusProps) {
  if (!request) return null;

  const isPending = request.status === "PENDING";
  const isApproved = request.status === "APPROVED";
  const isRejected = request.status === "REJECTED";

  const statusConfig = {
    PENDING: {
      icon: Clock,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      title: "Pending Approval",
      color: "text-yellow-900",
      description: "Your supervisor change request is waiting for approval from your current supervisor.",
    },
    APPROVED: {
      icon: CheckCircle,
      bg: "bg-green-50",
      border: "border-green-200",
      title: "Approved",
      color: "text-green-900",
      description: "Your supervisor change has been approved and is now active.",
    },
    REJECTED: {
      icon: XCircle,
      bg: "bg-red-50",
      border: "border-red-200",
      title: "Rejected",
      color: "text-red-900",
      description: "Your supervisor change request was rejected.",
    },
  };

  const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Alert className={`${config.bg} border ${config.border}`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
          <p className={`text-sm ${config.color} mt-1`}>{config.description}</p>

          <div className="mt-3 text-sm space-y-1">
            <div>
              <span className="font-medium">Current Supervisor:</span>{" "}
              {request.currentSupervisor?.name || "Unassigned"}
            </div>
            <div>
              <span className="font-medium">Requested Supervisor:</span> {request.newSupervisor.name}
            </div>
            <div>
              <span className="font-medium">Requested on:</span>{" "}
              {new Date(request.createdAt).toLocaleDateString()}
            </div>

            {request.approvedAt && request.approvedBy && (
              <div>
                <span className="font-medium">
                  {isApproved ? "Approved" : "Rejected"} by:
                </span>{" "}
                {request.approvedBy.name} on {new Date(request.approvedAt).toLocaleDateString()}
              </div>
            )}

            {isRejected && request.reason && (
              <div>
                <span className="font-medium">Reason:</span> {request.reason}
              </div>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}
