import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";

// 1. ดึงรายการบิลทั้งหมด
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ status: 401 });
  await dbConnect();
  const bills = await Bill.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ bills });
}

// 2. สร้างบิลใหม่
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ status: 401 });

  const { roomNumber, month, rent, water, electric } = await req.json();
  await dbConnect();
  
  // เช็คก่อนว่าเดือนนี้ ห้องนี้ มีบิลหรือยัง จะได้ไม่ซ้ำ
  const existingBill = await Bill.findOne({ roomNumber, month });
  if (existingBill) {
      return NextResponse.json({ message: "บิลห้องนี้ประจำเดือนนี้มีอยู่แล้ว" }, { status: 400 });
  }

  const total = Number(rent) + Number(water) + Number(electric);
  const newBill = await Bill.create({ roomNumber, month, rent, water, electric, total, status: "pending" });
  return NextResponse.json(newBill);
}

// 3. อัพเดทสถานะบิล (อนุมัติ)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ status: 401 });
  const { id, status } = await req.json();
  await dbConnect();
  await Bill.findByIdAndUpdate(id, { status });
  return NextResponse.json({ message: "Updated" });
}

// 4. ลบบิล (DELETE) - เพิ่มส่วนนี้เข้าไป
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await dbConnect();
  await Bill.findByIdAndDelete(id);
  
  return NextResponse.json({ message: "Deleted" });
}