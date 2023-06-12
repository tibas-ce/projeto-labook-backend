import { POSTS_LIKE, PostDB, PostDBWithCreatorName, likeDislikeDB } from "../models/Posts";
import { BaseDatabase } from "./BaseDatabase";
import { UserDatabase } from "./UserDatabase";

export class PostsDatabase extends BaseDatabase {
    public static TABLE_POSTS = "posts"
    public static TABLE_LIKES_DISLIKES = "likes_dislikes"

    public insertPost = async (postDB: PostDB): Promise<void> => {
        await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).insert(postDB)
    }

    public getPostsWithCreatorName = async (): Promise<PostDBWithCreatorName[]> => {
        const postsDB = await BaseDatabase
        .connection(PostsDatabase.TABLE_POSTS)
        .select(
            `${PostsDatabase.TABLE_POSTS}.id`,
            `${PostsDatabase.TABLE_POSTS}.creator_id`,
            `${PostsDatabase.TABLE_POSTS}.content`,
            `${PostsDatabase.TABLE_POSTS}.likes`,
            `${PostsDatabase.TABLE_POSTS}.dislikes`,
            `${PostsDatabase.TABLE_POSTS}.created_at`,
            `${PostsDatabase.TABLE_POSTS}.updated_at`,
            `${UserDatabase.TABLE_USERS}.name`
        )
        .join(
            `${UserDatabase.TABLE_USERS}`,
            `${PostsDatabase.TABLE_POSTS}.creator_id`,
            "=",
            `${UserDatabase.TABLE_USERS}.id`
        )

        return postsDB as PostDBWithCreatorName[]
    }
    
    public findPostById = async (id: string): Promise<PostDB | undefined> => {
        const [result] = await BaseDatabase
            .connection(PostsDatabase.TABLE_POSTS)
            .select()
            .where({id})

        return result as PostDB | undefined
    }

    public updatedPostDB = async (postDB: PostDB): Promise<void> => {
        await BaseDatabase
            .connection(PostsDatabase.TABLE_POSTS)
            .update(postDB)
            .where({ id: postDB.id })
    }

    public deletePostById = async (id: string): Promise<void> => {
        await BaseDatabase
            .connection(PostsDatabase.TABLE_POSTS)
            .delete()
            .where({ id })
    }

    public finPostWithCreatorNameById = async (id: string): Promise<PostDBWithCreatorName | undefined> => {
        const [ postsDB ] = await BaseDatabase
        .connection(PostsDatabase.TABLE_POSTS)
        .select(
            `${PostsDatabase.TABLE_POSTS}.id`,
            `${PostsDatabase.TABLE_POSTS}.creator_id`,
            `${PostsDatabase.TABLE_POSTS}.content`,
            `${PostsDatabase.TABLE_POSTS}.likes`,
            `${PostsDatabase.TABLE_POSTS}.dislikes`,
            `${PostsDatabase.TABLE_POSTS}.created_at`,
            `${PostsDatabase.TABLE_POSTS}.updated_at`,
            `${UserDatabase.TABLE_USERS}.name`
        )
        .join(
            `${UserDatabase.TABLE_USERS}`,
            `${PostsDatabase.TABLE_POSTS}.creator_id`,
            "=",
            `${UserDatabase.TABLE_USERS}.id`
        )
        .where({ [`${PostsDatabase.TABLE_POSTS}.id`]: id })

        return postsDB as PostDBWithCreatorName | undefined
    }

    public findLikeDislike = async (likeDislikeDB: likeDislikeDB): Promise <POSTS_LIKE | undefined> => {

        const [result]: Array<likeDislikeDB | undefined> = await BaseDatabase
            .connection(PostsDatabase.TABLE_LIKES_DISLIKES)
            .select()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id             
            })

        if (result === undefined) {
            return undefined
        } else if (result.like === 1) {
            return POSTS_LIKE.ALREADY_LIKED
        } else {
            return POSTS_LIKE.ALREADY_DISLIKED
        }
    }

    public removeLikeDislike =async (likeDislikeDB: likeDislikeDB): Promise<void> => {
        await BaseDatabase
            .connection(PostsDatabase.TABLE_LIKES_DISLIKES)
            .delete()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id             
            })
    }

    public updateLikeDislike = async (likeDislikeDB: likeDislikeDB): Promise<void> => {
        await BaseDatabase
            .connection(PostsDatabase.TABLE_LIKES_DISLIKES)
            .update(likeDislikeDB)
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id             
            })
    }

    public insertLikeDislike = async (likeDislikeDB: likeDislikeDB): Promise<void> => {
        await BaseDatabase
            .connection(PostsDatabase.TABLE_LIKES_DISLIKES)
            .insert(likeDislikeDB)
    }
}