import z from "zod"
import { PostModel } from "../../models/Posts"

export interface GetPostInputDTO {
    token: string
}

export type GetPostOutputDTO = PostModel[]

export const GetPostSchema = z.object({
    token: z.string().min(1)
})