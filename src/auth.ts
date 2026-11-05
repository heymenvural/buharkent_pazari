import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, type Role } from "@/models/User";
import { loginSchema } from "@/lib/validation/auth";
import { rateLimit } from "@/lib/rateLimit";

class RateLimited extends CredentialsSignin { code = "rate_limited"; }
class EmailUnverified extends CredentialsSignin { code = "email_unverified"; }
class SellerPending extends CredentialsSignin { code = "seller_pending"; }
class SellerRejected extends CredentialsSignin { code = "seller_rejected"; }

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/giris", error: "/giris" },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!rateLimit(`login:${ip}:${email}`, 5, 15 * 60_000)) throw new RateLimited();

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user?.passwordHash) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;

        // Durum kontrolleri şifre doğrulandıktan SONRA yapılır (hesap durumu dışarıdan sorgulanamaz)
        const isAdmin = adminEmails().includes(email);
        if (!isAdmin && user.role === "seller" && user.sellerStatus !== "approved") {
          throw user.sellerStatus === "rejected" ? new SellerRejected() : new SellerPending();
        }
        if (!isAdmin && user.role === "buyer" && !user.emailVerified) throw new EmailUnverified();

        user.lastLoginAt = new Date();
        await user.save();
        return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified === false) return false;

      await connectDB();
      const email = profile.email.toLowerCase();
      const image = typeof profile.picture === "string" ? profile.picture.slice(0, 500) : undefined;
      await User.updateOne(
        { email },
        {
          $setOnInsert: { name: (profile.name ?? email.split("@")[0]).slice(0, 80), email, role: "buyer" },
          $set: { lastLoginAt: new Date(), ...(image ? { image } : {}) },
          $addToSet: { providers: "google" },
        },
        { upsert: true }
      );

      const user = await User.findOne({ email });
      if (user && !user.emailVerified) {
        user.emailVerified = new Date(); // Google e-postayı zaten doğruluyor
        await user.save();
      }
      if (user && user.role === "seller" && user.sellerStatus !== "approved" && !adminEmails().includes(email)) {
        return `/giris?tab=uretici&error=${user.sellerStatus === "rejected" ? "SellerRejected" : "SellerPending"}`;
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user || trigger === "update") {
        await connectDB();
        const email = (token.email ?? user?.email ?? "").toLowerCase();
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          if (adminEmails().includes(email) && dbUser.role !== "admin") {
            dbUser.role = "admin";
            await dbUser.save();
          }
          token.uid = dbUser._id.toString();
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = ((token.role as Role) ?? "buyer") as Role;
      }
      return session;
    },
  },
});