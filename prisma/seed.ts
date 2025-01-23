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
        username: "小明",
        password: saltAndHashPassword("password"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: "小红",
        password: saltAndHashPassword("password"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: "小张",
        password: saltAndHashPassword("password"),
        isOnline: true,
        lastPing: new Date(),
      },
    }),
  ]);

  // Create public group channels
  const publicChannels = await Promise.all([
    prisma.channel.create({
      data: {
        name: "技术讨论群",
        type: ChannelType.public,
      },
    }),
    prisma.channel.create({
      data: {
        name: "项目协作群",
        type: ChannelType.public,
      },
    }),
    prisma.channel.create({
      data: {
        name: "闲聊群",
        type: ChannelType.public,
      },
    }),
  ]);

  // Create private one-on-one channels
  const privateChannels = await Promise.all(
    users.slice(1).map((user) =>
      prisma.channel.create({
        data: {
          name: `管理员和${user.username}的私聊`,
          type: ChannelType.private,
        },
      })
    )
  );

  const allChannels = [...publicChannels, ...privateChannels];

  // Generate 100 messages for each channel
  const messagePromises = allChannels.map(async (channel) => {
    const isPrivate = channel.type === ChannelType.private;
    const channelUsers = isPrivate
      ? [users[0], users[users.findIndex((u) => channel.name?.includes(u.username))]]
      : users;

    const messages = Array.from({ length: 100 }, (_, i) => {
      const userIndex = i % channelUsers.length;
      const user = channelUsers[userIndex];
      
      let content = '';
      if (i === 0) {
        content = `欢迎来到${channel.name}！`;
      } else if (isPrivate) {
        content = `私聊消息 #${i}: 来自${user.username}的私密消息`;
      } else {
        content = `群聊消息 #${i}: ${user.username}在${channel.name}中的发言`;
      }

      return {
        content,
        fromUserId: user.id,
      };
    });

    return Promise.all(
      messages.map((msg) =>
        prisma.message.create({
          data: {
            content: msg.content,
            fromUserId: msg.fromUserId,
            channelId: channel.id,
          },
        })
      )
    );
  });

  const allMessages = await Promise.all(messagePromises);

  // Add users to channels
  const userChannelPromises = allChannels.map((channel) => {
    if (channel.type === ChannelType.private) {
      // For private channels, add admin and the specific user
      const otherUser = users.find((u) => channel.name?.includes(u.username));
      return Promise.all([
        prisma.userChannel.create({
          data: {
            userId: users[0].id,
            channelId: channel.id,
            clientOffsetId: allMessages[allChannels.indexOf(channel)][99].id,
          },
        }),
        prisma.userChannel.create({
          data: {
            userId: otherUser!.id,
            channelId: channel.id,
            clientOffsetId: allMessages[allChannels.indexOf(channel)][99].id,
          },
        }),
      ]);
    }

    // For public channels, add all users
    return Promise.all(
      users.map((user) =>
        prisma.userChannel.create({
          data: {
            userId: user.id,
            channelId: channel.id,
            clientOffsetId: allMessages[allChannels.indexOf(channel)][99].id,
          },
        })
      )
    );
  });

  await Promise.all(userChannelPromises.flat());

  console.log("聊天数据创建成功！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
