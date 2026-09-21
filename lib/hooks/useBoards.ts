"use client";

import { useEffect, useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication } from "../actions/job-applications";

export function useBoard(initialBoard?: Board | null) {
  const [board, setBoard] = useState<Board | null>(initialBoard ?? null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns ?? []);
  const [error, setError] = useState<string | null>(null);

  // ✅ Re-sync when a DIFFERENT board arrives (not on every object identity change)
  useEffect(() => {
    if (initialBoard) {
      setBoard(initialBoard);
      setColumns(initialBoard.columns ?? []);
    }
  }, [initialBoard?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    newOrder: number
  ) {
    // ✅ Snapshot for rollback
    const snapshot = columns;

    // ✅ Optimistic update — reindexes ONLY the target column to idx * 100
    //    (matches what the server does, so both states stay in sync)
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        jobApplications: [...(col.jobApplications ?? [])],
      }));

      let jobToMove: JobApplication | null = null;

      for (const col of newColumns) {
        const idx = col.jobApplications.findIndex(
          (j) => j._id === jobApplicationId
        );
        if (idx !== -1) {
          jobToMove = col.jobApplications[idx];
          col.jobApplications = col.jobApplications.filter(
            (j) => j._id !== jobApplicationId
          );
          break;
        }
      }

      if (!jobToMove) return prev;

      const targetIdx = newColumns.findIndex((c) => c._id === newColumnId);
      if (targetIdx === -1) return prev;

      const target = newColumns[targetIdx];
      const updated = [...target.jobApplications];
      updated.splice(newOrder, 0, { ...jobToMove, columnId: newColumnId });

      newColumns[targetIdx] = {
        ...target,
        jobApplications: updated.map((job, i) => ({
          ...job,
          order: i * 100,
        })),
      };

      return newColumns;
    });

    // ✅ Server call + rollback on failure
    try {
      const result = await updateJobApplication(jobApplicationId, {
        columnId: newColumnId,
        order: newOrder,
      });

 if ("error" in result && result.error) {
  setColumns(snapshot);
  setError(result.error);       // ✅ now definitely `string`
  console.error("Move failed:", result.error);
} else {
  setError(null);
}
    } catch (err) {
      setColumns(snapshot);
      setError("Network error — could not move job.");
      console.error(err);
    }
  }

  return { board, columns, error, moveJob };
}