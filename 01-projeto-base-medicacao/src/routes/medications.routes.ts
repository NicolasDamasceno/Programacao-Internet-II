import { Router } from "express";
import { medicationsController } from "../controllers/medications.controller";
import { validate } from "../middlewares/validate";
import { createMedicationSchema } from "../validation/medications.schemas";

export const medicationsRouter = Router();

medicationsRouter.get("/", medicationsController.list);
medicationsRouter.get("/:id", medicationsController.getById);
medicationsRouter.post("/", validate(createMedicationSchema), medicationsController.create);
medicationsRouter.delete("/:id", medicationsController.remove);
