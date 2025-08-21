"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate6digitToken = void 0;
const generate6digitToken = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.generate6digitToken = generate6digitToken;
//# sourceMappingURL=token.js.map