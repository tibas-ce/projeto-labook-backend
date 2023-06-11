import z from "zod"

export interface EditPostIpuntDTO {
    name: string,
    token: string,
    idToEdit: string
}

export type EditPostOutputDTO = undefined

export const EditPostSchema = z.object({
    name: z.string().min(1),
    token: z.string().min(1),
    idToEdit: z.string().min(1)
}).transform(data => data as EditPostIpuntDTO)