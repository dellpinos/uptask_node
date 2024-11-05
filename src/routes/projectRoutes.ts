import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';

const router = Router();

router.get('/', ProjectController.getAllProject);
router.post('/', ProjectController.createProject);

export default router;