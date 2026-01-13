"use client";

import { UserAuthNav } from "@/components/user-auth-nav";

interface ServerHeaderAuthSlotProps {
  translations: {
    login: string;
    [key: string]: string | undefined;
  };
}

/**
 * Client component that provides auth-aware UI for ServerHeader.
 * This allows ServerHeader to show logged-in state (logo, name, logout)
 * without making ServerHeader itself a client component.
 */
export function ServerHeaderAuthSlot({ translations }: ServerHeaderAuthSlotProps) {
  return <UserAuthNav translations={translations} />;
}
