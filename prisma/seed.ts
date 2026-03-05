import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Departments
  const cityCouncil = await prisma.department.upsert({
    where: { slug: "boston-city-council" },
    update: {},
    create: {
      name: "Boston City Council",
      slug: "boston-city-council",
      level: "city_council",
    },
  });

  const mayorsOffice = await prisma.department.upsert({
    where: { slug: "mayors-office" },
    update: {},
    create: {
      name: "Mayor's Office",
      slug: "mayors-office",
      level: "mayor",
    },
  });

  // Boston City Council — District Councilors (2024-2025 term)
  // NOTE: These are placeholder entries. Verify names and emails before production use.
  const councilors = [
    { name: "Gabriela Coletta", district: "District 1", office: "City Councilor" },
    { name: "Ed Flynn", district: "District 2", office: "City Councilor" },
    { name: "John FitzGerald", district: "District 3", office: "City Councilor" },
    { name: "Brian Worrell", district: "District 4", office: "City Councilor" },
    { name: "Enrique Pepén", district: "District 5", office: "City Councilor" },
    { name: "Benjamin Weber", district: "District 6", office: "City Councilor" },
    { name: "Tania Fernandes Anderson", district: "District 7", office: "City Councilor" },
    { name: "Sharon Durkan", district: "District 8", office: "City Councilor" },
    { name: "Liz Breadon", district: "District 9", office: "City Councilor" },
    { name: "Henry Santana", district: "District 10", office: "City Councilor" },
    { name: "José Ruiz", district: "District 11", office: "City Councilor" },
    { name: "Tania Fernandes Anderson", district: "District 12", office: "City Councilor" },
    { name: "Ruthzee Louijeune", district: "District 13", office: "City Councilor" },
  ];

  for (const c of councilors) {
    const slug = c.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    await prisma.official.upsert({
      where: { slug },
      update: {},
      create: {
        name: c.name,
        title: c.office,
        office: `Boston City Council — ${c.district}`,
        departmentId: cityCouncil.id,
        district: c.district,
        slug,
      },
    });
  }

  // Mayor
  await prisma.official.upsert({
    where: { slug: "michelle-wu" },
    update: {},
    create: {
      name: "Michelle Wu",
      title: "Mayor",
      office: "Mayor of Boston",
      departmentId: mayorsOffice.id,
      slug: "michelle-wu",
    },
  });

  console.log("Seed complete: Boston officials directory created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
