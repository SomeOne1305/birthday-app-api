"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/routes/user/user.route.ts
var user_route_exports = {};
__export(user_route_exports, {
  default: () => user_route_default
});
module.exports = __toCommonJS(user_route_exports);
var import_express = require("express");

// middlewares/authenticate-request.ts
var import_dotenv = __toESM(require("dotenv"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// models/user.model.ts
var import_mongoose = require("mongoose");
var userSchema = new import_mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    pass_salt: String,
    verification_token: String,
    valid_for: Date,
    isVerified: Boolean
  },
  { timestamps: true }
);
var User = (0, import_mongoose.model)("User", userSchema);

// middlewares/authenticate-request.ts
import_dotenv.default.config();
var authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      res.status(401).jsend.fail({ code: 401, message: "Missing Bearer token" });
      return;
    }
    const secret = process.env.ACCESS_SECRET;
    if (!secret) throw new Error("JWT secret not configured");
    const decoded = import_jsonwebtoken.default.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).jsend.fail({ code: 401, message: "User not found or deleted" });
      return;
    }
    const {
      verification_token,
      isVerified,
      valid_for,
      password,
      pass_salt,
      ...other
    } = user.toObject();
    const userInReq = { ...other };
    req.user = userInReq;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).jsend.fail({ code: 401, message: "Invalid or expired token" });
    return;
  }
};

// middlewares/validate-body.ts
var import_zod = require("zod");
var validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Validation error",
      errors: import_zod.z.flattenError(result.error).fieldErrors
    });
    return;
  }
  req.body = result.data;
  next();
};

// schemas/user.schema.ts
var import_zod2 = require("zod");
var updatePassSchema = import_zod2.z.object({
  old_password: import_zod2.z.string().min(8),
  new_password: import_zod2.z.string().min(8)
});
var updateMeSchema = import_zod2.z.object({
  first_name: import_zod2.z.string().min(3),
  last_name: import_zod2.z.string().min(3)
});

// models/birthday.model.ts
var import_mongoose2 = require("mongoose");
var birthdaySchema = new import_mongoose2.Schema(
  {
    user: { type: import_mongoose2.Schema.Types.ObjectId, ref: "User", required: true },
    // owner
    name: { type: String, required: true },
    birth_date: { type: Date, required: true },
    relation: {
      type: String,
      enum: [
        "Family",
        "Friend",
        "Colleague",
        "Partner",
        "Acquaintance",
        "Other"
      ],
      default: "Other"
    },
    notes: { type: String }
  },
  { timestamps: true }
);
var Birthday = (0, import_mongoose2.model)("Birthday", birthdaySchema);

// models/session.model.ts
var import_mongoose3 = require("mongoose");
var sessionSchema = new import_mongoose3.Schema(
  {
    user: { type: import_mongoose3.Schema.Types.ObjectId, ref: "User", required: true },
    refresh: { type: String, required: true },
    device_name: { type: String, required: true },
    device_id: { type: String, required: true },
    ip_add: { type: String, required: true },
    ip_location: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true }
  },
  { timestamps: true }
);
var Session = (0, import_mongoose3.model)("Session", sessionSchema);

// utils/hashing-utils.ts
var import_crypto = __toESM(require("crypto"));
var SALT_LENGTH = 16;
var HASH_ALGO = "sha512";
var ITERATIONS = 1e5;
var KEY_LENGTH = 64;
function hashPassword(password) {
  const salt = import_crypto.default.randomBytes(SALT_LENGTH).toString("hex");
  const hash = import_crypto.default.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGO).toString("hex");
  return { salt, hash };
}
function checkNewPassword(password, old_hash, old_salt) {
  const hash = import_crypto.default.pbkdf2Sync(password, old_salt, ITERATIONS, KEY_LENGTH, HASH_ALGO).toString("hex");
  return import_crypto.default.timingSafeEqual(
    Uint8Array.from(Buffer.from(hash, "hex")),
    Uint8Array.from(Buffer.from(old_hash, "hex"))
  );
}
function verifyPassword(password, salt, storedHash) {
  const derivedHash = import_crypto.default.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGO).toString("hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedBuffer = Buffer.from(derivedHash, "hex");
  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }
  return import_crypto.default.timingSafeEqual(
    Uint8Array.from(storedBuffer),
    Uint8Array.from(derivedBuffer)
  );
}

// app/routes/user/user.service.ts
var UserService = {
  async update_pass(dto, req, res) {
    try {
      const user = await User.findOne({ _id: req.user?._id });
      const isCorrectPass = verifyPassword(
        dto.old_password,
        user?.pass_salt,
        user?.password
      );
      if (!isCorrectPass) {
        res.status(400).jsend.fail({ code: 400, message: "Password is incorrect" });
      }
      const isPassReused = checkNewPassword(
        dto.new_password,
        user?.password,
        user?.pass_salt
      );
      if (isPassReused) {
        res.status(400).jsend.fail({
          code: 400,
          message: "New password must not be  same as previous"
        });
        return;
      }
      const { hash, salt } = hashPassword(dto.new_password);
      await user?.updateOne(
        {
          $set: {
            pass_salt: salt,
            password: hash
          }
        },
        { new: true }
      );
      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
      await Session.deleteMany({
        user: req.user?._id,
        ip_add: { $ne: ip }
      });
      res.status(200).jsend.success({
        code: 200,
        message: "Password is updated successfully!"
      });
    } catch (error) {
      throw error;
    }
  },
  async update_user_info(dto, id, res) {
    try {
      await User.findByIdAndUpdate(id, { ...dto }, { new: true });
      return res.status(200).jsend.success({ code: 204, message: "User data is updated" });
    } catch (error) {
      throw error;
    }
  },
  async delete_user(user_id) {
    try {
      await Session.deleteMany({
        user: user_id
      });
      await Birthday.deleteMany({
        user: user_id
      });
      await User.deleteOne({
        _id: user_id
      });
    } catch (error) {
      throw error;
    }
  }
};

// app/routes/user/user.route.ts
var router = (0, import_express.Router)();
router.get(
  "/me",
  authenticateToken,
  (req, res, _next) => {
    try {
      res.status(200).jsend.success({ code: 200, message: "Data is ready", data: req.user });
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error
      });
    }
  }
);
router.put(
  "/update-password",
  validate(updatePassSchema),
  authenticateToken,
  async (req, res, _next) => {
    try {
      await UserService.update_pass(req.body, req, res);
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error
      });
    }
  }
);
router.put(
  "/update-me",
  validate(updateMeSchema),
  authenticateToken,
  async (req, res, _next) => {
    try {
      await UserService.update_user_info(req.body, req.user?._id, res);
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error
      });
    }
  }
);
router.delete(
  "/delete-me",
  authenticateToken,
  async (req, res, _next) => {
    try {
      await UserService.delete_user(req.user?._id);
      res.status(200).jsend.success({ code: 200, message: "All data is cleared !" });
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error
      });
    }
  }
);
var user_route_default = router;
