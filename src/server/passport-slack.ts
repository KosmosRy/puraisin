import { Strategy as Oauth2Strategy, StrategyOptions as OauthStrategyOptions, VerifyFunction } from 'passport-oauth2'

type StrategyOptions = Omit<OauthStrategyOptions, 'tokenURL' | 'authorizationURL'> & { userScope?: string }

export default class Strategy extends Oauth2Strategy {
    private strategyOptions: StrategyOptions

    constructor(options: StrategyOptions, verify: VerifyFunction) {
        const strategyOptions = {
            ...options,
            tokenURL: 'https://slack.com/api/oauth.v2.access',
            authorizationURL: 'https://slack.com/oauth/v2/authorize'
        }
        super(strategyOptions, verify)
        this.strategyOptions = options
        this.name = 'Slack OAuth2 v2'
    }

    authorizationParams(options: unknown): object {
        return {
            ...super.authorizationParams(options),
            user_scope: this.strategyOptions.userScope
        }
    }
}
