"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const Token_1 = __importDefault(require("../models/Token"));
const token_1 = require("../utils/token");
const AuthEmail_1 = require("../emails/AuthEmail");
const jwt_1 = require("../utils/jwt");
class AuthController {
    static createAccount = async (req, res) => {
        try {
            const { password, email } = req.body;
            // Prevenir duplicados
            const userExist = await User_1.default.findOne({ email });
            if (userExist) {
                const error = new Error('El usuario ya está registrado');
                return res.status(409).json({ error: error.message });
            }
            // Crear usuario
            const user = new User_1.default(req.body);
            // Hash Password
            user.password = await (0, auth_1.hashPasword)(password);
            // Generar Token
            const token = new Token_1.default();
            token.token = (0, token_1.generate6digitToken)();
            token.user = user.id;
            // Enviar Email
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await Promise.allSettled([user.save(), token.save()]);
            res.send('Cuenta creada con éxito, revisa tu email para confirmarla');
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static confirmAccount = async (req, res) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token_1.default.findOne({ token });
            if (!tokenExists) {
                const error = new Error('Token no válido');
                return res.status(404).json({ error: error.message });
            }
            const user = await User_1.default.findById(tokenExists.user);
            user.confirmed = true;
            await user.save();
            await tokenExists.deleteOne();
            res.send('Cuenta confirmada correctamente');
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({ error: error.message });
            }
            if (!user.confirmed) {
                const token = new Token_1.default();
                token.user = user.id;
                token.token = (0, token_1.generate6digitToken)();
                await token.save();
                // Enviar Email
                AuthEmail_1.AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });
                const error = new Error('Debes verificar tu cuenta primero, hemos enviado un email de confirmación.');
                return res.status(401).json({ error: error.message });
            }
            // Revisar Password
            const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto');
                return res.status(401).json({ error: error.message });
            }
            const token = (0, jwt_1.generateJWT)({ id: user.id });
            res.send(token);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static requestConfirmationCode = async (req, res) => {
        try {
            const { email } = req.body;
            // Usuario existente
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no está registrado');
                return res.status(404).json({ error: error.message });
            }
            if (user.confirmed) {
                const error = new Error('El usuario ya está confirmado');
                return res.status(403).json({ error: error.message });
            }
            // Generar Token
            const token = new Token_1.default();
            token.token = (0, token_1.generate6digitToken)();
            token.user = user.id;
            // Enviar Email
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await Promise.allSettled([user.save(), token.save()]);
            res.send('Se envió un nuevo token a tu e-mail');
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            // Usuario existente
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no está registrado');
                return res.status(404).json({ error: error.message });
            }
            // Generar Token
            const token = new Token_1.default();
            token.token = (0, token_1.generate6digitToken)();
            token.user = user.id;
            await token.save();
            // Enviar Email
            AuthEmail_1.AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            });
            res.send('Revisa tu email para instrucciones');
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static validateToken = async (req, res) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token_1.default.findOne({ token });
            if (!tokenExists) {
                const error = new Error('Token no válido');
                return res.status(404).json({ error: error.message });
            }
            res.send('Define tu nuevo password');
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static updatePasswordWithToken = async (req, res) => {
        try {
            const { token } = req.params;
            const tokenExists = await Token_1.default.findOne({ token });
            if (!tokenExists) {
                const error = new Error('Token no válido');
                return res.status(404).json({ error: error.message });
            }
            const user = await User_1.default.findById(tokenExists.user);
            user.password = await (0, auth_1.hashPasword)(req.body.password);
            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
            res.send('El password se actualizó correctamente');
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Algo salió mal" });
        }
    };
    static user = async (req, res) => res.json(req.user);
    static updateProfile = async (req, res) => {
        const { name, email } = req.body;
        const userExists = await User_1.default.findOne({ email });
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya está registrado');
            return res.status(409).json({ error: error.message });
        }
        req.user.name = name;
        req.user.email = email;
        try {
            await req.user.save();
            res.send('Perfil actualizado correctamente');
        }
        catch (error) {
            res.status(500).send('Hubo un error');
        }
    };
    static updateCurrentUserPassword = async (req, res) => {
        const { current_password, password } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(current_password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto');
            return res.status(401).json({ error: error.message });
        }
        try {
            user.password = await (0, auth_1.hashPasword)(password);
            await user.save();
            res.send('Password fue actualizado con éxito');
        }
        catch (error) {
            res.status(500).send('Hubo un error');
        }
    };
    static checkPassword = async (req, res) => {
        const { password } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('El password es incorrecto');
            return res.status(401).json({ error: error.message });
        }
        res.send('Password Correcto');
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map