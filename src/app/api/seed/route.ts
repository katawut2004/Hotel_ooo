import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";

export async function GET() {
  await dbConnect();
  
  // ลบบิลเก่าออกก่อน (ถ้าอยากเริ่มใหม่)
  // await Bill.deleteMany({}); 

  await Bill.create({
    roomNumber: "101", // ใส่เลขห้องที่คุณใช้ Login อยู่
    month: "2023-11",
    rent: 3000,
    water: 100,
    electric: 400,
    total: 3500, // ยอดรวม
    status: "pending"
  });

  return NextResponse.json({ message: "Seeded Bill for Room 101" });
}