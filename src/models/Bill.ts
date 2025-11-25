import mongoose, { Schema, models } from "mongoose";

const billSchema = new Schema(
  {
    roomNumber: { type: String, required: true },
    month: { type: String, required: true }, // เช่น "2023-11"
    rent: { type: Number, required: true }, // ค่าห้อง
    water: { type: Number, default: 0 },    // ค่าน้ำ
    electric: { type: Number, default: 0 }, // ค่าไฟ
    total: { type: Number, required: true }, // ยอดรวม
    status: { type: String, default: "pending" }, // pending, paid, verified
    slipImage: { type: String }, // URL ของรูปสลิปที่อัพโหลด
  },
  { timestamps: true }
);

const Bill = models.Bill || mongoose.model("Bill", billSchema);
export default Bill;