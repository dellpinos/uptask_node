import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password debe tener al menos 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('El password no coincide')
        }
        return true;
    }),
    body('email')
        .isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('El token es obligatorio'),
    handleInputErrors,
    AuthController.confirmAccount
);

router.post('/login',
    body('email')
        .isEmail().withMessage('Email no válido'),
    body('password')
        .notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    AuthController.login
);

router.post('/request-code',
    body('email')
        .isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
);

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('El token es obligatorio'),
    handleInputErrors,
    AuthController.validateToken
);

router.post('/update-password/:token',
    param('token')
        .isNumeric().withMessage('Token no válido'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password debe tener al menos 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('El password no coincide')
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
);

router.get('/user',
    authenticate,
    AuthController.user
);

export default router;




