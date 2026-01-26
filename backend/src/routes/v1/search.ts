import express from "express"
import { authMiddleware } from "../../middleware/authMiddleware"
import * as searchController from "../../controllers/search-controller"

const router = express.Router()

router.use(authMiddleware);

router.get("/search", searchController.searchUsers);

export default router
