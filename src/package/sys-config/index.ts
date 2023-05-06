import { z } from "zod"
import { api } from "../api"

export const sysConfigSchema = z.object({
  adminJids: z.array(z.string()).catch([]),
  internalGroupIds: z.array(z.string()).catch([]),
})

export type SysConfigSchema = z.infer<typeof sysConfigSchema>

export function resSchema<T>(schema: z.ZodType<T>, data: unknown) {
  const validate = z.object({ payload: schema }).safeParse(data)
  if (!validate.success) {
    console.error(validate.error)
    throw new TypeError(validate.error.toString())
  }

  return validate.data
}

export async function getSysConfig() {
  const { data } = await api.get("/sys-config")
  return resSchema(z.object({ config: sysConfigSchema }), data).payload.config
}
