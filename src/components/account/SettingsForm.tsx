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
  supervisorId: z.string().optional(), // empty string = clear
});

type FormValues = z.infer<typeof schema>;

type Supervisor = { id: string; name: string; email: string };

export default function SettingsForm({
  user,
  role,
  supervisors,
}: {
  user: { id: string; name: string; email: string; supervisorId?: string | null };
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
      supervisorId: user.supervisorId ?? "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("supervisorId", values.supervisorId ?? "");
      formAction(fd);
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Update your basic info. Employees can also set their supervisor.
        </p>

        <Separator className="my-4" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          {role === "employee" && (
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="supervisorId">Supervisor</label>
              <select
                id="supervisorId"
                className="h-9 rounded-md border bg-background px-3 text-sm"
                {...form.register("supervisorId")}
              >
                <option value="">— None —</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              {form.formState.errors.supervisorId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.supervisorId.message as string}
                </p>
              )}
            </div>
          )}

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert>
              <AlertDescription>Profile updated successfully.</AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
