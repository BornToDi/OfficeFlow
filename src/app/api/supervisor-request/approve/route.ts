import { getSession } from "@/lib/actions";
import { approveSupervisorChangeRequest } from "@/lib/repo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only supervisors can approve
    if (session.user.role !== "supervisor") {
      return NextResponse.json(
        { error: "Only supervisors can approve supervisor change requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const approvedRequest = await approveSupervisorChangeRequest(
      requestId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: `Supervisor change request approved for ${approvedRequest.employee.name}`,
      request: approvedRequest,
    });
  } catch (error: any) {
    console.error("Error approving request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve request" },
      { status: 400 }
    );
  }
}
