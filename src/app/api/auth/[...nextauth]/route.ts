import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; 
import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    // 1. Google Provider (แก้ Error State Cookie แล้ว)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // 👇 บรรทัดนี้สำคัญมากสำหรับการทำใน Localhost
      checks: ['none'], 
    }),

    // 2. Credentials Provider (ล็อกอินปกติ)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        await dbConnect();
        
        // ค้นหาทั้งจาก username หรือ email
        const user = await UserModel.findOne({ 
            $or: [{ username: credentials.username }, { email: credentials.username }] 
        });

        if (!user || !user.password) { 
          throw new Error("User not found or invalid login method");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
          roomNumber: user.roomNumber,
        };
      },
    }),
  ],
  callbacks: {
    // 3. จัดการตอน Google Login (SignIn)
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        try {
          // เช็คว่ามี email นี้ในระบบหรือยัง
          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            // ถ้ายังไม่มี -> สร้างใหม่เลย!
            await UserModel.create({
              username: user.name, // ใช้ชื่อจาก Google
              email: user.email,
              image: user.image,
              role: "user",        // เป็น User ธรรมดา
            });
          }
          return true; // อนุญาตให้ล็อกอิน
        } catch (error) {
          console.log("Error saving user", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
            await dbConnect();
            const dbUser = await UserModel.findOne({ email: user.email });
            if (dbUser) {
                token.id = dbUser._id.toString();
                token.role = dbUser.role;
                token.roomNumber = dbUser.roomNumber;
            }
        } else {
            token.role = (user as any).role;
            token.roomNumber = (user as any).roomNumber;
            token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.roomNumber = token.roomNumber;
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };