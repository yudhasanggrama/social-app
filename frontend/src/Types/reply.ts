import type { ThreadUser } from "./thread";

export type Reply = {
  id: number;
  content: string;
  created_at: string;
  user: ThreadUser;
};