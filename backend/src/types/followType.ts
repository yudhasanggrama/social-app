// === DATABASE SHAPES ===
export type UserDbModel = {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
};

// === API RESPONSE DTOs ===
export type UserResponse = {
  id: string;
  username: string;
  name: string;
  avatar: string;
};

export type FollowerResponse = UserResponse & {
  is_following: boolean;
};

// === QUERY TYPES ===
export type FollowQueryType = "followers" | "following";

// === SERVICE INPUTS ===
export type GetFollowListInput = {
  userId: number;
  type: FollowQueryType;
};

export type FollowUserInput = {
  userId: number;
  targetUserId: number;
};

export type UnfollowUserInput = {
  userId: number;
  targetUserId: number;
};

// === SERVICE OUTPUTS ===
export type FollowActionResult =
  | { success: true }
  | { success: false; reason: "USER_NOT_FOUND" };
