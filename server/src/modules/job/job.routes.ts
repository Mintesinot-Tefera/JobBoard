import { Router } from 'express';
import * as controller from './job.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { createJobSchema } from './job.schema';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);

router.post('/', requireAuth, validate(createJobSchema), controller.create);

export default router;
