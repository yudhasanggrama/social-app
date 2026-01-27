import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as FollowingController from "../../controllers/following-controller";
import { cacheGet, invalidateAfter } from "../../lib/cache";
import { cacheKeys } from "../../lib/cacheKey";

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * tags:
 *   - name: Follows
 */

/**
 * @openapi
 * /follows:
 *   get:
 *     tags: [Follows]
 *     summary: Get followers/following list
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [followers, following]
 *     responses:
 *       200: { description: OK }
 *
 *   post:
 *     tags: [Follows]
 *     summary: Follow user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [followed_user_id]
 *             properties:
 *               followed_user_id: { type: integer, example: 2 }
 *     responses:
 *       200: { description: OK }
 *
 *   delete:
 *     tags: [Follows]
 *     summary: Unfollow user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [followed_user_id]
 *             properties:
 *               followed_user_id: { type: integer, example: 2 }
 *     responses:
 *       200: { description: OK }
 */
router.get(
    "/follows",
    cacheGet((req: any) => cacheKeys.followsList(req.user.id, String(req.query.type ?? "")), 20),
    FollowingController.getFollows
);
router.post(
    "/follows",
    invalidateAfter((req: any) => [
        `follows:list:${req.user.id}:*`,
        `follows:suggested:${req.user.id}:limit:*`,
        "profile:user:*",
        "search:users:*",
    ]),
    FollowingController.followUser
);
router.delete(
    "/follows",
    invalidateAfter((req: any) => [
        `follows:list:${req.user.id}:*`,
        `follows:suggested:${req.user.id}:limit:*`,
        "profile:user:*",
        "search:users:*",
    ]),
    FollowingController.unfollowUser
);

/**
 * @openapi
 * /follows/suggested:
 *   get:
 *     tags: [Follows]
 *     summary: Suggested users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 5, minimum: 1, maximum: 20 }
 *     responses:
 *       200: { description: OK }
 */
router.get(
    "/follows/suggested",
    cacheGet((req: any) => cacheKeys.suggestedUsers(req.user.id, String(req.query.limit ?? "5")), 30),
    FollowingController.getSuggested
);

export default router;
