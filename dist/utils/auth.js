"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPassword = exports.hashPasword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPasword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return await bcrypt_1.default.hash(password, salt);
};
exports.hashPasword = hashPasword;
const checkPassword = async (enteredPassword, storedPassword) => {
    return await bcrypt_1.default.compare(enteredPassword, storedPassword);
};
exports.checkPassword = checkPassword;
//# sourceMappingURL=auth.js.map