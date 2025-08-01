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

// app/routes/auth/auth.service.ts
var auth_service_exports = {};
__export(auth_service_exports, {
  AuthService: () => AuthService
});
module.exports = __toCommonJS(auth_service_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_useragent = __toESM(require("useragent"));

// mail/mailer.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_config = require("dotenv/config");
var Mailer = import_nodemailer.default.createTransport({
  service: "Mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS
  }
});
var mailer_default = Mailer;

// models/session.model.ts
var import_mongoose = require("mongoose");
var sessionSchema = new import_mongoose.Schema(
  {
    user: { type: import_mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
var Session = (0, import_mongoose.model)("Session", sessionSchema);

// models/user.model.ts
var import_mongoose2 = require("mongoose");
var userSchema = new import_mongoose2.Schema(
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
var User = (0, import_mongoose2.model)("User", userSchema);

// utils/generate-token.ts
var import_crypto = __toESM(require("crypto"));
function createToken(bytesLength = 32) {
  return import_crypto.default.randomBytes(bytesLength).toString("hex");
}

// utils/get-ip-info.ts
var import_axios = __toESM(require("axios"));
async function getIPInfo(ip) {
  try {
    const url = `https://ipapi.co/${ip}/json/`;
    const response = await import_axios.default.get(url);
    return {
      ip_add: ip,
      ip_location: `${response.data?.region}, ${response.data?.country}`,
      longitude: response.data?.longitude,
      latitude: response.data?.latitude
    };
  } catch (error) {
    console.error("Failed to fetch IP info:", error);
    return null;
  }
}

// utils/hashing-utils.ts
var import_crypto2 = __toESM(require("crypto"));
var SALT_LENGTH = 16;
var HASH_ALGO = "sha512";
var ITERATIONS = 1e5;
var KEY_LENGTH = 64;
function hashPassword(password) {
  const salt = import_crypto2.default.randomBytes(SALT_LENGTH).toString("hex");
  const hash = import_crypto2.default.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGO).toString("hex");
  return { salt, hash };
}
function verifyPassword(password, salt, storedHash) {
  const derivedHash = import_crypto2.default.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGO).toString("hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedBuffer = Buffer.from(derivedHash, "hex");
  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }
  return import_crypto2.default.timingSafeEqual(
    Uint8Array.from(storedBuffer),
    Uint8Array.from(derivedBuffer)
  );
}

// app/routes/auth/auth.service.ts
var REFRESH_SECRET_CODE = process.env.REFRESH_SECRET;
var ACCESS_SECRET_CODE = process.env.ACCESS_SECRET;
var AuthService = {
  async createUser(data, res) {
    try {
      const token = createToken();
      const user = await User.findOne({
        email: data.email
      });
      if (user && user.isVerified)
        return res.status(400).jsend.fail({
          code: 400,
          message: "User had already been registered !"
        });
      if (!user) {
        await User.create({
          ...data,
          last_name: "NULL",
          first_name: "NULL",
          isVerified: false,
          verification_token: token,
          valid_for: Date.now() + 18e5,
          password: "NOT_SET",
          pass_salt: "NO_SALT"
        });
      }
      await user?.updateOne(
        { $set: { verification_token: token } },
        { new: true }
      );
      await mailer_default.sendMail({
        to: data.email,
        from: `"Birthmark" <${process.env.MAILER_USER}>`,
        // ✅ valid sender
        subject: "Please verify your account",
        html: `<a href="http://localhost:4000/verify/${token}">Please verify</a>`
      });
    } catch (error) {
      throw error;
    }
  },
  async verifyUser({ token }, res) {
    try {
      const user = await User.findOne({
        verification_token: token,
        valid_for: { $gt: Date.now() }
      });
      if (!user)
        return res.status(400).jsend.fail({ code: 400, message: "Invalid or expired token" });
      const new_token = createToken(16);
      user.isVerified = true;
      user.verification_token = new_token;
      user.valid_for = void 0;
      await user.save();
      res.status(200).jsend.success({
        code: 200,
        message: "Successfully verified !",
        data: { token: new_token }
      });
    } catch (error) {
      throw error;
    }
  },
  async fill_user(dto, req, res) {
    try {
      const { token, password, ...data } = dto;
      const user = await User.findOne({
        isVerified: true,
        verification_token: dto.token,
        valid_for: void 0
      });
      if (!user)
        return res.status(400).jsend.fail({
          code: 400,
          message: "Error occured on dealing with user"
        });
      const { hash, salt } = hashPassword(password);
      const update = {
        ...data,
        password: hash,
        pass_salt: salt,
        verification_token: void 0
      };
      await user.updateOne({
        $set: update,
        $unset: { verification_token: "" }
      });
      await user.save();
      const PAYLOAD = {
        id: user._id.toString()
      };
      const accessToken = import_jsonwebtoken.default.sign(PAYLOAD, ACCESS_SECRET_CODE, {
        expiresIn: "15m"
      });
      const refreshToken = import_jsonwebtoken.default.sign(PAYLOAD, REFRESH_SECRET_CODE, {
        expiresIn: "7d"
      });
      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
      const agent = import_useragent.default.parse(req.headers["user-agent"] || "");
      const deviceName = `${agent.family} ${agent.major}`;
      const deviceId = req.headers["user-agent"] || "";
      const ipData = await getIPInfo(ip);
      if (ipData) {
        await Session.create({
          device_name: deviceName,
          device_id: deviceId,
          refresh: refreshToken,
          user: user._id,
          ...ipData
        });
      }
      const updatedUser = await User.findById(user._id);
      const { _id, first_name, last_name, email, createdAt, updatedAt } = updatedUser;
      res.cookie("refresh_token", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        sameSite: "strict",
        httpOnly: true,
        secure: true
      });
      res.status(200).jsend.success({
        code: 200,
        message: "User's data is ready !",
        data: {
          _id,
          first_name,
          last_name,
          email,
          access_token: accessToken,
          createdAt,
          updatedAt
        }
      });
    } catch (error) {
      throw error;
    }
  },
  async log_in(dto, req, res) {
    try {
      const user = await User.findOne({ email: dto.email });
      if (!user) {
        res.status(400).jsend.fail({ code: 400, message: "Invalid credentials" });
        return;
      }
      const { pass_salt, password: hashedPassword } = user;
      const isCorrectPass = verifyPassword(
        dto.password,
        pass_salt,
        hashedPassword
      );
      if (!isCorrectPass) {
        res.status(400).jsend.fail({ code: 400, message: "Invalid credentials" });
        return;
      }
      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
      const agent = import_useragent.default.parse(req.headers["user-agent"] || "");
      const deviceName = `${agent.family} ${agent.major}`;
      const deviceId = req.headers["user-agent"] || "";
      const ipData = await getIPInfo(ip);
      console.log(ip);
      let session = await Session.findOne({ user: user._id, ip_add: ip });
      const PAYLOAD = { id: user._id.toString() };
      const accessToken = import_jsonwebtoken.default.sign(PAYLOAD, ACCESS_SECRET_CODE, {
        expiresIn: "15m"
      });
      const refreshToken = import_jsonwebtoken.default.sign(PAYLOAD, REFRESH_SECRET_CODE, {
        expiresIn: "7d"
      });
      if (!session) {
        if (ipData) {
          session = await Session.create({
            ...ipData,
            device_name: deviceName,
            device_id: deviceId,
            refresh: refreshToken,
            user: user._id,
            ip_add: ip
          });
        }
      } else {
        await Session.updateOne(
          { _id: session._id },
          { refresh: refreshToken }
        );
      }
      res.cookie("refresh_token", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        sameSite: "strict",
        httpOnly: true,
        secure: true
      });
      const { _id, first_name, last_name, email, createdAt, updatedAt } = user;
      res.status(200).jsend.success({
        code: 200,
        message: "User's data is ready!",
        data: {
          _id,
          first_name,
          last_name,
          email,
          access_token: accessToken,
          createdAt,
          updatedAt
        }
      });
    } catch (error) {
      throw error;
    }
  },
  async refresh_user_token(req, res) {
    try {
      const token = req.cookies?.["refresh_token"];
      if (!token)
        return res.status(400).jsend.fail({ code: 400, message: "Unauthorized access" });
      import_jsonwebtoken.default.verify(
        token,
        REFRESH_SECRET_CODE,
        async (err, decoded) => {
          if (err) {
            return res.status(403).jsend.fail({
              code: 403,
              message: "Bad request",
              details: err.message
            });
          }
          const payload = decoded;
          const session = await Session.findOne({
            user: payload.id
          });
          if (!session) return res.status(400).clearCookie("refresh_token");
          const accessToken = import_jsonwebtoken.default.sign({ id: payload.id }, ACCESS_SECRET_CODE, {
            expiresIn: "15m"
          });
          return res.status(200).jsend.success({
            code: 200,
            message: "Token refreshed successfully",
            data: {
              access_token: accessToken
            }
          });
        }
      );
    } catch (error) {
      throw error;
    }
  },
  async forgot_password({ email }, res) {
    try {
      const user = await User.findOne({
        email
      });
      if (!user)
        return res.status(404).jsend.fail({
          code: 404,
          message: "User not found with this credential"
        });
      const token = createToken(24);
      await user.updateOne(
        {
          $set: { verification_token: token }
        },
        { new: true }
      );
      await mailer_default.sendMail({
        to: email,
        from: `"Birthmark" <${process.env.MAILER_USER}>`,
        // ✅ valid sender
        subject: "Reset password",
        html: `<a href="http://localhost:4000/reset/${token}">Please click link</a>`
      });
      res.status(200).jsend.success({
        code: 200,
        message: "Reset link is sent to " + email
      });
    } catch (error) {
      throw error;
    }
  },
  async change_password(dto, res) {
    try {
      const user = await User.findOne({
        verification_token: dto.token
      });
      if (!user)
        return res.status(400).jsend.fail({ code: 400, message: "Invalid token" });
      const { salt, hash } = hashPassword(dto.password);
      await user.updateOne(
        {
          $set: {
            password: hash,
            pass_salt: salt,
            verification_token: ""
          }
        },
        { new: true }
      );
      res.status(200).jsend.success({
        code: 200,
        message: "Password changed successfully "
      });
    } catch (error) {
      throw error;
    }
  },
  async log_out(req, res) {
    try {
      const refresh_token = req.cookies?.["refresh_token"];
      if (!refresh_token)
        return res.status(400).jsend.fail({
          code: 400,
          message: "Invalid or expired token request"
        });
      import_jsonwebtoken.default.verify(
        refresh_token,
        REFRESH_SECRET_CODE,
        async (err, decoded) => {
          if (err)
            return res.status(403).jsend.fail({
              code: 403,
              message: "Bad request",
              details: err.message
            });
          const payload = decoded;
          await Session.findOneAndDelete({
            user: payload.id
          });
          res.clearCookie("refresh_token");
          res.status(200).jsend.success({ code: 200, message: "Logged out successfully !" });
        }
      );
    } catch (error) {
      throw error;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthService
});
