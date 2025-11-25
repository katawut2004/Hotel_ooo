import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import UserModel from "@/models/User"; // ใช้ @ ได้แล้ว

export async function POST(req: Request) {
  try {
    const { username, password, role, roomNumber } = await req.json();
    await dbConnect();

    // เข้ารหัส Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง User ใหม่
    await UserModel.create({
      username,
      password: hashedPassword,
      role,
      roomNumber,
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}