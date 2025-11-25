import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  // 1. ดึงข้อมูลคนล็อกอิน
  const session = await getServerSession(authOptions);

  // 2. ถ้ายังไม่ล็อกอิน -> ดีดไปหน้า Login
  if (!session) {
    redirect("/login");
  }

  // 3. ถ้าล็อกอินแล้ว เช็ค Role เพื่อส่งไปให้ถูกห้อง
  if (session.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }

  // (โค้ดส่วนนี้จะไม่ถูกรัน เพราะโดน redirect ไปก่อนแล้ว)
  return null;
}