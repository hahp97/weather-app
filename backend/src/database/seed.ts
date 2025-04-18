import { hashPassword } from "@/utils/password";
import { prisma } from "./prisma";

async function main() {
  console.log(`Start seeding ...`);

  // Check if admin already exists to avoid duplicates
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: "admin@weatherreport.com" }, { username: "admin" }],
    },
  });

  if (!existingAdmin) {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@weatherreport.com",
        username: "admin",
        password: hashPassword("Admin@123456"), // Strong default password
        name: "System Administrator",
        mobile: {
          code: "+84",
          number: "987654321",
          country: "Vietnam",
        },
        active: true,
        isEmailVerified: true,
        superAdmin: true,
        lastSignedInAt: new Date(),
      },
    });

    console.log(`Created admin user with id: ${admin.id}`);
  } else {
    console.log("Admin user already exists, skipping creation");
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
