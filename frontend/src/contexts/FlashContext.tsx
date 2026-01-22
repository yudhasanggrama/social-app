import { createContext } from "react";
import type { FlashType, Flash } from "@/Types/flash";

export type FlashContextType = {
  show: (type: FlashType, message: string) => void;
  messages: Flash[];
  remove: (id: number) => void;
};

export const FlashContext = createContext<FlashContextType | null>(null);
