"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";      // <-- บรรทัดนี้ของคุณหายไป
import { useRouter } from "next/navigation";   // <-- บรรทัดนี้ก็หายไปครับ

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ฟังก์ชันล็อกอินด้วย Username/Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "admin") {
        router.push("/admin"); 
      } else {
        router.push("/dashboard"); 
      }
      
      router.refresh();

    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  };

  // ฟังก์ชันล็อกอินด้วย Google
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">เข้าสู่ระบบหอพัก</h2>
          <p className="text-gray-500 mt-2">เลือกวิธีการเข้าสู่ระบบ</p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username (เลขห้อง หรือ Admin)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น 101 หรือ admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {loading ? "กำลังโหลด..." : "เข้าสู่ระบบด้วยรหัสผ่าน"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">หรือ</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 flex justify-center items-center gap-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5" />
          เข้าสู่ระบบด้วย Google
        </button>

      </div>
    </div>
  );
}