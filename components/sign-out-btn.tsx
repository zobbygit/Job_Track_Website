"use client";

import { signOut } from "@/lib/auth/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <DropdownMenuItem
      // ✅ onSelect is the correct Radix event (onClick can fire twice)
      onSelect={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);

        try {
          const { error } = await signOut();
          if (error) {
            console.error("Sign out failed:", error);
            setBusy(false);
            return;
          }
          // ✅ refresh() clears server component cache so the navbar updates
          router.push("/sign-in");
          router.refresh();
        } catch (err) {
          console.error("Sign out failed:", err);
          setBusy(false);
        }
      }}
      disabled={busy}
    >
      {busy ? "Logging out..." : "Log Out"}
    </DropdownMenuItem>
  );
}