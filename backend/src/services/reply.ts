import { threadId } from "worker_threads";
import {prisma} from "../prisma/client";

export const getReplies = async () => {
  const replies = await prisma.reply.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      content: true,
      created_at: true,
      thread_id: true,
      users: {
        select: {
          id: true,
          username: true,
          full_name: true,
          photo_profile: true,
        },
      },
    },
  });

  return replies.map((r) => ({
    id: r.id,
    thread_id: r.thread_id,
    content: r.content,
    created_at: r.created_at,
    user: {
      id: r.users.id,
      username: r.users.username,
      name: r.users.full_name,
      profile_picture: r.users.photo_profile,
    },
  }));
};

export const createReply = async (
  userId: number,
  threadId: number,
  content: string
) => {
  const r = await prisma.reply.create({
    data: {
      content,
      user_id: userId,
      thread_id: threadId,
    },
    select: {
      id: true,
      content: true,
      created_at: true,
      thread_id: true,
      users: {
        select: {
          id: true,
          username: true,
          full_name: true,
          photo_profile: true,
        },
      },
    },
  });
  
  return {
    id: r.id,
    thread_id: r.thread_id,
    content: r.content,
    created_at: r.created_at,
    user: {
      id: r.users.id,
      username: r.users.username,
      name: r.users.full_name,
      profile_picture: r.users.photo_profile,
    },
  };
};


export const getRepliesByThreadId = async (threadId: number) => {

  const replies = await prisma.reply.findMany({
    where: { thread_id: threadId },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      content: true,
      created_at: true,
      users: {
        select: {
          id: true,
          username: true,
          full_name: true,
          photo_profile: true,
        },
      },
    },
  });

  return {
    replies: replies.map((r) => ({
      id: r.id,
      content: r.content,
      created_at: r.created_at,
      user: {
        id: r.users.id,
        username: r.users.username,
        name: r.users.full_name,
        profile_picture: r.users.photo_profile,
      },
    })),
  };
};


