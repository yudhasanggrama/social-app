import { prisma } from "../prisma/client";

export const createThread = async (userId: number, content: string, image?: string) => {
  return prisma.thread.create({
    data: {
      content,
      image,
      created_by: userId,
    },
  });
};

export const getThreads = async () => {
  return prisma.thread.findMany({
    orderBy: { created_at: "desc" },
    include: {
      author: {
        select: {
          id:true,
          username:true,
          full_name:true
        }
      },
      likes:true,
      replies: true,
       _count: {
        select: {
          likes: true,
          replies:true
        }
      },
    }
  });
};
