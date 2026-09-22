"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MentorshipFocus } from "./mentorship-types";

export type RequestFormValues = {
  focus: MentorshipFocus;
  requestMessage: string;
  goal: string;
};

export function RequestDialog({
  open,
  onOpenChange,
  mentorName,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mentorName: string;
  submitting: boolean;
  onSubmit: (values: RequestFormValues) => void;
}) {
  const [values, setValues] = useState<RequestFormValues>({
    focus: "career",
    requestMessage: "",
    goal: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setValues({
      focus: "career",
      requestMessage: "",
      goal: "",
    });
    setErrors({});
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.goal.trim()) errs.goal = "Please share your goal";
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
          <DialogTitle>Request Mentorship</DialogTitle>
          <DialogDescription>
            Send a request to <strong>{mentorName}</strong>. Add a short
            message explaining what you're looking for.
          </DialogDescription>
        </DialogHeader>

        <form
          id="mentorship-request-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="focus">Focus Area</Label>
            <Select
              value={values.focus}
              onValueChange={(v) =>
                setValues((s) => ({
                  ...s,
                  focus: v as MentorshipFocus,
                }))
              }
            >
              <SelectTrigger id="focus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="academics">Academics</SelectItem>
                <SelectItem value="entrepreneurship">
                  Entrepreneurship
                </SelectItem>
                <SelectItem value="higher_studies">
                  Higher Studies
                </SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="goal">Your Goal *</Label>
            <Textarea
              id="goal"
              value={values.goal}
              onChange={(e) =>
                setValues((s) => ({ ...s, goal: e.target.value }))
              }
              rows={3}
              placeholder="What do you hope to achieve with this mentorship?"
            />
            {errors.goal && (
              <p className="text-xs text-destructive">{errors.goal}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="requestMessage">Message (optional)</Label>
            <Textarea
              id="requestMessage"
              value={values.requestMessage}
              onChange={(e) =>
                setValues((s) => ({
                  ...s,
                  requestMessage: e.target.value,
                }))
              }
              rows={3}
              placeholder="Introduce yourself briefly..."
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
          <Button
            type="submit"
            form="mentorship-request-form"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}