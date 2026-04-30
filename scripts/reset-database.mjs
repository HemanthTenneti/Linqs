import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

const collections = [
  "files",
  "batches",
  "File",
  "Batch",
  "users",
  "accounts",
  "sessions",
  "verificationtokens",
];

function parseYesFlag(argv) {
  return argv.includes("--yes") || argv.includes("--force");
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    if (!key || process.env[key] != null) continue;

    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function hydrateEnv() {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, ".env.local"));
  loadEnvFile(path.join(cwd, ".env"));
}

async function main() {
  hydrateEnv();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set (checked process env, .env.local, and .env)");
  }

  if (!parseYesFlag(process.argv)) {
    console.error(
      "Refusing to reset the database without confirmation. Re-run with --yes."
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const existing = await db.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));

    const deleted = [];
    for (const name of collections) {
      if (!existingNames.has(name)) continue;
      const result = await db.collection(name).deleteMany({});
      deleted.push({ name, deletedCount: result.deletedCount });
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          database: db.databaseName,
          deleted,
        },
        null,
        2
      )
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
