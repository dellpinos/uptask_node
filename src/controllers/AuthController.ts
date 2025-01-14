import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { hashPasword } from "../utils/auth";
import Token from "../models/Token";
import { generate6digitToken } from "../utils/token";


export class AuthController {
    static createAccount = async (req : Request, res : Response) => {
        try {
            const { password, email } = req.body;

            // Prevenir duplicados
            const userExist = await User.findOne({email});
            if( userExist ) {
                const error = new Error('El usuario ya está registrado');
                console.log(userExist)
                return res.status(409).json({error: error.message})
            }

            // Crear usuario
            const user = new User(req.body);

            // Hash Password
            user.password = await hashPasword(password);

            // Generar Token
            const token = new Token();
            token.token = generate6digitToken();
            token.user = user.id;
            
            await Promise.allSettled([user.save(), token.save()]);

            res.send('Cuenta creada con éxito, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error: "Algo salió mal"})
        }
    }
}