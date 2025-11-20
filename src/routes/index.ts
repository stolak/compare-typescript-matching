import { Router } from "express";
import matchingRoutes from "./matching.routes";
import convertRoutes from "./convert.routes";

const router = Router();

router.use("/", matchingRoutes);
router.use("/", convertRoutes);

export default router;

