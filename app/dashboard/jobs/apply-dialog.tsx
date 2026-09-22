"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ApplyFormValues = {
  coverLetter: string;
  resumeUrl: string;
};

export function ApplyDialog({
  open,
  onOpenChange,
  jobTitle,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  jobTitle: string;
  submitting: boolean;
  onSubmit: (values: ApplyFormValues) => void;
}) {
  const [values, setValues] = useState<ApplyFormValues>({
    coverLetter: "",
    resumeUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setValues({ coverLetter: "", resumeUrl: "" });
    setErrors({});
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (
      values.resumeUrl &&
      !/^https?:\/\/.+/.test(values.resumeUrl)
    ) {
      errs.resumeUrl = "Must be a valid URL";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            Add an optional cover letter and resume link.
          </DialogDescription>
        </DialogHeader>

        <form
          id="apply-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="resumeUrl">Resume URL</Label>
            <Input
              id="resumeUrl"
              value={values.resumeUrl}
              onChange={(e) =>
                setValues((s) => ({ ...s, resumeUrl: e.target.value }))
              }
              placeholder="https://drive.google.com/..."
            />
            {errors.resumeUrl && (
              <p className="text-xs text-destructive">
                {errors.resumeUrl}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              value={values.coverLetter}
              onChange={(e) =>
                setValues((s) => ({
                  ...s,
                  coverLetter: e.target.value,
                }))
              }
              rows={5}
              placeholder="Why are you a good fit for this role?"
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="apply-form" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}