import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { runDatabaseSeed } from "./seed-data/run-seed";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = new PrismaClient();

async function main() {
  const stats = await runDatabaseSeed(prisma);
  console.log(
    `Seeded ${stats.categories} categories, ${stats.unitPresets} unit presets, ${stats.sharedFields} shared fields, ${stats.calculators} calculators (${stats.created} created, ${stats.updated} updated).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
