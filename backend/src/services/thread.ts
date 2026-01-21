import { prisma } from "../prisma/client";

export const createThread = async (userId: number, content: string, image?: string | null) => {
  
  return prisma.thread.create({
    data: {
      content,
      image : image ?? null,
      created_by: userId,
    },
  });
};

export const getThreads = async (user_id?: number) => {
  return prisma.thread.findMany({
    orderBy: { created_at: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          full_name: true,
          photo_profile: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      likes: user_id
        ? {
            where: { user_id: user_id },
            select: { id: true },
          }
        : false,
    },
  });
};

export const getThreadsFormatted = async (user_id?: number) => {
  const threads = await getThreads(user_id);

  return threads.map((thread) => ({
    id: thread.id,
    content: thread.content,
    created_at: thread.created_at,
    image: thread.image,

    user: {
      id: thread.author.id,
      username: thread.author.username,
      name: thread.author.full_name,
      profile_picture: thread.author.photo_profile,
    },

    likes: thread._count.likes,
    reply: thread._count.replies,

    isLiked: user_id ? thread.likes.length > 0 : false,
  }));
};

