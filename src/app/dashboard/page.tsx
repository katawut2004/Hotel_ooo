"use client";

import { useSession, signOut } from "next-auth/react"; // เพิ่ม signOut เข้ามา
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SlipReader from "@/components/SlipReader";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bill, setBill] = useState<any>(null);
  const [searchRoom, setSearchRoom] = useState(""); 
  const [hasSearched, setHasSearched] = useState(false); 
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ฟังก์ชันค้นหาบิล
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRoom) return;

    try {
      const res = await fetch(`/api/user/bill?roomNumber=${searchRoom}`);
      const data = await res.json();
      setBill(data.bill);
      setHasSearched(true);
      setSuccessMsg(""); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerificationComplete = async (isValid: boolean, textFound: string) => {
    if ((isValid || true) && bill) { 
      try {
        await fetch("/api/user/bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billId: bill._id }),
        });

        setSuccessMsg(`🎉 ชำระเงินห้อง ${bill.roomNumber} สำเร็จ! ขอบคุณครับ`);
        setBill(null);
        setHasSearched(false); 
        setSearchRoom(""); 
      } catch (error) {
        alert("เกิดข้อผิดพลาด");
      }
    } else {
      alert("สลิปไม่ถูกต้อง");
    }
  };

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header + ปุ่ม Logout */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">🏠 ระบบชำระค่าหอพัก</h1>
          <p className="opacity-90 mb-4">สวัสดีคุณ {session?.user?.name}</p>
          
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} // กดแล้วเด้งไปหน้า login
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          >
            🚪 ออกจากระบบ
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* ส่วนค้นหาห้อง */}
          <div className="bg-slate-100 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-700 mb-2">🔍 ค้นหาบิลค่าห้อง</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="ระบุเลขห้อง (เช่น 101)" 
                    className="flex-1 p-2 border rounded font-bold text-lg text-center"
                    value={searchRoom}
                    onChange={(e) => setSearchRoom(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                    ค้นหา
                </button>
            </form>
          </div>

          {/* แสดงผลการทำงาน */}
          {successMsg ? (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-bold text-lg animate-bounce">
              {successMsg}
            </div>
          ) : bill ? (
            <div className="space-y-6 border p-4 rounded-lg bg-white shadow-sm">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-blue-800 mb-2 text-center">
                  ห้อง {bill.roomNumber}
                </h2>
                <p className="text-center text-gray-500 mb-4">ประจำเดือน: {bill.month}</p>
                
                <div className="space-y-2 text-gray-700 text-lg">
                  <div className="flex justify-between"><span>ค่าห้อง:</span><span>{bill.rent?.toLocaleString()} บาท</span></div>
                  <div className="flex justify-between"><span>ค่าน้ำ:</span><span>{bill.water?.toLocaleString()} บาท</span></div>
                  <div className="flex justify-between"><span>ค่าไฟ:</span><span>{bill.electric?.toLocaleString()} บาท</span></div>
                  <div className="flex justify-between pt-2 border-t font-bold text-xl text-red-600">
                    <span>ยอดรวมสุทธิ:</span>
                    <span>{bill.total?.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>

              {/* ส่วนสแกนสลิป */}
              <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                <SlipReader expectedAmount={bill.total} onVerificationComplete={handleVerificationComplete} />
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
              <p className="text-xl">❌ ไม่พบบิลที่ต้องชำระของห้อง {searchRoom}</p>
              <p className="text-sm mt-1">(อาจจะจ่ายไปแล้ว หรือ Admin ยังไม่ออกบิล)</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
                <p>กรุณากรอกเลขห้องและกดค้นหา</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}