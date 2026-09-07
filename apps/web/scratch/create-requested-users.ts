import fs from "fs";
import path from "path";

// Read .env file from root
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

import { auth } from "../src/lib/auth";
import { db, schema } from "@platform/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Database URL configured:", !!process.env.DATABASE_URL);

  const usersToCreate = [
    {
      email: "leon@buffinteractive.net",
      password: "ServiceBuffinteractive2!",
      name: "Leon",
      role: "admin",
    },
    {
      email: "felix@buffinteractive.net",
      password: "ServiceBuffinteractive1!",
      name: "Felix",
      role: "admin",
    },
  ];

  for (const u of usersToCreate) {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.email, u.email),
      });

      if (existingUser) {
        console.log(`User ${u.email} already exists. Deleting existing user to re-create with new password hash...`);
        await db.delete(schema.users).where(eq(schema.users.id, existingUser.id));
      }

      const response = await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
        },
      });

      if (response && response.user) {
        // Update user role to admin
        await db
          .update(schema.users)
          .set({ role: u.role as "admin" | "user" })
          .where(eq(schema.users.id, response.user.id));

        console.log(`SUCCESS: Created user ${response.user.email} (ID: ${response.user.id}, Role: ${u.role})`);
      } else {
        console.log(`Created user ${u.email} response:`, response);
      }
    } catch (error: any) {
      console.error(`Error processing user ${u.email}:`, error?.message || error);
    }
  }

  process.exit(0);
}

main();
