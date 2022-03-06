[![Fuck Russia](https://img.shields.io/badge/fuck-russia-black.svg)](https://twitter.com/Tyrrrz/status/1495972130789502980?s=20&t=3dCM7iZbUJi-K0rDa4-JiQ)

# PikaPuraisin

### Required Slack token scopes:
- Bot token scopes: `users.profile:read` (NOTE: if no bot token scopes are requested, Slack
returns an empty access-token. Passport-oauth2 thinks [this is an error and aborts the 
authorization](https://github.com/jaredhanson/passport-oauth2/blob/8e3bcdff145a2219033bd782fc517229fe3e05ea/lib/strategy.js#L177).
The user token is still returned within the result object, so authorization could go on. Therefore
one bot token scope is mandatory, or passport-oauth2 would need to be tweaked a bit.
- User token scopes
  - `chat:write`
  - `channels:read`
  - `channels:write`
