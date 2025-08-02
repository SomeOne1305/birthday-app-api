import { Response } from "express";
import { Session } from "../../../models/session.model";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../../../interfaces/request.interface";

export const SessionService = {
  async getUserSessions(userId: string, res: Response) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .jsend.fail({ code: 400, message: "Invalid user ID" });
      }
      const sessions = await Session.find({
        user: userId,
      });

      res.status(200).jsend.success({
        code: 200,
        message: "Sessions are ready",
        data: sessions,
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteSession(
    sessionID: string,
    userID: string,
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      if (!Types.ObjectId.isValid(sessionID)) {
        return res
          .status(400)
          .jsend.fail({ code: 400, message: "Invalid ID format" });
      }
      const session = await Session.findOne({
        _id: sessionID,
        user: userID,
      });
      if (!session) {
        return res
          .status(403)
          .jsend.fail({ code: 403, message: "Action is not permitted" });
      }
      const refreshToken = req.cookies?.["refresh_token"];
      const now = Date.now();
      const createdTime = new Date(session.createdAt).getTime();
      const MIN_SESSION_ACTION_TIME = 36 * 60 * 60 * 1000;
      if (
        session.refresh !== refreshToken &&
        now - createdTime < MIN_SESSION_ACTION_TIME
      ) {
        return res
          .status(403)
          .jsend.fail({
            code: 403,
            message: "New users not allowed to delete other sessions",
          });
      }

      const result = await Session.deleteOne({ _id: sessionID });
      if (result.deletedCount === 0) {
        return res
          .status(500)
          .jsend.success({ code: 500, message: "Internal server error" });
      }
      res
        .status(200)
        .jsend.success({ code: 200, message: "Deleted successfully" });
    } catch (error) {
      throw error;
    }
  },
};
