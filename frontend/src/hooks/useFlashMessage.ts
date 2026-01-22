import { useContext } from "react";
import { FlashContext } from "@/contexts/FlashContext";

export function useFlashMessage() {
  const ctx = useContext(FlashContext);
  if (!ctx) {
    throw new Error("useFlashMessage must be used inside FlashMessageProvider");
  }
  return ctx;
}
