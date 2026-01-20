import {prisma} from "../prisma/client";

export const createReply = async (
  userId: number,
  threadId: number,
  content: string
) => {
  return prisma.reply.create({
    data: {
      content,
      user_id: userId,
      thread_id: threadId,
    },
  });
};
