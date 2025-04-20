import { hashPassword } from "@/utils/password";
import { prisma } from "./prisma";

async function main() {
  console.log(`Start seeding ...`);

  // Check if admin already exists to avoid duplicates
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: "admin@weather.com" }, { username: "admin" }],
    },
  });

  if (!existingAdmin) {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@weather.com",
        username: "admin",
        password: hashPassword("Password123!"),
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

  // Create regular user if it doesn't exist
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: "user@weather.com" }, { username: "user" }],
    },
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email: "user@weather.com",
        username: "user",
        password: hashPassword("Password123!"),
        name: "Regular User",
        mobile: {
          code: "+1",
          number: "5551234567",
          country: "USA",
        },
        active: true,
        isEmailVerified: true,
        superAdmin: false,
        lastSignedInAt: new Date(),
      },
    });

    console.log(`Created regular user with id: ${user.id}`);
  } else {
    console.log("Regular user already exists, skipping creation");
  }

  // Create demo user with sample weather reports
  const existingDemo = await prisma.user.findFirst({
    where: {
      OR: [{ email: "demo@weather.com" }, { username: "demo" }],
    },
  });

  let demoUser;
  if (!existingDemo) {
    demoUser = await prisma.user.create({
      data: {
        email: "demo@weather.com",
        username: "demo",
        password: hashPassword("Password123!"),
        name: "Demo User",
        mobile: {
          code: "+65",
          number: "91234567",
          country: "Singapore",
        },
        active: true,
        isEmailVerified: true,
        superAdmin: false,
        lastSignedInAt: new Date(),
      },
    });

    console.log(`Created demo user with id: ${demoUser.id}`);
  } else {
    demoUser = existingDemo;
    console.log("Demo user already exists, skipping creation");
  }

  // Check if we need to create sample weather reports
  const existingReports = await prisma.weatherReport.count({
    where: {
      userId: demoUser.id,
    },
  });

  if (existingReports === 0) {
    // Generate 10 sample weather reports for the demo user
    const now = new Date();
    const reports = [];

    for (let i = 0; i < 10; i++) {
      // Create reports from the past 10 days
      const reportDate = new Date(now);
      reportDate.setDate(now.getDate() - i);

      // Generate random but realistic weather data for Singapore
      const temperature = 25 + Math.random() * 6; // 25-31°C
      const humidity = 65 + Math.random() * 25; // 65-90%
      const pressure = 1008 + Math.random() * 10; // 1008-1018 hPa
      const cloudCover = Math.random() * 90; // 0-90%

      const report = await prisma.weatherReport.create({
        data: {
          userId: demoUser.id,
          title: `Weather Report ${i + 1}`,
          startTime: reportDate,
          endTime: reportDate,
          avgCloudCover: cloudCover,
          avgHumidity: humidity,
          avgPressure: pressure,
          avgTemperature: temperature,
          dataPointsCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      reports.push(report);
    }

    console.log(`Created ${reports.length} sample weather reports for demo user`);
  } else {
    console.log(`${existingReports} weather reports already exist for demo user, skipping creation`);
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
