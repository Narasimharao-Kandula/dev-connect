import { prisma } from "./lib/prisma";

async function cleanup() {
  console.log("Running cleanup: permanently deleting expired accounts...");

  const expiredUsers = await prisma.user.findMany({
    where: {
      deletedAt: { not: null, lte: new Date() },
    },
    select: { id: true, email: true, deletedAt: true },
  });

  console.log(`Found ${expiredUsers.length} expired accounts`);

  for (const user of expiredUsers) {
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Permanently deleted: ${user.email} (scheduled: ${user.deletedAt})`);
  }

  console.log("Cleanup complete");
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
