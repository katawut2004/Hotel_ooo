"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    roomNumber: "",
    month: "2023-11",
    rent: 3000,
    water: 0,
    electric: 0,
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchBills();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session]);

  const fetchBills = async () => {
    const res = await fetch("/api/admin/bills");
    const data = await res.json();
    setBills(data.bills || []);
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`ยืนยันสร้างบิลให้ห้อง ${formData.roomNumber}?`)) return;

    const res = await fetch("/api/admin/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
        alert("สร้างบิลเรียบร้อย!");
        fetchBills();
        setFormData({ ...formData, water: 0, electric: 0 }); // reset แค่ค่าน้ำไฟ
    } else {
        alert("เกิดข้อผิดพลาด หรือบิลซ้ำ");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch("/api/admin/bills", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchBills();
  };

  // ฟังก์ชันลบบิล
  const deleteBill = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบิลนี้?")) return;
    
    await fetch(`/api/admin/bills?id=${id}`, {
        method: "DELETE",
    });
    fetchBills();
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">👮‍♂️ Admin Dashboard</h1>
          <button onClick={() => router.push("/api/auth/signout")} className="text-red-600 underline">ออกจากระบบ</button>
        </div>

        {/* ฟอร์มเพิ่มบิล */}
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">📝 ออกบิลค่าเช่า</h2>
            <form onSubmit={handleCreateBill} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">เลขห้อง</label>
                    <input type="text" className="w-full p-2 border rounded" required value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">เดือน</label>
                    <input type="month" className="w-full p-2 border rounded" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">ค่าห้อง</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.rent} onChange={(e) => setFormData({...formData, rent: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">ค่าน้ำ</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.water} onChange={(e) => setFormData({...formData, water: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">ค่าไฟ</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.electric} onChange={(e) => setFormData({...formData, electric: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">+ เพิ่ม</button>
                </div>
            </form>
        </div>

        {/* ตารางรายการบิล */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">ห้อง</th>
                <th className="p-3">เดือน</th>
                <th className="p-3">ยอดรวม</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3">สลิป</th>
                <th className="p-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold">{bill.roomNumber}</td>
                  <td className="p-3">{bill.month}</td>
                  <td className="p-3 font-bold text-blue-600">{bill.total.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : bill.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="p-3">
                      {bill.slipImage && <a href={bill.slipImage} target="_blank" className="text-blue-500 underline text-sm">ดูรูป</a>}
                  </td>
                  <td className="p-3 flex gap-2">
                    {bill.status === 'paid' && (
                      <button onClick={() => updateStatus(bill._id, 'verified')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">อนุมัติ</button>
                    )}
                    {/* ปุ่มลบ */}
                    <button onClick={() => deleteBill(bill._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}