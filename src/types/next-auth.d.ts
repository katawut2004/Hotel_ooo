import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    roomNumber?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      roomNumber?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roomNumber?: string;
  }
}