import type { DefaultSession } from "next-auth";
import type { Role } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}