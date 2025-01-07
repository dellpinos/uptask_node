import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
    res.send('Saludos desde /api/auth');
});

export default router;