"use client";

import { JobApplication, Column } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import {
  Briefcase,
  Building2,
  DollarSign,
  Edit2,
  ExternalLink,
  GripVertical,
  MapPin,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  deleteJobApplication,
  updateJobApplication,
} from "@/lib/actions/job-applications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import React, { useEffect, useState } from "react";

interface JobApplicationCardProps {
  job: JobApplication;
  columns: Column[];
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

function buildFormData(job: JobApplication) {
  return {
    company: job.company,
    position: job.position,
    location: job.location || "",
    notes: job.notes || "",
    salary: job.salary || "",
    jobUrl: job.jobUrl || "",
    columnId: job.columnId || "",
    tags: job.tags?.join(", ") || "",
    description: job.description || "",
  };
}

/* Company monogram — deterministic tint from a stable hash of the name */
function monogram(name: string) {
  const clean = (name || "?").trim();
  const initials =
    clean
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    "bg-sky-100 text-sky-700 ring-sky-200/70",
    "bg-violet-100 text-violet-700 ring-violet-200/70",
    "bg-emerald-100 text-emerald-700 ring-emerald-200/70",
    "bg-amber-100 text-amber-700 ring-amber-200/70",
    "bg-rose-100 text-rose-700 ring-rose-200/70",
    "bg-indigo-100 text-indigo-700 ring-indigo-200/70",
  ];
  return {
    initials,
    tone: palettes[Math.abs(hash) % palettes.length],
  };
}

export default function JobApplicationCard({
  job,
  columns,
  dragHandleProps,
}: JobApplicationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(job));

  useEffect(() => {
    setFormData(buildFormData(job));
  }, [job]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await updateJobApplication(job._id, {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      });

      if ("error" in result) {
        console.error("Failed to update job application:", result.error);
        return;
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update job application:", err);
    }
  }

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteJobApplication(job._id);
      if ("error" in result) {
        console.error("Failed to delete job application:", result.error);
      }
    } catch (err) {
      console.error("Failed to delete job application:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMove(newColumnId: string) {
    try {
      const result = await updateJobApplication(job._id, {
        columnId: newColumnId,
      });
      if ("error" in result) {
        console.error("Failed to move job application:", result.error);
      }
    } catch (err) {
      console.error("Failed to move job application:", err);
    }
  }

  const otherColumns = columns.filter((c) => c._id !== job.columnId);
  const mono = monogram(job.company);

  return (
    <>
      <Card
        className="group/card relative gap-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_6px_18px_-8px_rgba(15,23,42,0.15)] focus-within:border-slate-300"
      >
        <CardContent className="relative p-0">
          {/* Row 1 — drag handle, monogram, title/menu */}
          <div className="flex items-start gap-2.5 px-2.5 pt-2.5">
            {/* Drag handle — only visible on hover, always tappable */}
            <button
              type="button"
              {...dragHandleProps}
              aria-label="Drag to reorder"
              className="mt-[3px] -ml-0.5 flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-slate-300 opacity-0 transition-opacity duration-150 hover:text-slate-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:cursor-grabbing group-hover/card:opacity-100 touch-none"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>

            {/* Company monogram */}
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10.5px] font-semibold ring-1 ${mono.tone}`}
              aria-hidden
            >
              {mono.initials}
            </span>

            {/* Position + company */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="truncate text-[13px] font-semibold leading-tight tracking-[-0.005em] text-slate-900">
                {job.position}
              </h3>
              <p className="mt-0.5 truncate text-[11.5px] leading-tight text-slate-500">
                {job.company}
              </p>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 rounded-md text-slate-400 opacity-0 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-slate-300 group-hover/card:opacity-100 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 data-[state=open]:opacity-100"
                  aria-label="Application options"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-48 rounded-lg border-slate-200 p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.25)]"
              >
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-md text-[13px]"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit details
                </DropdownMenuItem>

                {otherColumns.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuLabel className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Move to
                    </DropdownMenuLabel>
                    {otherColumns.map((column) => (
                      <DropdownMenuItem
                        key={column._id}
                        onClick={() => handleMove(column._id)}
                        className="cursor-pointer gap-2 rounded-md text-[13px]"
                      >
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {column.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-md text-[13px] text-destructive focus:text-destructive"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleting ? "Deleting…" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2 — metadata (location, salary) */}
          {(job.location || job.salary) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 text-[11.5px] text-slate-500">
              {job.location && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{job.location}</span>
                </span>
              )}
              {job.salary && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <DollarSign className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate tabular-nums">{job.salary}</span>
                </span>
              )}
            </div>
          )}

          {/* Row 3 — description snippet */}
          {job.description && (
            <p className="mt-2 line-clamp-2 px-2.5 text-[11.5px] leading-relaxed text-slate-500">
              {job.description}
            </p>
          )}

          {/* Row 4 — tags + link */}
          {(job.tags?.length || job.jobUrl) && (
            <div className="mt-2.5 flex items-end justify-between gap-2 px-2.5 pb-2.5">
              <div className="flex min-w-0 flex-wrap gap-1">
                {job.tags?.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block max-w-[120px] truncate rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags && job.tags.length > 4 && (
                  <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500">
                    +{job.tags.length - 4}
                  </span>
                )}
              </div>

              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open job posting"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              )}
            </div>
          )}

          {/* Bottom hairline — subtle depth separator */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
          />
        </CardContent>
      </Card>

      {/* -------------------------------- EDIT DIALOG -------------------------------- */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border-slate-200 p-0 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] sm:w-full">
          <div className="border-b border-slate-100 px-6 py-5">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-[17px] font-semibold tracking-[-0.01em] text-slate-900">
                Edit application
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">
                Update the details of this application.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleUpdate}>
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
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="h-10 rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                    className="h-10 rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                    className="h-10 rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                    className="h-10 rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                  className="h-10 rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                  className="h-10 rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                  className="rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                  className="rounded-lg border-slate-200 text-[13.5px] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <DialogFooter className="flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="h-10 w-full rounded-lg border-slate-200 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 w-full rounded-lg bg-slate-900 text-[13.5px] font-medium text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}