import { PostDB } from "../models/Posts";
import { BaseDatabase } from "./BaseDatabase";

export class PostsDatabase extends BaseDatabase {
    public static TABLE_POSTS = "posts"
    public static TABLE_LIKES_DISLIKES = "likes_dislikes"

    public insertPost = async (postDB: PostDB): Promise<void> => {
        await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).insert(postDB)
    }
}