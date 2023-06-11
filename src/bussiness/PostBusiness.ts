import { PostsDatabase } from "../database/PostsDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/post/createPost.dto";
import { EditPostIpuntDTO, EditPostOutputDTO } from "../dtos/post/editPost.dto";
import { GetPostInputDTO, GetPostOutputDTO } from "../dtos/post/getPost.dto";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { Post, PostModel } from "../models/Posts";
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
}