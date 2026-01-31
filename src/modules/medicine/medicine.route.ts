import { Router } from "express";
import MedicineController from "./medicine.controller";
import {
  authRateLimiter,
  rateLimiter,
} from "../../middlewares/rateLimit.middleware";
import {
  authenticate,
  authorize,
  authorizeOwner,
} from "../../middlewares/auth.middleware";

const medicineRouter = Router();
const medicineController = new MedicineController();

medicineRouter.post(
  "/",
  rateLimiter,
  authenticate,
  authorize(["ADMIN", "SELLER"]),
  medicineController.addMedicine,
);
medicineRouter.get("/", rateLimiter, medicineController.getMedicines);
medicineRouter.get("/:medicineId", rateLimiter, medicineController.getMedicine);
medicineRouter.put(
  "/:medicineId",
  rateLimiter,
  authenticate,
  authorize(["ADMIN", "SELLER"]),
  authorizeOwner("medicine"),
  medicineController.updateMedicine,
);
medicineRouter.patch(
  "/:medicineId",
  rateLimiter,
  authenticate,
  authorize(["SELLER"]),
  authorizeOwner("medicine"),
  medicineController.updateMedicineStock,
);
// authRouter.post("/refresh", authController.refresh);

export default medicineRouter;
