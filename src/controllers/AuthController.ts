import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPasword } from "../utils/auth";
import Token from "../models/Token";
import { generate6digitToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";


export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body;

            // Prevenir duplicados
            const userExist = await User.findOne({ email });
            if (userExist) {
                const error = new Error('El usuario ya está registrado');
                return res.status(409).json({ error: error.message })
            }

            // Crear usuario
            const user = new User(req.body);

            // Hash Password
            user.password = await hashPasword(password);

            // Generar Token
            const token = new Token();
            token.token = generate6digitToken();
            token.user = user.id;

            // Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });

            await Promise.allSettled([user.save(), token.save()]);

            res.send('Cuenta creada con éxito, revisa tu email para confirmarla')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token.findOne({ token });

            if (!tokenExists) {
                const error = new Error('Token no válido');
                return res.status(404).json({ error: error.message });
            }

            const user = await User.findById(tokenExists.user);

            user.confirmed = true;

            await user.save();
            await tokenExists.deleteOne();

            res.send('Cuenta confirmada correctamente');

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({ error: error.message });
            }

            if (!user.confirmed) {
                const token = new Token();
                token.user = user.id;
                token.token = generate6digitToken();
                await token.save();

                // Enviar Email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });

                const error = new Error('Debes verificar tu cuenta primero, hemos enviado un email de confirmación.');
                return res.status(401).json({ error: error.message });
            }

            // Revisar Password
            const isPasswordCorrect = await checkPassword(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto');
                return res.status(401).json({ error: error.message });
            }

            const token = generateJWT({ id: user.id });
            res.send(token);


        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }


    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // Usuario existente
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no está registrado');
                return res.status(404).json({ error: error.message });
            }

            if (user.confirmed) {
                const error = new Error('El usuario ya está confirmado');
                return res.status(403).json({ error: error.message });
            }

            // Generar Token
            const token = new Token();
            token.token = generate6digitToken();
            token.user = user.id;

            // Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });

            await Promise.allSettled([user.save(), token.save()]);

            res.send('Se envió un nuevo token a tu e-mail')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // Usuario existente
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no está registrado');
                return res.status(404).json({ error: error.message });
            }

            // Generar Token
            const token = new Token();
            token.token = generate6digitToken();
            token.user = user.id;
            await token.save();

            // Enviar Email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            });

            res.send('Revisa tu email para instrucciones');

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token.findOne({ token });

            if (!tokenExists) {
                const error = new Error('Token no válido');
                return res.status(404).json({ error: error.message });
            }

            res.send('Define tu nuevo password');

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const tokenExists = await Token.findOne({ token });

            if (!tokenExists) {
                const error = new Error('Token no válido');
                return res.status(404).json({ error: error.message });
            }

            const user = await User.findById(tokenExists.user);
            user.password = await hashPasword(req.body.password);

            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

            res.send('El password se actualizó correctamente');

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }

    static user = async (req: Request, res: Response) => res.json(req.user);

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya está registrado');
            return res.status(409).json({ error: error.message });
        }

        req.user.name = name;
        req.user.email = email;

        try {
            await req.user.save();
            res.send('Perfil actualizado correctamente');

        } catch (error) {
            res.status(500).send('Hubo un error');
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body;

        const user = await User.findById(req.user.id);
        const isPasswordCorrect = await checkPassword(current_password, user.password);

        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto');
            return res.status(401).json({ error: error.message });
        }

        try {
            user.password = await hashPasword(password);
            await user.save();
            res.send('Password fue actualizado con éxito');
        } catch (error) {
            res.status(500).send('Hubo un error');
        }

    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body;

        const user = await User.findById(req.user.id);
        const isPasswordCorrect = await checkPassword(password, user.password);

        if (!isPasswordCorrect) {
            const error = new Error('El password es incorrecto');
            return res.status(401).json({ error: error.message });
        }

        res.send('Password Correcto');
    }
}