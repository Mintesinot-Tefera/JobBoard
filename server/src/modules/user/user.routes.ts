import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './user.schema';
import * as controller from './user.controller';

const router = Router();

router.get('/me', requireAuth, controller.getMe);
router.patch('/me', requireAuth, validate(updateProfileSchema), controller.updateMe);

export default router;
