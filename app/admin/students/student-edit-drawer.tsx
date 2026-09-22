"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Student, UserRole, UserStatus } from "./student-types";

export type StudentEditFormValues = {
  name: string;
  status: UserStatus;
  role: UserRole;
};

const EMPTY: StudentEditFormValues = {
  name: "",
  status: "active",
  role: "student",
};

export function StudentEditDrawer({
  open,
  onOpenChange,
  student,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | null;
  submitting: boolean;
  onSubmit: (values: StudentEditFormValues) => void;
}) {
  const [values, setValues] = useState<StudentEditFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (student) {
      setValues({
        name: student.name ?? "",
        status: student.status,
        role: student.role,
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, student]);

  const set = <K extends keyof StudentEditFormValues>(
    key: K,
    v: StudentEditFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Name is required";
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
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Edit Student</SheetTitle>
          <SheetDescription>
            Update student account information.
          </SheetDescription>
        </SheetHeader>

        <form
          id="student-edit-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(v) => set("status", (v ?? "active") as UserStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={values.role}
                  onValueChange={(v) => set("role", (v ?? "student") as UserRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Promote to alumni when they graduate.
                </p>
              </div>
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
            form="student-edit-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}