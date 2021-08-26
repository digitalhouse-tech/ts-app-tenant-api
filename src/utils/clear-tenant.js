const clearAuthStrategies = (authStrategies) =>
    authStrategies.map((strategy) => {
        if (strategy.type !== 'OAuthStrategy') {
            return strategy
        }
        return {
            ...strategy,
            config: {
                redirectOnOpen: strategy.config.redirectOnOpen,
                enablePublicSignUp: strategy.config.enablePublicSignUp,
                provider: strategy.config.provider,
                buttonOnNativeLogin: strategy.config.buttonOnNativeLogin,
                providerUrl: strategy.config.providerUrl,
            },
        }
    })

module.exports = clearAuthStrategies
