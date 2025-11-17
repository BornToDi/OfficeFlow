"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { register as registerAction } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Supervisor = {
  id: string;
  name: string;
  email: string;
  employeeCode?: string | null;
};

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["employee", "supervisor", "accounts", "management"], {
      required_error: "Pick a role",
    }),
    designation: z.string().optional(),
    employeeCode: z.string().optional(),
    supervisorId: z.string().optional(),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(4, "Confirm your password"),
  })
  .superRefine((val, ctx) => {
    // Employees & Supervisors must provide designation + employeeCode
    if (val.role === "employee" || val.role === "supervisor") {
      if (!val.designation || val.designation.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Designation is required",
          path: ["designation"],
        });
      }
      if (!val.employeeCode || val.employeeCode.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee Code is required",
          path: ["employeeCode"],
        });
      }
    }

    // Employees MUST pick a supervisor (supervisors may optionally pick one)
    if (val.role === "employee") {
      if (!val.supervisorId || val.supervisorId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supervisor is required for employees",
          path: ["supervisorId"],
        });
      }
    }

    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export function RegistrationForm({ supervisors }: { supervisors: Supervisor[] }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "employee",
      designation: "",
      employeeCode: "",
      supervisorId: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const role = form.watch("role");
  const employeeCodeWatch = (form.watch("employeeCode") || "").toUpperCase();

  const [state, formAction, isPending] = useActionState(registerAction, undefined);
  const [pending, startTransition] = React.useTransition();
  const disabled = isPending || pending;

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("email", values.email.toLowerCase());
    fd.append("role", values.role);
    fd.append("designation", values.designation ?? "");
    // Ensure UPPERCASE is sent to the server
    fd.append("employeeCode", (values.employeeCode ?? "").toUpperCase());
    fd.append("supervisorId", values.supervisorId ?? "");
    fd.append("password", values.password);
    fd.append("confirmPassword", values.confirmPassword);
    startTransition(() => formAction(fd));
  };

  const showEmployeeFields = role === "employee" || role === "supervisor";
  const showSupervisorSelect = role === "employee" || role === "supervisor";

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
      <p className="mb-4 text-sm text-muted-foreground">Fill the details below.</p>

      {state?.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Registration failed</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Mahin Rahman"
            disabled={disabled}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            disabled={disabled}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={role}
            onValueChange={(v) => {
              form.setValue("role", v as any, { shouldValidate: true });
              if (v !== "employee") form.setValue("supervisorId", "");
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.role && (
            <p className="text-xs text-red-600">{form.formState.errors.role.message}</p>
          )}
        </div>

        {/* Extra fields for Employee/Supervisor */}
        {showEmployeeFields && (
          <>
            <Separator />

            {/* Designation */}
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                placeholder="e.g. Senior Engineer"
                disabled={disabled}
                {...form.register("designation")}
              />
              {form.formState.errors.designation && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.designation.message}
                </p>
              )}
            </div>

            {/* Employee Code (forced uppercase + live preview) */}
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <Input
                id="employeeCode"
                placeholder="e.g. EMP-123"
                disabled={disabled}
                {...form.register("employeeCode", {
                  onChange: (e) => {
                    const val = String(e.target.value || "").toUpperCase();
                    form.setValue("employeeCode", val, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                  onBlur: () => {
                    const val = (form.getValues("employeeCode") || "").toUpperCase();
                    form.setValue("employeeCode", val, { shouldValidate: true });
                  },
                })}
              />
              <p className="text-xs text-muted-foreground">
                This will be saved as:{" "}
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">
                  {employeeCodeWatch || "—"}
                </span>
              </p>
              {form.formState.errors.employeeCode && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.employeeCode.message}
                </p>
              )}
            </div>

            {/* Supervisor selection: required for Employee, optional for Supervisor */}
            {showSupervisorSelect && (
              <div className="space-y-2">
                <Label htmlFor="supervisorId">
                  Supervisor {role === "employee" ? <span className="text-red-500">*</span> : null}
                </Label>
                <Select
                  value={form.watch("supervisorId") || ""}
                  onValueChange={(v) =>
                    form.setValue("supervisorId", v, { shouldValidate: true })
                  }
                  disabled={disabled || supervisors.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        supervisors.length ? "Select supervisor" : "No supervisors available"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.supervisorId && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.supervisorId.message}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={disabled}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={disabled}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-600">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button className="w-full bg-accent hover:bg-accent/90" type="submit" disabled={disabled}>
          {disabled ? "Creating..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}
