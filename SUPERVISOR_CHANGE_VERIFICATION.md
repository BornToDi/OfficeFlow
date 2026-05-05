# Supervisor Change Verification Workflow

## Overview

A comprehensive verification system has been implemented to handle supervisor changes for employees. When an employee wants to change their supervisor, the current supervisor must approve the request before the change takes effect.

## How It Works

### 1. **Employee Initiates Change**

- Employee goes to **Settings** → **Profile Settings**
- Selects a new supervisor from the dropdown
- Clicks "Save Changes"
- **Status**: A request is created with status `PENDING` (not immediately updated)
- **Feedback**: Employee sees message "Profile updated. Supervisor change request sent for approval."

### 2. **Current Supervisor Reviews**

- Current supervisor logs into the dashboard
- At the top of the **Supervisor Dashboard**, they see "Pending Supervisor Change Requests" section
- The request shows:
  - Employee name
  - Current supervisor (their name)
  - Arrow (→)
  - Requested new supervisor
  - Date the request was made

### 3. **Supervisor Actions**

Two options:

#### **Approve**

- Click **"Approve"** button
- The employee's supervisor is immediately changed to the new supervisor
- Status changes to `APPROVED`
- Request is removed from pending list

#### **Reject**

- Click **"Reject"** button
- Optional: Provide a reason for rejection
- Status changes to `REJECTED`
- Employee is notified on their settings page with the reason (if provided)
- Request is removed from pending list

### 4. **Employee Sees Status**

- On Settings page, employee sees a status alert showing:
  - If `PENDING`: "Your supervisor change request is waiting for approval"
  - If `APPROVED`: "Your supervisor change has been approved and is now active"
  - If `REJECTED`: "Your supervisor change request was rejected" + optional reason
  - Dates and supervisor names involved

## Database Schema

### New Model: `SupervisorChangeRequest`

```prisma
model SupervisorChangeRequest {
  id                    String                   @id @default(cuid())
  employee              User                     @relation("EmployeeSupervisorChangeRequests", ...)
  employeeId            String
  currentSupervisor     User?                    @relation("CurrentSupervisorChangeRequests", ...)
  currentSupervisorId   String?
  newSupervisor         User                     @relation("NewSupervisorChangeRequests", ...)
  newSupervisorId       String
  status                SupervisorChangeStatus  @default(PENDING)  // PENDING | APPROVED | REJECTED
  reason                String?                 // Optional reason for rejection
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  approvedAt            DateTime?               // When action was taken
  approvedBy            User?                   @relation("ApprovedByUser", ...)
  approvedById          String?
}

enum SupervisorChangeStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### User Model Updates

Added relations to support supervisor change requests:

- `supervisorChangeRequests`: Requests created by this employee
- `currentSupervisorRequests`: Requests where user is current supervisor
- `newSupervisorRequests`: Requests where user is the new supervisor
- `approvedSupervisorChangeRequests`: Requests approved by this user

## Components Created

### 1. **PendingSupervisorChangeRequests.tsx**

- Displays pending requests for supervisors
- Shows employee details and supervisor change info
- Approve/Reject buttons with client-side API calls
- Handles success/error messages
- Auto-removes processed requests from list

### 2. **SupervisorChangeRequestStatus.tsx**

- Shows status of a supervisor change request to employees
- Color-coded alerts (yellow=pending, green=approved, red=rejected)
- Displays all relevant details: current supervisor, new supervisor, dates, reason

## API Endpoints

### `POST /api/supervisor-request/approve`

- **Auth**: Requires supervisor role
- **Body**: `{ requestId: string }`
- **Action**: Approves request, updates employee's supervisor
- **Returns**: Success message and updated request details

### `POST /api/supervisor-request/reject`

- **Auth**: Requires supervisor role
- **Body**: `{ requestId: string, reason?: string }`
- **Action**: Rejects request, stores optional reason
- **Returns**: Success message and updated request details

## Key Functions (repo.ts)

```typescript
// Create a change request
createSupervisorChangeRequest(employeeId: string, newSupervisorId: string)

// Get pending requests for a supervisor
getPendingSupervisorChangeRequests(supervisorId: string)

// Approve a request
approveSupervisorChangeRequest(requestId: string, supervisorId: string)

// Reject a request
rejectSupervisorChangeRequest(requestId: string, supervisorId: string, reason?: string)

// Get history for an employee
getSupervisorChangeRequestHistory(employeeId: string)
```

## Modified Files

1. **prisma/schema.prisma** - Added SupervisorChangeRequest model
2. **src/lib/repo.ts** - Added all supervisor change request functions
3. **src/lib/actions.ts** - Updated updateProfile to create requests instead of direct updates
4. **src/app/dashboard/page.tsx** - Fetch and pass pending requests to supervisor dashboard
5. **src/components/dashboard/supervisor-dashboard.tsx** - Display pending requests component
6. **src/app/settings/page.tsx** - Show supervisor change request status to employees
7. **src/components/account/SettingsForm.tsx** - Update success message to show request info

## New Files

1. **src/app/api/supervisor-request/approve/route.ts** - Approve endpoint
2. **src/app/api/supervisor-request/reject/route.ts** - Reject endpoint
3. **src/components/supervisor/PendingSupervisorChangeRequests.tsx** - UI component
4. **src/components/supervisor/SupervisorChangeRequestStatus.tsx** - Status component

## Example Workflow

**Scenario**: Employee Rahim wants to change from supervisor Karim to supervisor Abdul

1. Rahim goes to Settings → Supervisor dropdown
2. Rahim selects "Abdul" and clicks Save
3. System creates a `SupervisorChangeRequest` with:
   - employeeId: Rahim's ID
   - currentSupervisorId: Karim's ID
   - newSupervisorId: Abdul's ID
   - status: PENDING
4. Rahim sees: "Profile updated. Supervisor change request sent for approval."
5. Karim logs in and sees pending request on his dashboard
6. Karim reviews and clicks either "Approve" or "Reject"
7. If Approved: Rahim's supervisor becomes Abdul immediately
8. Rahim's settings page shows: "Approved by Karim on [date]"

## Error Handling

- Cannot create duplicate pending requests for the same employee
- Only current supervisor can approve/reject
- Validation ensures new supervisor exists and is a supervisor role
- Comprehensive error messages for all failure scenarios
