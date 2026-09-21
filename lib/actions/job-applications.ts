"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";
import { serialize } from "../utils";

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTS                                  */
/* -------------------------------------------------------------------------- */
const ORDER_GAP = 100;

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */
interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description?: string;
}

type UpdatePayload = {
  company?: string;
  position?: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId?: string;
  order?: number;
  tags?: string[];
  description?: string;
};

type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never };

/* -------------------------------------------------------------------------- */
/*                            CACHE INVALIDATION                              */
/* -------------------------------------------------------------------------- */
function invalidateBoard(userId: string) {
  revalidateTag(`board-${userId}`, "max");   // ✅ second arg = cache profile
  revalidatePath("/dashboard");
}

/* -------------------------------------------------------------------------- */
/*                    HELPER: REINDEX COLUMN TO idx * 100                     */
/* -------------------------------------------------------------------------- */
/**
 * Reindexes every job in a column to `idx * 100` (0, 100, 200, ...).
 * Called after any create / reorder / cross-column move so DB state
 * always matches what the client optimistically computes.
 */
async function reindexColumn(columnId: string) {
  const jobs = await JobApplication.find({ columnId })
    .sort({ order: 1 })
    .select("_id")
    .lean<{ _id: unknown }[]>();

  if (jobs.length === 0) return;

  await JobApplication.bulkWrite(
    jobs.map((job, idx) => ({
      updateOne: {
        filter: { _id: job._id },
        update: { $set: { order: idx * ORDER_GAP } },
      },
    }))
  );
}

/* -------------------------------------------------------------------------- */
/*                                 CREATE                                     */
/* -------------------------------------------------------------------------- */
export async function createJobApplication(
  data: JobApplicationData
): Promise<ActionResult<unknown>> {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  await connectDB();

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { error: "Missing required fields" };
  }

  // Ownership verification
  const board = await Board.findOne({
    _id: boardId,
    userId: session.user.id,
  });
  if (!board) return { error: "Board not found" };

  const column = await Column.findOne({ _id: columnId, boardId });
  if (!column) return { error: "Column not found" };

  // Next order = current count * 100 (keeps gaps clean)
  const count = await JobApplication.countDocuments({ columnId });

  const jobApplication = await JobApplication.create({
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    userId: session.user.id,
    tags: tags ?? [],
    description,
    status: "applied",
    order: count * ORDER_GAP,
  });

  await Column.findByIdAndUpdate(columnId, {
    $push: { jobApplications: jobApplication._id },
  });

  invalidateBoard(session.user.id);

  return { data: serialize(jobApplication) };
}

/* -------------------------------------------------------------------------- */
/*                                 UPDATE                                     */
/* -------------------------------------------------------------------------- */
export async function updateJobApplication(
  id: string,
  updates: UpdatePayload
): Promise<ActionResult<unknown>> {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  await connectDB();

  const job = await JobApplication.findById(id);
  if (!job) return { error: "Job application not found" };

  if (job.userId.toString() !== session.user.id.toString()) {
    return { error: "Unauthorized" };
  }

  const { columnId, order, ...fieldUpdates } = updates;
  const currentColumnId = job.columnId.toString();
  const newColumnId = columnId?.toString();
  const isMovingColumns = !!newColumnId && newColumnId !== currentColumnId;

  /* ---------------------- CASE A: MOVING TO ANOTHER COLUMN ----------------- */
  if (isMovingColumns) {
    const targetColumn = await Column.findOne({
      _id: newColumnId,
      boardId: job.boardId,
    });
    if (!targetColumn) return { error: "Target column not found" };

    // Remove from old column
    await Column.findByIdAndUpdate(currentColumnId, {
      $pull: { jobApplications: id },
    });

    // Fetch target column jobs (excluding the one being moved)
    const existing = await JobApplication.find({
      columnId: newColumnId,
      _id: { $ne: id },
    })
      .sort({ order: 1 })
      .select("_id")
      .lean<{ _id: unknown }[]>();

    // Determine insertion index
    const insertIndex =
      order !== undefined && order !== null
        ? Math.max(0, Math.min(order, existing.length))
        : existing.length;

    // Build final ordered list (existing + moved job at insertIndex)
    const finalOrder: unknown[] = [
      ...existing.slice(0, insertIndex).map((j) => j._id),
      id,
      ...existing.slice(insertIndex).map((j) => j._id),
    ];

    // Reindex everyone to idx * 100, and update the moved job's column
    await JobApplication.bulkWrite(
      finalOrder.map((jobId, idx) => ({
        updateOne: {
          filter: { _id: jobId },
          update: {
            $set: {
              order: idx * ORDER_GAP,
              ...(jobId === id ? { columnId: newColumnId } : {}),
            },
          },
        },
      }))
    );

    // Register in target column's array
    await Column.findByIdAndUpdate(newColumnId, {
      $push: { jobApplications: id },
    });

    // Apply any non-positional field updates too
    if (Object.keys(fieldUpdates).length > 0) {
      await JobApplication.findByIdAndUpdate(id, { $set: fieldUpdates });
    }
  }

  /* ---------------------- CASE B: REORDER INSIDE SAME COLUMN --------------- */
  else if (order !== undefined && order !== null) {
    const otherJobs = await JobApplication.find({
      columnId: currentColumnId,
      _id: { $ne: id },
    })
      .sort({ order: 1 })
      .select("_id")
      .lean<{ _id: unknown }[]>();

    const targetIndex = Math.max(0, Math.min(order, otherJobs.length));

    const finalOrder: unknown[] = [
      ...otherJobs.slice(0, targetIndex).map((j) => j._id),
      id,
      ...otherJobs.slice(targetIndex).map((j) => j._id),
    ];

    await JobApplication.bulkWrite(
      finalOrder.map((jobId, idx) => ({
        updateOne: {
          filter: { _id: jobId },
          update: { $set: { order: idx * ORDER_GAP } },
        },
      }))
    );

    if (Object.keys(fieldUpdates).length > 0) {
      await JobApplication.findByIdAndUpdate(id, { $set: fieldUpdates });
    }
  }

  /* ---------------------- CASE C: ONLY FIELD UPDATES ----------------------- */
  else if (Object.keys(fieldUpdates).length > 0) {
    await JobApplication.findByIdAndUpdate(id, { $set: fieldUpdates });
  }

  const updated = await JobApplication.findById(id);
  if (!updated) return { error: "Failed to update job application" };

  invalidateBoard(session.user.id);

  return { data: serialize(updated) };
}

/* -------------------------------------------------------------------------- */
/*                                 DELETE                                     */
/* -------------------------------------------------------------------------- */
export async function deleteJobApplication(
  id: string
): Promise<ActionResult<{ success: true }>> {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  await connectDB();

  const job = await JobApplication.findById(id);
  if (!job) return { error: "Job application not found" };

  if (job.userId.toString() !== session.user.id.toString()) {
    return { error: "Unauthorized" };
  }

  const columnId = job.columnId.toString();

  // Remove from column and delete
  await Column.findByIdAndUpdate(columnId, {
    $pull: { jobApplications: id },
  });
  await JobApplication.deleteOne({ _id: id });

  // Reindex remaining jobs so gaps stay tidy
  await reindexColumn(columnId);

  invalidateBoard(session.user.id);

  return { data: { success: true } };
}