import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPasword } from "../utils/auth";
import Token from "../models/Token";
import { generate6digitToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";


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

            await Promise.allSettled([
                user.save(), tokenExists.deleteOne()
            ]);
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
            if(!isPasswordCorrect) {
                const error = new Error('Password incorrecto');
                return res.status(401).json({ error: error.message });
            }

            res.send('Autenticado');


        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Algo salió mal" })
        }
    }
}