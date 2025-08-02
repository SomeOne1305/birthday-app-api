"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/routes/session/session.service.ts
var session_service_exports = {};
__export(session_service_exports, {
  SessionService: () => SessionService
});
module.exports = __toCommonJS(session_service_exports);

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

// app/routes/session/session.service.ts
var import_mongoose2 = require("mongoose");
var SessionService = {
  async getUserSessions(userId, res) {
    try {
      if (!import_mongoose2.Types.ObjectId.isValid(userId)) {
        return res.status(400).jsend.fail({ code: 400, message: "Invalid user ID" });
      }
      const sessions = await Session.find({
        user: userId
      });
      res.status(200).jsend.success({
        code: 200,
        message: "Sessions are ready",
        data: sessions
      });
    } catch (error) {
      throw error;
    }
  },
  async deleteSession(sessionID, userID, req, res) {
    try {
      if (!import_mongoose2.Types.ObjectId.isValid(sessionID)) {
        return res.status(400).jsend.fail({ code: 400, message: "Invalid ID format" });
      }
      const session = await Session.findOne({
        _id: sessionID,
        user: userID
      });
      if (!session) {
        return res.status(403).jsend.fail({ code: 403, message: "Action is not permitted" });
      }
      const refreshToken = req.cookies?.["refresh_token"];
      const now = Date.now();
      const createdTime = new Date(session.createdAt).getTime();
      const MIN_SESSION_ACTION_TIME = 36 * 60 * 60 * 1e3;
      if (session.refresh !== refreshToken && now - createdTime < MIN_SESSION_ACTION_TIME) {
        return res.status(403).jsend.fail({
          code: 403,
          message: "New users not allowed to delete other sessions"
        });
      }
      const result = await Session.deleteOne({ _id: sessionID });
      if (result.deletedCount === 0) {
        return res.status(500).jsend.success({ code: 500, message: "Internal server error" });
      }
      res.status(200).jsend.success({ code: 200, message: "Deleted successfully" });
    } catch (error) {
      throw error;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SessionService
});
