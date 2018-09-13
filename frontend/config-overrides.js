module.exports = function override(config, env) {
    const swPrecacheConfig = config.plugins.find(
        plugin => plugin.constructor.name === "SWPrecacheWebpackPlugin"
    );
    // Prevent some URLs from being cached by the service worker
    swPrecacheConfig.options.navigateFallbackWhitelist = [
        /^(?!\/(__|auth\/redirect)).*/
    ];

    swPrecacheConfig.options.runtimeCaching = [{
        urlPattern: /\/info$/,
        handler: 'networkFirst'
    }, {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/css.*/,
        handler: 'cacheFirst'
    }, {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*\.woff2/,
        handler: 'cacheFirst'
    }, {
        urlPattern: /^https:\/\/avatars\.slack-edge\.com\/.*\.png/,
        handler: 'cacheFirst'
    }];
    
    return config;
};