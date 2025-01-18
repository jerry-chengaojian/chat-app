import { prisma } from "@/lib/prisma";
import { saltAndHashPassword } from "@/utils/password";
import { ChannelType } from "@prisma/client";

async function main() {
  // Clean up existing data
  await prisma.userChannel.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: "admin",
        password: saltAndHashPassword("admin"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: "root",
        password: saltAndHashPassword("root"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: "alice",
        password: saltAndHashPassword("password"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: "bob",
        password: saltAndHashPassword("password"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: "charlie",
        password: saltAndHashPassword("password"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
  ]);

  // Create channels
  const channels = await Promise.all([
    prisma.channel.create({
      data: {
        name: "general",
        type: ChannelType.public,
      },
    }),
    prisma.channel.create({
      data: {
        name: "random",
        type: ChannelType.public,
      },
    }),
    prisma.channel.create({
      data: {
        name: "private-admins",
        type: ChannelType.private,
      },
    }),
  ]);

  // Create sample messages first and store them
  const generalMessages = await Promise.all([
    prisma.message.create({
      data: {
        content: "Welcome to the general channel!",
        fromUserId: users[0].id,
        channelId: channels[0].id,
      },
    }),
    prisma.message.create({
      data: {
        content: "Hello everyone!",
        fromUserId: users[2].id,
        channelId: channels[0].id,
      },
    }),
  ]);

  const randomMessages = await Promise.all([
    prisma.message.create({
      data: {
        content: "This is a random message",
        fromUserId: users[3].id,
        channelId: channels[1].id,
      },
    }),
  ]);

  const privateMessages = await Promise.all([
    prisma.message.create({
      data: {
        content: "Private admin discussion here",
        fromUserId: users[0].id,
        channelId: channels[2].id,
      },
    }),
  ]);

  // Add users to channels with latest message IDs as clientOffsetId
  await Promise.all([
    // Add all users to general channel
    ...users.map((user) =>
      prisma.userChannel.create({
        data: {
          userId: user.id,
          channelId: channels[0].id,
          clientOffsetId: generalMessages[generalMessages.length - 1].id, // Latest message ID
        },
      })
    ),
    // Add all users to random channel
    ...users.map((user) =>
      prisma.userChannel.create({
        data: {
          userId: user.id,
          channelId: channels[1].id,
          clientOffsetId: randomMessages[randomMessages.length - 1].id, // Latest message ID
        },
      })
    ),
    // Add only admin and root to private channel
    prisma.userChannel.create({
      data: {
        userId: users[0].id,
        channelId: channels[2].id,
        clientOffsetId: privateMessages[privateMessages.length - 1].id, // Latest message ID
      },
    }),
    prisma.userChannel.create({
      data: {
        userId: users[1].id,
        channelId: channels[2].id,
        clientOffsetId: privateMessages[privateMessages.length - 1].id, // Latest message ID
      },
    }),
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
