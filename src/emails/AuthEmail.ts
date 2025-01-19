import { transporter } from "../config/nodemailer";
import dotenv from 'dotenv';
dotenv.config();

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async(user : IEmail) => {
        const info = await transporter.sendMail({
            from: `${process.env.APP_NAME} <${process.env.APP_EMAIL}>`,
            to: user.email,
            subject: `${process.env.APP_NAME} - Confirma tu cuenta`,
            text: `${process.env.APP_NAME} - Confirma tu cuenta`,
            html: `
                <p>Hola ${user.name}, has creado tu cuenta en ${process.env.APP_NAME}, solo falta confirmarla.</p>
                <p>Visita el siguiente enlace:</p>
                <a href='#'>Confirmar Cuenta</a>
                <p>Ingresa el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        });

        console.log('Email enviado', info.messageId);
    }
}