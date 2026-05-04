import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { createApplicationSchema } from './application.schema';
import * as controller from './application.controller';

const router = Router();

router.use(requireAuth);

router.post('/jobs/:jobId', validate(createApplicationSchema), controller.create);
router.get('/me', controller.getMyApplications);
router.get('/me/job-ids', controller.getAppliedJobIds);
router.get('/:id', controller.getById);
router.patch('/:id/withdraw', controller.withdraw);

export default router;
