import { Router } from 'express';
import { HealthController } from './health.controller.js';

const router = Router();
const controller = new HealthController();

router.get('/', (req, res) => controller.getHealth(req, res));

export const healthRoutes = router;
