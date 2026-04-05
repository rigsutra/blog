import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash },
  });
  console.log(`Admin ready: ${admin.username}`);
}

main()
  .catch((e) => {
    console.error("ensure-admin failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
