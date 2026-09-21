import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely, resolving conflicts.
 * Standard shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts any value into a plain, JSON-safe object that can safely
 * cross the Next.js Server → Client Component boundary.
 *
 * Why this is needed:
 *   Next.js 15/16 rejects any object that has a `toJSON()` method when
 *   passing props from a Server Component to a Client Component.
 *   Mongoose documents, ObjectIds, and Dates all have `toJSON()`.
 *
 * `JSON.parse(JSON.stringify(x))` walks the object recursively and
 * converts:
 *   - ObjectId  → string
 *   - Date      → ISO string
 *   - Mongoose Document → plain object
 *   - undefined → dropped (JSON has no undefined)
 *
 * Usage:
 *   return serialize(boardDoc);
 *   return { data: serialize(jobApplication) };
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}