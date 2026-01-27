import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as LikeController from "../../controllers/like-controller";
import { invalidateAfter } from "../../lib/cache";
import { cacheKeys } from "../../lib/cacheKey";

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * tags:
 *   - name: Likes
 */

/**
 * @openapi
 * /likes/toggle:
 *   post:
 *     tags: [Likes]
 *     summary: Toggle like on thread
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [thread_id]
 *             properties:
 *               thread_id: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ToggleThreadLikeResponse"
 */
router.post(
    "/likes/toggle",
    invalidateAfter((req: any) => {
        const threadId = String(req.body.thread_id ?? "");
        return [
        cacheKeys.threadDetail(threadId),
        "threads:feed:page:*",
        ];
    }),
    LikeController.toggle
);

export default router;
