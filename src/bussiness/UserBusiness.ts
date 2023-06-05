import { UserDatabase } from "../database/UserDatabase";
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto";
import { USER_ROLES, User, TokenPayload } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class UserBusiness {
    constructor (
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) {}

    public signup = async (input: SignupInputDTO) : Promise<SignupOutputDTO> => {
        const { name, email, password } = input

        const id = this.idGenerator.generate() 

        const hasedPassword = await this.hashManager.hash(password)

        const user = new User(
            id,
            name,
            email,
            hasedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
        )

        const userDB = user.toDBModel()
        await this.userDatabase.insert(userDB)

        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const output: SignupOutputDTO = {
            token: this.tokenManager.createToken(payload)
        }

        return output
    }
}