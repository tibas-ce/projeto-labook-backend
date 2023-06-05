import z from "zod"

export interface DeletePostIpuntDTO {
    token: string,
    idToDelete: string
}

export type DeletePostOutputDTO = undefined

export const deletePlaylistSchema = z.object({
    token: z.string().min(1),
    idToDelete: z.string().min(1)
})