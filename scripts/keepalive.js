import pg from "pg";

const { Client } = pg;

async function main() {
  const url = process.env.SUPABASE_CONNECTION_STRING;
  if (!url) throw new Error("Missing SUPABASE_CONNECTION_STRING env var");

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const res = await client.query("SELECT 1 AS ok;");
  console.log("Keepalive result:", res.rows[0]);

  await client.end();
}

main().catch((err) => {
  console.error("Keepalive failed:", err);
  process.exit(1);
});
