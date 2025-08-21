"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEmail = void 0;
const nodemailer_1 = require("../config/nodemailer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthEmail {
    static sendConfirmationEmail = async (user) => {
        const info = await nodemailer_1.transporter.sendMail({
            from: `${process.env.APP_NAME} <${process.env.APP_EMAIL}>`,
            to: user.email,
            subject: `${process.env.APP_NAME} - Confirma tu cuenta`,
            text: `${process.env.APP_NAME} - Confirma tu cuenta`,
            html: `
                <p>Hola ${user.name}, has creado tu cuenta en ${process.env.APP_NAME}, solo falta confirmarla.</p>
                <p>Visita el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/confirm-account'>Confirmar Cuenta</a>
                <p>Ingresa el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        });
        console.log('Email enviado', info.messageId);
    };
    static sendPasswordResetToken = async (user) => {
        const info = await nodemailer_1.transporter.sendMail({
            from: `${process.env.APP_NAME} <${process.env.APP_EMAIL}>`,
            to: user.email,
            subject: `${process.env.APP_NAME} - Reestablece tu password`,
            text: `${process.env.APP_NAME} - Reestablece tu password`,
            html: `
                <p>Hola ${user.name}, has solicitado reestablecer tu password.</p>
                <p>Visita el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/new-password'>Reestablecer Password</a>
                <p>Ingresa el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        });
        console.log('Email enviado', info.messageId);
    };
}
exports.AuthEmail = AuthEmail;
//# sourceMappingURL=AuthEmail.js.map