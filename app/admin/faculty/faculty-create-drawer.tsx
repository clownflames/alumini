"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type FacultyCreateFormValues = {
  name: string;
  email: string;
  password: string;
};

const EMPTY: FacultyCreateFormValues = {
  name: "",
  email: "",
  password: "",
};

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function FacultyCreateDrawer({
  open,
  onOpenChange,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  submitting: boolean;
  onSubmit: (values: FacultyCreateFormValues) => void;
}) {
  const [values, setValues] = useState<FacultyCreateFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues({ ...EMPTY, password: generatePassword() });
    setErrors({});
    setShowPassword(false);
  }, [open]);

  const set = <K extends keyof FacultyCreateFormValues>(
    key: K,
    v: FacultyCreateFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Name is required";
    if (!values.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      errs.email = "Invalid email format";
    if (!values.password) errs.password = "Password is required";
    else if (values.password.length < 8)
      errs.password = "Minimum 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[60vh] sm:max-w-none flex flex-col p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Create Faculty Account</SheetTitle>
          <SheetDescription>
            Create a new faculty account with login credentials. Faculty gets
            the "admin" role in the system.
          </SheetDescription>
        </SheetHeader>

        <form
          id="faculty-create-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Dr. Jane Smith"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane.smith@college.edu"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => set("password", generatePassword())}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <RefreshCw className="size-3" />
                    Regenerate
                  </button>
                </div>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Minimum 8 characters"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Share this password with the faculty securely.
              </p>
            </div>
          </div>
        </form>

        <SheetFooter className="shrink-0 border-t px-6 py-4 flex-row justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="faculty-create-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create Account
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}