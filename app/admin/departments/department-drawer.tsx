"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Department } from "./department-columns";

type College = { id: string; name: string };

export type DepartmentFormValues = {
  collegeId: string;
  name: string;
  code: string;
  description: string;
};

export function DepartmentDrawer({
  open,
  onOpenChange,
  mode,
  department,
  colleges,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  department: Department | null;
  colleges: College[];
  submitting: boolean;
  onSubmit: (values: DepartmentFormValues) => void;
}) {
  const [values, setValues] = useState<DepartmentFormValues>({
    collegeId: "",
    name: "",
    code: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && department) {
      setValues({
        collegeId: department.collegeId ?? "",
        name: department.name ?? "",
        code: department.code ?? "",
        description: department.description ?? "",
      });
    } else {
      setValues({ collegeId: "", name: "", code: "", description: "" });
    }
    setErrors({});
  }, [open, mode, department]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.collegeId) errs.collegeId = "College is required";
    if (!values.name.trim()) errs.name = "Name is required";
    if (values.name.trim().length < 2) errs.name = "Name is too short";
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
        className="h-[85vh] sm:max-w-none"
        // Prevent closing on outside click / escape
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create Department" : "Edit Department"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new department to your college."
              : "Update department details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="collegeId">College *</Label>
            <Select
              value={values.collegeId}
              onValueChange={(v) => setValues((s) => ({ ...s, collegeId: v }))}
              disabled={mode === "edit"}
            >
              <SelectTrigger id="collegeId" className={'w-full'}>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.collegeId && (
              <p className="text-xs text-destructive">{errors.collegeId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) =>
                setValues((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="Computer Science"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={values.code}
              onChange={(e) =>
                setValues((s) => ({ ...s, code: e.target.value }))
              }
              placeholder="CSE"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) =>
                setValues((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Brief about this department..."
              rows={4}
            />
          </div>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}