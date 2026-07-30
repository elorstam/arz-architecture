import {z} from "zod";
export const studioLoginSchema=z.object({email:z.string().trim().email().max(320),password:z.string().min(8).max(200)});
export const studioActivitySchema=z.object({organizationId:z.string().uuid().nullable(),entityType:z.string().trim().min(1).max(80),entityId:z.string().uuid().nullable(),action:z.enum(["auth.login","auth.logout","auth.access_denied"]),summary:z.string().trim().min(1).max(300),metadata:z.record(z.string(),z.unknown()).default({})});
