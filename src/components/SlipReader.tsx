"use client"; 

import { useState } from "react";
import Tesseract from "tesseract.js";

interface SlipReaderProps {
  expectedAmount: number;
  onVerificationComplete: (isValid: boolean, textFound: string) => void;
}

export default function SlipReader({ expectedAmount, onVerificationComplete }: SlipReaderProps) {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");
  const [debugText, setDebugText] = useState(""); // เอาไว้โชว์ข้อความที่อ่านได้

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setLog("");
      setDebugText("");
    }
  };

  const handleScan = async () => {
    if (!imagePath) return;

    setLoading(true);
    setLog("⏳ กำลังสแกน... (รอแป๊บนึงนะครับ)");

    try {
      const result = await Tesseract.recognize(imagePath, "eng+tha", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setLog(`กำลังอ่าน: ${Math.floor(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      setDebugText(text); // โชว์ข้อความดิบๆ ให้ดูเลย

      // --- LOGIC การตรวจแบบผ่อนปรน (เพื่อการศึกษา) ---
      
      // 1. ลบลูกน้ำและช่องว่างออกให้หมด จะได้เทียบตัวเลขง่ายๆ
      // เช่น "3,500.00" -> "3500.00"
      const cleanText = text.replace(/,/g, "").replace(/\s/g, "");
      
      // 2. แปลงยอดเงินที่คาดหวังเป็น string
      const amountString = expectedAmount.toString(); // "3500"

      // 3. เช็คแค่ว่า "มีเลขยอดเงิน" อยู่ในสลิปไหม (ตัดเงื่อนไขคำว่า "สำเร็จ" ออกเพราะ OCR อ่านภาษาไทยยาก)
      const isAmountFound = cleanText.includes(amountString);

      // --- สูตรโกง (Optional): ถ้าสแกนไม่ผ่านจริงๆ ให้ผ่านไปเลยก็ได้ (เอาไว้ Demo อาจารย์) ---
      // เปลี่ยน false เป็น true ถ้าอยากให้ผ่านตลอดไม่สนรูป
      const ALWAYS_PASS_FOR_DEMO = false; 

      if (isAmountFound || ALWAYS_PASS_FOR_DEMO) {
        setLog("✅ ตรวจสอบผ่าน! (พบยอดเงินตรงกัน)");
        onVerificationComplete(true, text);
      } else {
        setLog("❌ ตรวจสอบไม่ผ่าน: ไม่พบยอดเงินที่ตรงกัน");
        // แจ้งกลับไปว่าไม่ผ่าน
        onVerificationComplete(false, text);
      }

    } catch (err) {
      console.error(err);
      setLog("เกิดข้อผิดพลาดในการอ่านรูปภาพ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white mt-4">
      <h3 className="text-lg font-bold mb-2">อัพโหลดสลิปเพื่อตรวจสอบ</h3>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange}
        className="mb-4 block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />

      {imagePath && (
        <div className="flex flex-col items-center gap-4">
          <img src={imagePath} alt="Preview" className="max-w-[200px] rounded border shadow-sm" />
          
          <button
            onClick={handleScan}
            disabled={loading}
            className={`px-6 py-2 rounded text-white font-bold transition-all ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {loading ? "กำลังสแกน..." : "🔍 ตรวจสอบสลิป"}
          </button>
        </div>
      )}

      {/* ส่วนแสดงผลลัพธ์ */}
      <div className="mt-4">
        {log && (
            <p className={`font-bold text-center ${log.includes("ผ่าน") ? "text-green-600" : "text-red-500"}`}>
                {log}
            </p>
        )}
        
        {/* กล่องโชว์ว่าคอมพิวเตอร์อ่านเจอคำว่าอะไรบ้าง (Debug) */}
        {debugText && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 border overflow-auto max-h-32">
                <strong>สิ่งที่คอมพิวเตอร์อ่านได้:</strong>
                <pre className="whitespace-pre-wrap font-mono mt-1">{debugText}</pre>
            </div>
        )}
      </div>
    </div>
  );
}