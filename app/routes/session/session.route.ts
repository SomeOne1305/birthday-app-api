import { NextFunction, Response, Router } from "express";
import { AuthenticatedRequest } from "../../../interfaces/request.interface";
import { authenticateToken } from "../../../middlewares/authenticate-request";
import { SessionService } from "./session.service";

const router = Router();

/**
 * @openapi
 * /api/sessions/all:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get user sessions
 *     description: Get user sessions by auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions are ready
 *       401:
 *         description: Unauthorized access (Token required, User credentials etc...)
 */
router.get(
  "/all",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await SessionService.getUserSessions(req.user?._id!, res);
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error as string,
      });
    }
  }
);

/**
 * @openapi
 * /api/sessions/delete/{id}:
 *   delete:
 *     tags:
 *       - Sessions
 *     summary: Delete session
 *     description: Deletes a session entry belonging to the authenticated user. Requires Bearer token authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session entry to delete
 *     responses:
 *       200:
 *         description: Session entry successfully deleted
 *       403:
 *         description: Action is not permitted (e.g., trying to delete someone else's entry)
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized access (missing or invalid token)
 *       500:
 *         description: Internal server error
 */

router.delete(
  "/delete/:id",
  authenticateToken,
  async (req: AuthenticatedRequest<{id:string}>, res: Response, _next: NextFunction) => {
    try {
      await SessionService.deleteSession(req.params?.id, req.user?._id!, req, res)
    } catch (error) {
      res.status(500).jsend.error({
        code: 500,
        message: "Something went wrong",
        data: error as string,
      });
    }
  }
);

export default router;
