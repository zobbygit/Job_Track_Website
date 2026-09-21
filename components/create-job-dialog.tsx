"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import React, { useState } from "react";
import { createJobApplication } from "@/lib/actions/job-applications";

interface CreateJobApplicationDialogProps {
  columnId: string;
  boardId: string;
}

const INITIAL_FORM_DATA = {
  company: "",
  position: "",
  location: "",
  notes: "",
  salary: "",
  jobUrl: "",
  tags: "",
  description: "",
};

export default function CreateJobApplicationDialog({
  columnId,
  boardId,
}: CreateJobApplicationDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await createJobApplication({
        ...formData,
        columnId,
        boardId,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      });

      if ("error" in result) {
        console.error("Failed to create job:", result.error);
      } else {
        setFormData(INITIAL_FORM_DATA);
        setOpen(false);
      }
    } catch (err) {
      console.error("Failed to create job:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group/add flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white/40 px-2.5 py-2 text-left text-[12.5px] font-medium text-slate-500 transition-all duration-150 hover:border-slate-400 hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-[0.99]"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors duration-150 group-hover/add:bg-slate-900 group-hover/add:text-white">
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </span>
          Add application
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border-slate-200 p-0 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] sm:w-full">
        {/* Header band */}
        <div className="border-b border-slate-100 px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[17px] font-semibold tracking-[-0.01em] text-slate-900">
              Add application
            </DialogTitle>
            <DialogDescription className="text-[13px] text-slate-500">
              Track a new role you&apos;ve applied to or are about to.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {/* Company + Position */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-[12.5px] font-medium text-slate-700"
                >
                  Company <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="company"
                  required
                  autoFocus
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="e.g., Acme Inc."
                  className="h-10 rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="position"
                  className="text-[12.5px] font-medium text-slate-700"
                >
                  Position <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="position"
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="e.g., Frontend Engineer"
                  className="h-10 rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Location + Salary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-[12.5px] font-medium text-slate-700"
                >
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Remote · EU"
                  className="h-10 rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="salary"
                  className="text-[12.5px] font-medium text-slate-700"
                >
                  Salary
                </Label>
                <Input
                  id="salary"
                  placeholder="e.g., $100k – $150k"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="h-10 rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Job URL */}
            <div className="space-y-2">
              <Label
                htmlFor="jobUrl"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Job URL
              </Label>
              <Input
                id="jobUrl"
                type="url"
                placeholder="https://…"
                value={formData.jobUrl}
                onChange={(e) =>
                  setFormData({ ...formData, jobUrl: e.target.value })
                }
                className="h-10 rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Tags{" "}
                <span className="font-normal text-slate-400">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="tags"
                placeholder="React, Tailwind, Remote"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="h-10 rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Brief description of the role…"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Notes
              </Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Interview prep, follow-ups, contacts…"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="rounded-lg border-slate-200 text-[13.5px] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 w-full rounded-lg border-slate-200 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg bg-slate-900 text-[13.5px] font-medium text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M22 12a10 10 0 0 0-10-10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Adding…
                </span>
              ) : (
                "Add application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}