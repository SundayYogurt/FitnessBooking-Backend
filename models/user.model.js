
const mongoose = require("mongoose");

const {Schema, model} = mongoose; //ดึง Schema (กำหนดโครงสร้างข้อมูล) และ model (สร้างตัวแทน collection) ออกจาก mongoose เพื่อใช้งานง่ายขึ้น
const UserSchema = new Schema({
    username:{type:String, required: true, unique: true, min:4},
    password:{type:String, required: true, min: 6},
    email:{type:String, required: true, unique: true},
    phone:{type:String, required: true, unique: true},
    role:{type:String,enum:["user","admin", "trainer"], default: "user"},
    trainerRequest: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none",
  },
},{
        timestamps: true
    })

const UserModel = model("User", UserSchema);

module.exports = UserModel