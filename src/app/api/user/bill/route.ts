import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";

// 1. ค้นหาบิลตามเลขห้อง (รับค่าจาก ?roomNumber=...)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const roomNumber = searchParams.get("roomNumber"); // รับค่าที่ส่งมา

  if (!roomNumber) {
    return NextResponse.json({ message: "กรุณาระบุเลขห้อง" }, { status: 400 });
  }

  await dbConnect();

  // หาบิลที่ยังไม่จ่าย (pending) ของห้องที่ระบุ
  const bill = await Bill.findOne({ 
    roomNumber: roomNumber,
    status: "pending" 
  }).sort({ createdAt: -1 });

  // ถ้าไม่เจอก็ส่งค่าว่างกลับไป
  return NextResponse.json({ bill });
}

// 2. อัพเดทสถานะเมื่อจ่ายเงินเสร็จ (POST) - อันนี้เหมือนเดิม
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { billId, slipImage } = await req.json();
  await dbConnect();

  await Bill.findByIdAndUpdate(billId, {
    status: "paid",
    slipImage: slipImage || "",
  });

  return NextResponse.json({ message: "Payment successful" });
}