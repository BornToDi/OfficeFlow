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
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
        <p className="mt-1 text-sm text-slate-600">Update your account password. Current password required for security.</p>

        <Separator className="my-5" />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="currentPassword">Current Password</label>
            <Input id="currentPassword" type="password" placeholder="••••••••" {...form.register("currentPassword")} className="border-slate-300 focus-visible:ring-amber-400" />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.currentPassword.message as string}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="newPassword">New Password</label>
            <Input id="newPassword" type="password" placeholder="••••••••" {...form.register("newPassword")} className="border-slate-300 focus-visible:ring-amber-400" />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.newPassword.message as string}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">Confirm New Password</label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...form.register("confirmPassword")} className="border-slate-300 focus-visible:ring-amber-400" />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.confirmPassword.message as string}</p>
            )}
          </div>

          {state?.error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription className="text-green-800">Password changed successfully.</AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700">
              {isPending ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
