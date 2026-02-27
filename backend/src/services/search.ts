import { prisma } from "../prisma/client";

export type SearchUsersParams = {
  keyword: string;
  limit: number;
  meId?: number | null;
};

export async function searchUsersService(params: SearchUsersParams) {
  const { keyword, limit, meId } = params;

  if (!keyword) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: keyword, mode: "insensitive" } },
        { full_name: { contains: keyword, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      username: true,
      full_name: true,
      photo_profile: true,
      _count: { select: { followers: true } },
    },
    take: limit,
    orderBy: { created_at: "desc" },
  });

  let followingSet = new Set<number>();

  if (meId) {
    const following = await prisma.following.findMany({
      where: { follower_id: meId },
      select: { following_id: true },
    });
    followingSet = new Set(following.map((x) => Number(x.following_id)));
  }

  return users.map((u) => ({
    id: String(u.id),
    username: u.username,
    name: u.full_name,
    followers: u._count.followers,
    avatar: u.photo_profile ?? null,
    is_following: meId ? followingSet.has(Number(u.id)) : false,
  }));
}
