import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';

const router = Router();

router.get('/', ExerciseController.getAll);
router.get('/:slug', ExerciseController.getBySlug);

export default router;