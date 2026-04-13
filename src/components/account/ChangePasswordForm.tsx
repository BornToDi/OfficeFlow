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
    <div className="max-w-2xl mt-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <p className="text-sm text-muted-foreground">Update your account password. Current password required.</p>

        <Separator className="my-4" />

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="currentPassword">Current password</label>
            <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message as string}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="newPassword">New password</label>
            <Input id="newPassword" type="password" {...form.register("newPassword")} />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive">{form.formState.errors.newPassword.message as string}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm new password</label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message as string}</p>
            )}
          </div>

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert>
              <AlertDescription>Password changed successfully.</AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Change password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
