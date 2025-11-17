
import type { User, Bill, Role, BillItem, BillStatus } from "./types";
import { numberToWords } from "./utils";

// This is a hack to preserve data across Next.js hot reloads in development.
// In a real app, you'd use a database.
declare global {
  // eslint-disable-next-line no-var
  var __users: User[] | undefined;
  // eslint-disable-next-line no-var
  var __bills: Bill[] | undefined;
}

const initialUsers: User[] = [
  { id: "user-1", name: "Alice Employee", email: "alice@example.com", role: "employee", supervisorId: "user-2", designation: "Software Engineer" },
  { id: "user-2", name: "Bob Supervisor", email: "bob@example.com", role: "supervisor", designation: "Engineering Manager" },
  { id: "user-3", name: "Charlie Accounts", email: "charlie@example.com", role: "accounts", designation: "Accountant" },
  { id: "user-4", name: "Diana Management", email: "diana@example.com", role: "management", designation: "CEO" },
  { id: "user-5", name: "Eve Employee", email: "eve@example.com", role: "employee", supervisorId: "user-2", designation: "QA Engineer" },
];

const initialBills: Bill[] = [
  {
    id: "bill-1",
    companyName: "Client Corp",
    companyAddress: "123 Tech Avenue, Silicon Valley",
    employeeId: "user-1",
    amount: 150.75,
    amountInWords: "One Hundred Fifty Dollars and Seventy-Five Cents Only",
    items: [
        { id: "item-1", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), from: "Office", to: "Client Site A", transport: "Ride Share", purpose: "Client meeting", amount: 150.75 }
    ],
    status: "SUBMITTED",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      { status: "SUBMITTED", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), actorId: "user-1" }
    ]
  },
  {
    id: "bill-2",
    companyName: "Supplier Inc.",
    companyAddress: "456 Commerce Blvd, Business City",
    employeeId: "user-5",
    amount: 85.00,
    amountInWords: "Eighty-Five Dollars Only",
     items: [
        { id: "item-2", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), from: "Store", to: "Office", transport: "Rickshaw", purpose: "Office supplies purchase", amount: 85.00 }
    ],
    status: "APPROVED_BY_SUPERVISOR",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
        { status: "SUBMITTED", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), actorId: "user-5" },
        { status: "APPROVED_BY_SUPERVISOR", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), actorId: "user-2" }
    ]
  },
  {
    id: "bill-3",
    companyName: "Partner Co.",
    companyAddress: "789 Partnership Plaza, Collaboration Town",
    employeeId: "user-1",
    amount: 220.50,
    amountInWords: "Two Hundred Twenty Dollars and Fifty Cents Only",
     items: [
        { id: "item-3", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), from: "Restaurant", to: "Office", transport: "Car", purpose: "Team lunch", amount: 220.50 }
    ],
    status: "REJECTED_BY_SUPERVISOR",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
        { status: "SUBMITTED", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), actorId: "user-1" },
        { status: "REJECTED_BY_SUPERVISOR", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), actorId: "user-2", comment: "Please provide an itemized receipt." }
    ]
  },
];

let users: User[];
let bills: Bill[];

// Initialize mock data on the global object if it doesn't exist.
if (process.env.NODE_ENV === "production") {
  users = initialUsers;
  bills = initialBills;
} else {
  if (!global.__users) {
    global.__users = initialUsers;
  }
  if (!global.__bills) {
    global.__bills = initialBills;
  }
  users = global.__users;
  bills = global.__bills;
}


// Mock API functions
export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  return users.find((user) => user.email === email);
};

export const findUserById = async (id: string): Promise<User | undefined> => {
    return users.find((user) => user.id === id);
};

export const getUsers = async (role?: Role): Promise<User[]> => {
    if (role) {
        return users.filter(user => user.role === role);
    }
    return users;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = { id: `user-${Date.now()}`, ...userData };
    users.push(newUser);
    return newUser;
};

export const getBills = async (): Promise<Bill[]> => {
    return bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getBillById = async (id: string): Promise<Bill | undefined> => {
    return bills.find(bill => bill.id === id);
}

export const createBill = async (billData: Omit<Bill, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'history'>, creatorRole: Role): Promise<Bill> => {
    const isSupervisor = creatorRole === 'supervisor';
    const initialStatus: BillStatus = isSupervisor ? 'APPROVED_BY_SUPERVISOR' : 'SUBMITTED';

    const history: Bill['history'] = [{ status: 'SUBMITTED', timestamp: new Date().toISOString(), actorId: billData.employeeId }];

    if (isSupervisor) {
        history.push({
            status: 'APPROVED_BY_SUPERVISOR',
            timestamp: new Date().toISOString(),
            actorId: billData.employeeId,
            comment: "Auto-approved for supervisor"
        });
    }

    const newBill: Bill = {
        id: `bill-${Date.now()}`,
        ...billData,
        status: initialStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history
    };
    bills.push(newBill);
    return newBill;
}

export const updateBillStatus = async (billId: string, newStatus: Bill['status'], actorId: string, comment?: string): Promise<Bill | undefined> => {
    const billIndex = bills.findIndex(b => b.id === billId);
    if (billIndex === -1) return undefined;

    const updatedBill: Bill = {
        ...bills[billIndex],
        status: newStatus,
        updatedAt: new Date().toISOString(),
        history: [
            ...bills[billIndex].history,
            { status: newStatus, timestamp: new Date().toISOString(), actorId, comment }
        ]
    };
    bills[billIndex] = updatedBill;
    return updatedBill;
}
