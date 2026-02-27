import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as SearchController from "../../controllers/search-controller";
import { cacheGet } from "../../lib/cache";
import { cacheKeys } from "../../lib/cacheKey";

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * tags:
 *   - name: Search
 */

/**
 * @openapi
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Search users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema: { type: string, example: "yud" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10, minimum: 1, maximum: 20 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/SearchUser"
 */
router.get(
    "/search",
    cacheGet(
        (req) => cacheKeys.searchUsers(String(req.query.keyword ?? ""), String(req.query.limit ?? "10")),
        20
    ),
    SearchController.searchUsers
);

export default router;
