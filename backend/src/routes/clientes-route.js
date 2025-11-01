import { Router } from "express";
import { clientesController } from "../controllers/clientes-controller.js";

const router = Router();

router.get("/", clientesController.list);
router.get("/search", clientesController.getClienteData);
router.get("/:id", clientesController.getId);
router.post("/", clientesController.insert);
router.put("/:id", clientesController.update);
router.delete("/:id", clientesController.remove);

export default router;
