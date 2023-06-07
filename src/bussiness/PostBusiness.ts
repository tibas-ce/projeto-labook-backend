import { PostsDatabase } from "../database/PostsDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/post/createPost.dto";
import { GetPostInputDTO, GetPostOutputDTO } from "../dtos/post/getPost.dto";
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
            throw new UnauthorizedError
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
}