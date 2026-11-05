import type { DefaultSession } from "next-auth";
import type { Role, SellerStatus } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; sellerStatus?: SellerStatus } & DefaultSession["user"];
  }
}