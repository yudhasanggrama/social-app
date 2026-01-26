export type FollowQueryType = "followers" | "following";

export type UserDbModel = {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
};

export type UserResponse = {
  id: string;
  username: string;
  name: string;
  avatar: string;
};

export type FollowerResponse = UserResponse & {
  is_following: boolean;
};

export type GetFollowListInput = {
  userId: number;
  type: FollowQueryType;
};

export type FollowUserInput = { userId: number; targetUserId: number };
export type UnfollowUserInput = { userId: number; targetUserId: number };

export type FollowActionResult =
  | { success: true }
  | { success: false; reason: "USER_NOT_FOUND" };

export type SocketFollowChangedPayload = {
  followerId: number;
  targetUserId: number;
  isFollowing: boolean;
  followerUser?: UserResponse;
  targetUser?: UserResponse;
};
