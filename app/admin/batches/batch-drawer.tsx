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
import type { Batch, College } from "./batch-types";

export type BatchFormValues = {
  collegeId: string;
  year: string;
  startYear: string;
  endYear: string;
};

const EMPTY: BatchFormValues = {
  collegeId: "",
  year: "",
  startYear: "",
  endYear: "",
};

export function BatchDrawer({
  open,
  onOpenChange,
  mode,
  batch,
  colleges,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  batch: Batch | null;
  colleges: College[];
  submitting: boolean;
  onSubmit: (values: BatchFormValues) => void;
}) {
  const [values, setValues] = useState<BatchFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && batch) {
      setValues({
        collegeId: batch.collegeId ?? "",
        year: String(batch.year ?? ""),
        startYear: batch.startYear != null ? String(batch.startYear) : "",
        endYear: batch.endYear != null ? String(batch.endYear) : "",
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, batch]);

  const set = <K extends keyof BatchFormValues>(
    key: K,
    v: BatchFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.collegeId) errs.collegeId = "College is required";
    if (!values.year) errs.year = "Year is required";
    else {
      const y = Number(values.year);
      if (isNaN(y) || y < 1900 || y > 2100)
        errs.year = "Year must be between 1900 and 2100";
    }
    if (
      values.startYear &&
      values.endYear &&
      Number(values.startYear) > Number(values.endYear)
    ) {
      errs.endYear = "End year must be ≥ start year";
    }
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
        className="h-[80vh] sm:max-w-none"
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create Batch" : "Edit Batch"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new graduation batch to a college."
              : "Update batch details below."}
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
              onValueChange={(v) => set("collegeId", v ?? "")}
              disabled={mode === "edit"}
            >
              <SelectTrigger id="collegeId">
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
            <Label htmlFor="year">Batch Year *</Label>
            <Input
              id="year"
              type="number"
              min={1900}
              max={2100}
              value={values.year}
              onChange={(e) => set("year", e.target.value)}
              placeholder="2024"
            />
            {errors.year && (
              <p className="text-xs text-destructive">{errors.year}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Graduation year (e.g., 2024 for the class of 2024)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startYear">Start Year</Label>
              <Input
                id="startYear"
                type="number"
                min={1900}
                max={2100}
                value={values.startYear}
                onChange={(e) => set("startYear", e.target.value)}
                placeholder="2020"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endYear">End Year</Label>
              <Input
                id="endYear"
                type="number"
                min={1900}
                max={2100}
                value={values.endYear}
                onChange={(e) => set("endYear", e.target.value)}
                placeholder="2024"
              />
              {errors.endYear && (
                <p className="text-xs text-destructive">{errors.endYear}</p>
              )}
            </div>
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