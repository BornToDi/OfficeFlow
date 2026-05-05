"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/lib/actions";
import type { Role } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email."),
  designation: z.string().optional(),
  department: z.string().optional(),
  supervisorId: z.string().optional(), // empty string = clear
});

type FormValues = z.infer<typeof schema>;

type Supervisor = { id: string; name: string; email: string };

export default function SettingsForm({
  user,
  role,
  supervisors,
}: {
  user: { id: string; name: string; email: string; designation?: string | null; department?: string | null; supervisorId?: string | null };
  role: Role;
  supervisors: Supervisor[];
}) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      designation: user.designation ?? "",
      department: user.department ?? "",
      supervisorId: user.supervisorId ?? "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("designation", values.designation ?? "");
      fd.append("department", values.department ?? "");
      fd.append("supervisorId", values.supervisorId ?? "");
      formAction(fd);
    });
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Update your basic info. Employees can also set their supervisor.
        </p>

        <Separator className="my-5" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="name">Full Name</label>
            <Input id="name" placeholder="Your full name" {...form.register("name")} className="border-slate-300 focus-visible:ring-blue-400" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
            <Input id="email" type="email" placeholder="your.email@company.com" {...form.register("email")} className="border-slate-300 focus-visible:ring-blue-400" />
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="designation">Designation</label>
            <Input id="designation" placeholder="e.g. Senior Engineer" {...form.register("designation")} className="border-slate-300 focus-visible:ring-blue-400" />
            {form.formState.errors.designation && (
              <p className="text-xs text-red-600">{form.formState.errors.designation.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="department">Department</label>
            <Input id="department" placeholder="e.g. Engineering, Sales, HR" {...form.register("department")} className="border-slate-300 focus-visible:ring-blue-400" />
            {form.formState.errors.department && (
              <p className="text-xs text-red-600">{form.formState.errors.department.message}</p>
            )}
          </div>

          {role === "employee" && (
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="supervisorId">Supervisor</label>
              <select
                id="supervisorId"
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
                {...form.register("supervisorId")}
              >
                <option value="">— Choose supervisor —</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              {form.formState.errors.supervisorId && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.supervisorId.message as string}
                </p>
              )}
            </div>
          )}

          {state?.error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription className="text-green-800">
                {(state as any)?.message || "Profile updated successfully."}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
