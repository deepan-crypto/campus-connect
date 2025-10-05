const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({ data: [
    { email: 'alice@example.com', name: 'Alice Admin', role: 'admin', password: 'changeme' },
    { email: 'bob@example.com', name: 'Bob Faculty', role: 'faculty', password: 'changeme' },
  ], skipDuplicates: true });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
