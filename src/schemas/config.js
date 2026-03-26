"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = void 0;
const zod_1 = require("zod");
exports.ConfigSchema = zod_1.z.object({
    // border
    "set-border-width": zod_1.z.string().optional(),
    "set-border-style": zod_1.z.string().optional(),
    "set-border-color": zod_1.z.string().optional(),
    "set-camera-mirror": zod_1.z.string().optional(),
    // filter
    "set-video-filter": zod_1.z.string().optional(),
    // shape
    "set-camera-shape": zod_1.z.string().optional(),
    // resolution
    "set-camera-resolution": zod_1.z.string().optional(),
});
