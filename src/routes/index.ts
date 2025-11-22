import { Router } from "express";
import matchingRoutes from "./matching.routes.js";
import convertRoutes from "./convert.routes.js";

const router = Router();

router.use("/", matchingRoutes);
router.use("/", convertRoutes);

export default router;

