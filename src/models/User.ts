import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true }, // Google จะใช้ชื่อจริงมาใส่แทน
    email: { type: String, unique: true },      // เพิ่มเก็บ email ด้วย
    password: { type: String, required: false }, // <-- แก้ตรงนี้: ไม่บังคับใส่ password แล้ว
    role: { type: String, default: "user" },
    image: { type: String },                    // เก็บรูปโปรไฟล์จาก Google
    roomNumber: { type: String },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;