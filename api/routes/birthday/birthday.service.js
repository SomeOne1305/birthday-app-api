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

// app/routes/birthday/birthday.service.ts
var birthday_service_exports = {};
__export(birthday_service_exports, {
  BirthdayService: () => BirthdayService
});
module.exports = __toCommonJS(birthday_service_exports);
var import_mongoose2 = __toESM(require("mongoose"));

// models/birthday.model.ts
var import_mongoose = require("mongoose");
var birthdaySchema = new import_mongoose.Schema(
  {
    user: { type: import_mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
var Birthday = (0, import_mongoose.model)("Birthday", birthdaySchema);

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
      if (!import_mongoose2.default.Types.ObjectId.isValid(date_id)) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BirthdayService
});
