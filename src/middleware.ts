import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // ดึง Role ของคนล็อกอินมาเช็ค
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    console.log(`User Role: ${role}, Trying to access: ${path}`);

    // กฏที่ 1: ถ้าเป็น User ธรรมดา ห้ามเข้าหน้า /admin
    if (path.startsWith("/admin") && role !== "admin") {
      // ดีดกลับไปหน้า Dashboard ของตัวเอง
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // กฏที่ 2: ถ้าเป็น Admin จะเข้าหน้า User ก็ได้ หรือจะให้เด้งไป Admin ก็ได้
    // (ในที่นี้ปล่อยให้เข้าได้ หรือถ้าอยากบังคับก็เขียนเพิ่มได้ครับ)
  },
  {
    callbacks: {
      // ต้องมี Token (ล็อกอินแล้ว) ถึงจะผ่านได้
      authorized: ({ token }) => !!token,
    },
  }
);

// กำหนดว่า Middleware นี้จะทำงานที่หน้าไหนบ้าง
export const config = { 
  matcher: [
    "/dashboard/:path*", // ทุกหน้าใน dashboard
    "/admin/:path*"      // ทุกหน้าใน admin
  ] 
};