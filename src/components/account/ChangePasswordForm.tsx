"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LockKeyhole } from "lucide-react";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(4, "New password must be at least 4 characters."),
  confirmPassword: z.string().min(1, "Confirm your new password."),
});

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      const fd = new FormData();
      fd.append("currentPassword", values.currentPassword);
      fd.append("newPassword", values.newPassword);
      fd.append("confirmPassword", values.confirmPassword);
      formAction(fd);
      form.reset();
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Password & security</h2>
          <p className="mt-0.5 text-sm text-slate-500">Use your current password to set a new one.</p>
        </div>
      </div>

        <Separator />

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 sm:p-6">
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="currentPassword">Current password</label>
            <Input id="currentPassword" type="password" placeholder="••••••••" {...form.register("currentPassword")} className="border-slate-300 focus-visible:ring-amber-400" />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.currentPassword.message as string}</p>
            )}
          </div>

          <div className="grid gap-2 sm:col-start-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="newPassword">New password</label>
            <Input id="newPassword" type="password" placeholder="••••••••" {...form.register("newPassword")} className="border-slate-300 focus-visible:ring-amber-400" />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.newPassword.message as string}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm new password</label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...form.register("confirmPassword")} className="border-slate-300 focus-visible:ring-amber-400" />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.confirmPassword.message as string}</p>
            )}
          </div>
          </div>

          {state?.error && (
            <Alert variant="destructive" className="mt-5 border-red-300 bg-red-50">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert className="mt-5 border-green-300 bg-green-50">
              <AlertDescription className="text-green-800">Password changed successfully.</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
    </section>
  );
}
