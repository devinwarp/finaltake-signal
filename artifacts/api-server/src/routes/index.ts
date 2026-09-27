import { Router, type IRouter } from "express";
import healthRouter from "./health";
import signalRouter from "./signal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(signalRouter);

export default router;
