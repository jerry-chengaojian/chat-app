import { prisma } from "@/lib/prisma";
import { saltAndHashPassword } from "@/utils/password";

async function main() {
  // delete all users
  await prisma.user.deleteMany();

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      username: "admin",
      password: saltAndHashPassword("admin"),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "root",
      password: saltAndHashPassword("root"),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: "user3",
      password: saltAndHashPassword("password3"),
    },
  });

  console.log({ user1, user2, user3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
