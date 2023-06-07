import z from "zod"

export interface CreatePostInputDTO {
    name: string,
    token: string
}

export type CreatePostOutputDTO = undefined

export const CreatePostSchema = z.object({
    name: z.string().min(1),
    token: z.string().min(1)
}).transform(date => date as CreatePostInputDTO)