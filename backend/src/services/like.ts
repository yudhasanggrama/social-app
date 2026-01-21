import {prisma} from "../prisma/client";

export const toggleLike = async (userId: number, threadId: number) => {
  const existing = await prisma.like.findUnique({
    where: {
      user_id_thread_id: {
        user_id: userId,
        thread_id: threadId,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.like.create({
    data: { user_id: userId, thread_id: threadId },
  });

  return { liked: true };
};

