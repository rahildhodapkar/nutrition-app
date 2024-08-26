"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMacros = getMacros;
exports.upsertMacros = upsertMacros;
const prisma_1 = __importDefault(require("../prisma"));
async function getMacros(username) {
    const user = await prisma_1.default.user.findUnique({
        where: { username },
        include: {
            macros: true,
        },
    });
    return user?.macros || null;
}
async function upsertMacros(username, calories, protein, fat, carbs) {
    const user = await prisma_1.default.user.findUnique({ where: { username } });
    if (!user) {
        throw new Error(`User with username ${username} not found`);
    }
    const macros = await prisma_1.default.macros.upsert({
        where: {
            userId: user.id,
        },
        update: {
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            fat: parseFloat(fat),
            carbs: parseFloat(carbs),
        },
        create: {
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            fat: parseFloat(fat),
            carbs: parseFloat(carbs),
            userId: user.id,
        },
    });
    return macros;
}
//# sourceMappingURL=macros.js.map