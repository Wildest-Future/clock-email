import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BLOCKED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "live.com",
  "msn.com",
  "comcast.net",
  "att.net",
  "verizon.net",
  "me.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "tutanota.com",
];

const APPROVED_DOMAINS = [
  "boston.gov",
  "whitehouse.gov",
  "mahouse.gov",
  "masenate.gov",
  "mass.gov",
  "usa.gov",
  "state.gov",
  "congress.gov",
];

async function main() {
  // Seed blocked consumer email domains
  for (const domain of BLOCKED_DOMAINS) {
    await prisma.domain.upsert({
      where: { domain },
      update: {},
      create: {
        domain,
        status: "blocked",
        submittedBy: "system",
        reason: "Consumer email provider",
      },
    });
  }
  console.log(`Seeded ${BLOCKED_DOMAINS.length} blocked domains`);

  // Seed known .gov domains
  for (const domain of APPROVED_DOMAINS) {
    await prisma.domain.upsert({
      where: { domain },
      update: {},
      create: {
        domain,
        status: "approved",
        submittedBy: "system",
        reason: "Government domain",
      },
    });
  }
  console.log(`Seeded ${APPROVED_DOMAINS.length} approved domains`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
