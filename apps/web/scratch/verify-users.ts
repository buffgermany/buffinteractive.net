import fs from "fs";
import path from "path";

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

import { db, schema } from "@platform/db";
import { inArray } from "drizzle-orm";

async function main() {
  const targetEmails = ["leon@buffinteractive.net", "felix@buffinteractive.net"];

  const foundUsers = await db.query.users.findMany({
    where: inArray(schema.users.email, targetEmails),
  });

  console.log("Found users in DB:");
  for (const user of foundUsers) {
    const accounts = await db.query.accounts.findMany({
      where: (acc, { eq }) => eq(acc.userId, user.id),
    });
    console.log(`- Email: ${user.email} | ID: ${user.id} | Name: ${user.name} | Role: ${user.role} | Accounts count: ${accounts.length}`);
  }

  process.exit(0);
}

main();
