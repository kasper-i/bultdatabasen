
export class Api {
    static idToken: string;
    static accessToken: string;    
    static refreshToken: string;

    static setTokens = (idToken: string, accessToken: string, refreshToken: string) => {
        Api.idToken = idToken;
        Api.accessToken = accessToken;
        Api.refreshToken = refreshToken;
    }
}

