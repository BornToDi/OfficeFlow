import { getSession } from "@/lib/actions";
import { rejectSupervisorChangeRequest } from "@/lib/repo";
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

    // Only supervisors can reject
    if (session.user.role !== "supervisor") {
      return NextResponse.json(
        { error: "Only supervisors can reject supervisor change requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, reason } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const rejectedRequest = await rejectSupervisorChangeRequest(
      requestId,
      session.user.id,
      reason
    );

    return NextResponse.json({
      success: true,
      message: `Supervisor change request rejected for ${rejectedRequest.employee.name}`,
      request: rejectedRequest,
    });
  } catch (error: any) {
    console.error("Error rejecting request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject request" },
      { status: 400 }
    );
  }
}
