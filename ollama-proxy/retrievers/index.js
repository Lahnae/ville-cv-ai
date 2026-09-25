const providers = {
    markdown: () => require('./markdown')
};

function createRetriever(options = {}) {
    const provider = options.provider || process.env.RETRIEVER_PROVIDER || 'markdown';
    const loadProvider = providers[provider];
    if (!loadProvider) throw new Error(`Unknown retriever provider: ${provider}`);

    const implementation = loadProvider();
    if (typeof implementation.create !== 'function') {
        throw new Error(`Retriever provider '${provider}' must export create(options)`);
    }
    const retriever = implementation.create(options);
    if (typeof retriever.retrieve !== 'function') {
        throw new Error(`Retriever provider '${provider}' must implement retrieve(query)`);
    }
    return retriever;
}

module.exports = { createRetriever };
