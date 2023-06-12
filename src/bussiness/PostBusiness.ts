import { PostsDatabase } from "../database/PostsDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/post/createPost.dto";
import { DeletePostIpuntDTO, DeletePostOutputDTO } from "../dtos/post/deletePost.dto";
import { EditPostIpuntDTO, EditPostOutputDTO } from "../dtos/post/editPost.dto";
import { GetPostInputDTO, GetPostOutputDTO } from "../dtos/post/getPost.dto";
import { LikeOrDislikePostIpuntDTO, LikeOrDislikePostOutputDTO } from "../dtos/post/likeOrDislikePost.dto";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { POSTS_LIKE, Post, PostModel, likeDislikeDB } from "../models/Posts";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
    constructor (
        private postDatabase: PostsDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) {}

    public createPost = async (input: CreatePostInputDTO): Promise<CreatePostOutputDTO> => {
        const { name, token } = input

        const payload = this.tokenManager.getPayload(token)

        if(!payload) {
            throw new UnauthorizedError()
        }

        const id = this.idGenerator.generate()

        const post = new Post(
            id, 
            name,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )

        const postDB = post.toDBModel()
        await this.postDatabase.insertPost(postDB)

        const output: CreatePostOutputDTO = undefined
        
        return output
    }

    public getPosts = async (input: GetPostInputDTO): Promise<GetPostOutputDTO> => {
        const { token } = input

        const payload = this.tokenManager.getPayload(token)

        if(!payload) {
            throw new UnauthorizedError
        }

        const postsDBWithCreatorName = await this.postDatabase.getPostsWithCreatorName()

        const posts = postsDBWithCreatorName
        .map((postsWithCreatorName) => {
            const post = new Post(
                postsWithCreatorName.id,
                postsWithCreatorName.content,
                postsWithCreatorName.likes,
                postsWithCreatorName.dislikes,
                postsWithCreatorName.created_at,
                postsWithCreatorName.updated_at,
                postsWithCreatorName.creator_id,
                postsWithCreatorName.creator_name
            )

            return post.toBusinessModel()
        })

        const output: GetPostOutputDTO = posts

        return output
    }

    public editPost = async (input:EditPostIpuntDTO): Promise<EditPostOutputDTO> => {
        const { name, token, idToEdit } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("post com essa id não existe")
        }

        if (payload.id === postDB.creator_id) {
            throw new ForbiddenError("somente quem criou o post pode editá-lo")
        }

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.creator_id,
            postDB.updated_at,
            payload.name
        )

        post.setContent(name)

        const updatedPostDB = post.toDBModel()
        await this.postDatabase.updatedPostDB(updatedPostDB)
        
        const output: EditPostOutputDTO = undefined
        
        return output
    }
    
    public deletePost = async (input:DeletePostIpuntDTO): Promise<DeletePostOutputDTO> => {
        const { token, idToDelete } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("post com essa id não existe")
        }

        if (payload.role !== USER_ROLES.ADMIN) {
            if (payload.id === postDB.creator_id) {
                throw new ForbiddenError("somente quem criou o post pode editá-lo")
            }
        }

        await this.postDatabase.deletePostById(idToDelete)
        
        const output: DeletePostOutputDTO = undefined
        
        return output
    }

    public likeOrDislikePost = async (input:LikeOrDislikePostIpuntDTO): Promise<LikeOrDislikePostOutputDTO> => {
        const { token, postId, like } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const PostDBWithCreatorName = await this.postDatabase.finPostWithCreatorNameById(postId)

        if (!PostDBWithCreatorName) {
            throw new NotFoundError("post com essa id não existe")
        }
        
        const post = new Post(
            PostDBWithCreatorName.id,
            PostDBWithCreatorName.content,
            PostDBWithCreatorName.likes,
            PostDBWithCreatorName.dislikes,
            PostDBWithCreatorName.created_at,
            PostDBWithCreatorName.updated_at,
            PostDBWithCreatorName.creator_id,
            PostDBWithCreatorName.creator_name
        )

        const likeSQlite = like ? 1 : 0

        const likeDislikeDB: likeDislikeDB = {
            user_id: payload.id,
            post_id: postId,
            like: likeSQlite
        } 

        const likeDisliskeExits = await this.postDatabase.findLikeDislike(likeDislikeDB)

        if (likeDisliskeExits === POSTS_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeLike()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeLike()
                post.addDislike()
            }
        } else if (likeDisliskeExits === POSTS_LIKE.ALREADY_DISLIKED) {
            if (like === false) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeDislikes()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeDislikes()
                post.addLike()
            }
        } else {
            await this.postDatabase.insertLikeDislike(likeDislikeDB)
            like ? post.addLike() : post.addDislike()
        }

        const updatePostDB = post.toDBModel()
        await this.postDatabase.updatedPostDB(updatePostDB)

        const output: LikeOrDislikePostOutputDTO = undefined

        return output
    }
}