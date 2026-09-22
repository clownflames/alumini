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
import type { Branch, Department } from "./branch-types";

export type BranchFormValues = {
  departmentId: string;
  name: string;
  code: string;
  description: string;
};

const EMPTY: BranchFormValues = {
  departmentId: "",
  name: "",
  code: "",
  description: "",
};

export function BranchDrawer({
  open,
  onOpenChange,
  mode,
  branch,
  departments,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  branch: Branch | null;
  departments: Department[];
  submitting: boolean;
  onSubmit: (values: BranchFormValues) => void;
}) {
  const [values, setValues] = useState<BranchFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && branch) {
      setValues({
        departmentId: branch.departmentId ?? "",
        name: branch.name ?? "",
        code: branch.code ?? "",
        description: branch.description ?? "",
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, branch]);

  const set = <K extends keyof BranchFormValues>(
    key: K,
    v: BranchFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.departmentId) errs.departmentId = "Department is required";
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
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create Branch" : "Edit Branch"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new branch to a department."
              : "Update branch details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="departmentId">Department *</Label>
            <Select
              value={values.departmentId}
              onValueChange={(v) => set("departmentId", v ?? "")}
              disabled={mode === "edit"}
            >
              <SelectTrigger id="departmentId">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                    {d.collegeName ? ` — ${d.collegeName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-xs text-destructive">{errors.departmentId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Computer Science & Engineering"
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
              onChange={(e) => set("code", e.target.value)}
              placeholder="CSE"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief about this branch..."
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