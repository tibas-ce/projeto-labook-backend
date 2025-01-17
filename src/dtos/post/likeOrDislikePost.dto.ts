import z from "zod"

export interface LikeOrDislikePostIpuntDTO {
    postId: string,
    token: string,
    like: boolean
}

export type LikeOrDislikePostOutputDTO = undefined

export const LikeOrDislikePostSchema = z.object({
    postId: z.string().min(1),
    token: z.string().min(1),
    like: z.boolean()
}).transform(date => date as LikeOrDislikePostIpuntDTO)