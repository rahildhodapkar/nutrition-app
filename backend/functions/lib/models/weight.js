"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeights = getWeights;
exports.addWeight = addWeight;
const prisma_1 = __importDefault(require("../prisma"));
async function getWeights(username) {
    const user = await prisma_1.default.user.findUnique({
        where: { username },
        include: {
            weights: true,
        },
    });
    return user?.weights || [];
}
async function addWeight(username, weight) {
    const user = await prisma_1.default.user.findUnique({
        where: { username },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const newWeight = await prisma_1.default.weight.create({
        data: {
            weight: weight,
            userId: user.id,
        },
    });
    return newWeight;
}
//# sourceMappingURL=weight.js.map