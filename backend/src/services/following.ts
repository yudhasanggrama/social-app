import {prisma} from "../prisma/client";

export const toggleFollow = async (followerId: number, followingId: number) => {
  const existing = await prisma.following.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId,
      },
    },
  });

  if (existing) {
    return prisma.following.delete({ where: { id: existing.id } });
  }

  return prisma.following.create({
    data: {
      follower_id: followerId,
      following_id: followingId,
    },
  });
};
