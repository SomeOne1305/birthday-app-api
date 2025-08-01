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

// app/routes/birthday/birthday.route.ts
var birthday_route_exports = {};
__export(birthday_route_exports, {
  default: () => birthday_route_default
});
module.exports = __toCommonJS(birthday_route_exports);
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

// schemas/birthday.schema.ts
var import_zod2 = require("zod");
var createDateSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(3),
  birth_date: import_zod2.z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? void 0 : date;
    }
    return void 0;
  }, import_zod2.z.date()),
  relation: import_zod2.z.enum([
    "Family",
    "Friend",
    "Colleague",
    "Partner",
    "Acquaintance",
    "Other"
  ]),
  note: import_zod2.z.string().min(3)
});

// app/routes/birthday/birthday.service.ts
var import_mongoose3 = __toESM(require("mongoose"));

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

// app/routes/birthday/birthday.service.ts
var BirthdayService = {
  async get_dates(user_id, res) {
    try {
      const dates = await Birthday.find({ user: user_id });
      if (dates.length === 0)
        return res.status(200).jsend.success({ code: 200, message: "Data is ready", data: [] });
      res.status(200).jsend.success({
        code: 200,
        message: "Data is ready",
        data: dates.map((date) => {
          const { user, ...other } = date.toObject();
          return { ...other };
        })
      });
    } catch (error) {
      throw error;
    }
  },
  async create_date(dto, user_id, res) {
    try {
      const birthday = await Birthday.findOne({ name: dto.name });
      if (birthday)
        return res.status(409).jsend.fail({
          code: 409,
          message: "You already created a birthday entry for this person."
        });
      await Birthday.create({
        ...dto,
        user: user_id
      });
      res.status(200).jsend.success({ code: 200, message: "Added successfully !" });
    } catch (error) {
      throw error;
    }
  },
  async delete_date(user_id, date_id, res) {
    try {
      if (!import_mongoose3.default.Types.ObjectId.isValid(date_id)) {
        return res.status(400).jsend.fail({ code: 400, message: "Invalid ID format" });
      }
      const birthday = await Birthday.findOne({
        user: user_id,
        _id: date_id
      });
      if (!birthday)
        return res.status(403).jsend.fail({ code: 403, message: "Action is not permitted" });
      const result = await Birthday.deleteOne({ _id: date_id });
      if (result.deletedCount === 0) {
        return res.status(500).jsend.error({ code: 500, message: "Failed to delete entry" });
      }
      res.status(200).jsend.success({ code: 200, message: "Deleted successfully !" });
    } catch (error) {
      throw error;
    }
  }
};

// app/routes/birthday/birthday.route.ts
var router = (0, import_express.Router)();
router.get(
  "/all",
  authenticateToken,
  async (req, res, _next) => {
    try {
      await BirthdayService.get_dates(req.user?._id, res);
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error
      });
    }
  }
);
router.post(
  "/create",
  authenticateToken,
  validate(createDateSchema),
  async (req, res, _next) => {
    try {
      await BirthdayService.create_date(req.body, req.user?._id, res);
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
  "/delete/:id",
  authenticateToken,
  async (req, res, _next) => {
    try {
      await BirthdayService.delete_date(req.user?._id, req.params?.id, res);
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error
      });
    }
  }
);
var birthday_route_default = router;
