"use client";

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import {
  Award,
  Calendar,
  CheckCircle2,
  Mic,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoards";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";

interface KanbanBoardProps {
  board: Board;
  userId: string;
}

interface ColConfig {
  dot: string;      // small accent dot next to the title
  ring: string;     // drop-zone ring color
  tint: string;     // drop-zone background tint
  icon: React.ReactNode;
}

/* Restrained accent system — one hue per stage, no full-color headers */
const COLUMN_CONFIG: Array<ColConfig> = [
  {
    dot: "bg-sky-500",
    ring: "ring-sky-400/60",
    tint: "bg-sky-50/60",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  {
    dot: "bg-violet-500",
    ring: "ring-violet-400/60",
    tint: "bg-violet-50/60",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    dot: "bg-emerald-500",
    ring: "ring-emerald-400/60",
    tint: "bg-emerald-50/60",
    icon: <Mic className="h-3.5 w-3.5" />,
  },
  {
    dot: "bg-amber-500",
    ring: "ring-amber-400/60",
    tint: "bg-amber-50/60",
    icon: <Award className="h-3.5 w-3.5" />,
  },
  {
    dot: "bg-rose-500",
    ring: "ring-rose-400/60",
    tint: "bg-rose-50/60",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
];

const FALLBACK_CONFIG: ColConfig = {
  dot: "bg-slate-400",
  ring: "ring-slate-400/60",
  tint: "bg-slate-50/60",
  icon: <Calendar className="h-3.5 w-3.5" />,
};

/* -------------------------------------------------------------------------- */
/*                             DROPPABLE COLUMN                               */
/* -------------------------------------------------------------------------- */
function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: { type: "column", columnId: column._id },
  });

  const sortedJobs = useMemo(
    () => [...(column.jobApplications ?? [])].sort((a, b) => a.order - b.order),
    [column.jobApplications],
  );

  const count = sortedJobs.length;

  return (
    <Card className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.14)]">
      {/* -------------------------- COLUMN HEADER -------------------------- */}
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b border-slate-100 px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`}
            aria-hidden
          />
          <span className="shrink-0 text-slate-400" aria-hidden>
            {config.icon}
          </span>
          <CardTitle className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-slate-800">
            {column.name}
          </CardTitle>
          <span className="ml-0.5 inline-flex h-[18px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-medium tabular-nums text-slate-600">
            {count}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
              aria-label={`Column options for ${column.name}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-44 rounded-lg border-slate-200 p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.25)]"
          >
            <DropdownMenuItem className="cursor-pointer gap-2 rounded-md text-[13px] text-destructive focus:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* -------------------------- COLUMN BODY ---------------------------- */}
      <CardContent
        ref={setNodeRef}
        className={`flex min-h-[420px] flex-1 flex-col gap-2 rounded-b-xl px-2.5 pb-2.5 pt-2.5 transition-colors duration-200 ${
          isOver
            ? `${config.tint} ring-2 ring-inset ${config.ring}`
            : "bg-slate-50/50"
        }`}
      >
        <SortableContext
          items={sortedJobs.map((job) => job._id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Empty state */}
          {count === 0 && !isOver && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 px-4 py-10 text-center">
              <p className="text-[12.5px] font-medium text-slate-500">
                No applications
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">
                Drop a card here or add one below.
              </p>
            </div>
          )}

          {sortedJobs.map((job) => (
            <SortableJobCard
              key={job._id}
              job={{ ...job, columnId: job.columnId || column._id }}
              columns={sortedColumns}
            />
          ))}
        </SortableContext>

        <div className="pt-0.5">
          <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SORTABLE JOB CARD                               */
/* -------------------------------------------------------------------------- */
function SortableJobCard({
  job,
  columns,
}: {
  job: JobApplication;
  columns: Column[];
}) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({
    id: job._id,
    data: { type: "job", job },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-manipulation will-change-transform"
    >
      <JobApplicationCard
        job={job}
        columns={columns}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              KANBAN BOARD                                  */
/* -------------------------------------------------------------------------- */
export default function KanbanBoard({ board, userId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { columns, moveJob } = useBoard(board);

  const sortedColumns = useMemo(
    () => [...(columns ?? [])].sort((a, b) => a.order - b.order),
    [columns],
  );

  const sensors = useSensors(
    // Small delay lets a tap open the card; drag activates after 8px
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Touch: press-and-hold briefly so vertical scroll still works
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !board._id) return;

    const activeJobId = active.id as string;
    const overId = over.id as string;

    let sourceColumn: Column | null = null;
    let sourceIndex = -1;

    for (const column of sortedColumns) {
      const jobs = [...(column.jobApplications ?? [])].sort(
        (a, b) => a.order - b.order,
      );
      const idx = jobs.findIndex((j) => j._id === activeJobId);
      if (idx !== -1) {
        sourceColumn = column;
        sourceIndex = idx;
        break;
      }
    }

    if (!sourceColumn) return;

    const targetColumn = sortedColumns.find((c) => c._id === overId);
    const targetJob = sortedColumns
      .flatMap((c) => c.jobApplications ?? [])
      .find((j) => j._id === overId);

    let targetColumnId: string;
    let newOrder: number;

    if (targetColumn) {
      targetColumnId = targetColumn._id;
      const jobs = (targetColumn.jobApplications ?? [])
        .filter((j) => j._id !== activeJobId)
        .sort((a, b) => a.order - b.order);
      newOrder = jobs.length;
    } else if (targetJob) {
      const targetCol = sortedColumns.find((c) =>
        c.jobApplications?.some((j) => j._id === targetJob._id),
      );
      targetColumnId = targetJob.columnId || targetCol?._id || "";
      if (!targetColumnId) return;

      const all = [...(targetCol?.jobApplications ?? [])].sort(
        (a, b) => a.order - b.order,
      );
      const filtered = all.filter((j) => j._id !== activeJobId);
      const originalIdx = all.findIndex((j) => j._id === overId);
      const filteredIdx = filtered.findIndex((j) => j._id === overId);

      if (filteredIdx !== -1) {
        if (sourceColumn._id === targetColumnId && sourceIndex < originalIdx) {
          newOrder = filteredIdx + 1;
        } else {
          newOrder = filteredIdx;
        }
      } else {
        newOrder = filtered.length;
      }
    } else {
      return;
    }

    await moveJob(activeJobId, targetColumnId, newOrder);
  }

  const activeJob = useMemo(
    () =>
      sortedColumns
        .flatMap((c) => c.jobApplications ?? [])
        .find((j) => j._id === activeId),
    [sortedColumns, activeId],
  );

  const totalApplications = useMemo(
    () =>
      sortedColumns.reduce(
        (sum, c) => sum + (c.jobApplications?.length ?? 0),
        0,
      ),
    [sortedColumns],
  );

  return (
    <DndContext
      id={board._id}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="relative">
        {/* Board summary strip */}
        <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
          <p className="text-[12.5px] text-slate-500">
            <span className="font-medium text-slate-700 tabular-nums">
              {totalApplications}
            </span>{" "}
            {totalApplications === 1 ? "application" : "applications"}
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-medium text-slate-700 tabular-nums">
              {sortedColumns.length}
            </span>{" "}
            {sortedColumns.length === 1 ? "stage" : "stages"}
          </p>

          <p className="hidden text-[12px] text-slate-400 sm:block">
            Drag cards between stages to update status
          </p>
        </div>

        {/* Horizontal scroll container with edge fade on mobile */}
        <div className="relative -mx-4 sm:-mx-6">
          {/* Left/right fade hints on small screens */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:hidden"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:hidden"
          />

          <div className="flex items-stretch gap-3 overflow-x-auto px-4 pb-3 pt-1 sm:gap-4 sm:px-6">
            {sortedColumns.map((col, idx) => (
              <DroppableColumn
                key={col._id}
                column={col}
                config={COLUMN_CONFIG[idx] ?? FALLBACK_CONFIG}
                boardId={board._id}
                sortedColumns={sortedColumns}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag preview — tilted slightly for a tactile feel */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)" }}>
        {activeJob ? (
          <div className="rotate-[1.25deg] cursor-grabbing opacity-95 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.35)]">
            <JobApplicationCard job={activeJob} columns={sortedColumns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}