import { z } from "zod";

export const ConfigSchema = z.object({
  // border
  "set-border-width": z.string().optional(),
  "set-border-style": z.string().optional(),
  "set-border-color": z.string().optional(),
  "set-camera-mirror": z.string().optional(),

  // filter
  "set-video-filter": z.string().optional(),

  // shape
  "set-camera-shape": z.string().optional(),

  // resolution
  "set-camera-resolution": z.string().optional(),
});

export type ConfigSchema = z.infer<typeof ConfigSchema>;
