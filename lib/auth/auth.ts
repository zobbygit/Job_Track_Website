import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import connectDB from "../db";

/* -------------------------------------------------------------------------- */
/*                        CONNECT ONCE AT MODULE LOAD                         */
/* -------------------------------------------------------------------------- */
let mongooseInstance;
try {
  mongooseInstance = await connectDB();
} catch (err) {
  console.error(
    "❌ Failed to connect to MongoDB at auth init. Check MONGODB_URI and network access.",
    err
  );
  throw err;
}

const client = mongooseInstance.connection.getClient();
const db = client.db();

/* -------------------------------------------------------------------------- */
/*                                AUTH CONFIG                                 */
/* -------------------------------------------------------------------------- */
export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  // ✅ Explicit — required for production
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            try {
              await initializeUserBoard(user.id);
            } catch (err) {
              console.error("Failed to initialize user board:", err);
            }
          }
        },
      },
    },
  },
});

/* -------------------------------------------------------------------------- */
/*                          SERVER-SIDE HELPERS                               */
/* -------------------------------------------------------------------------- */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function signOut() {
  const result = await auth.api.signOut({ headers: await headers() });
  if (result.success) redirect("/sign-in");
}