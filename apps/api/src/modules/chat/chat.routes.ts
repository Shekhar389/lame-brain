import { Router } from 'express';
import { ChatRequestSchema } from '@repo/shared';
import { validate } from '../../core/middleware/validate.middleware.js';
import { ChatController } from './chat.controller.js';

const router = Router();
const controller = new ChatController();

router.post('/', validate({ body: ChatRequestSchema }), controller.sendMessage);

export { router as chatRoutes };
