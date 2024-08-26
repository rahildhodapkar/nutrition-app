"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.createUser = createUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const saltNumber = 10;
async function getUser(username) {
    const user = await prisma_1.default.user.findFirst({
        where: {
            username: username,
        },
    });
    return user;
}
async function createUser(username, password) {
    const hashedPassword = await bcryptjs_1.default.hash(password, saltNumber);
    const user = await prisma_1.default.user.create({
        data: {
            username: username,
            password: hashedPassword,
        },
    });
    return user;
}
//# sourceMappingURL=users.js.map