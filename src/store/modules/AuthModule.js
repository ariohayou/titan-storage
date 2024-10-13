const AuthModule = {
    namespaced: true,

    state: {
        identity: null,
        titleHierarchy: null
    },

    getters: {
        identity: (state) => state.identity,
        titleHierarchy: (state) => state.titleHierarchy
    },

    mutations: {
        identity: (state, payload) => state.identity = payload,
        titleHierarchy: (state, payload) => state.titleHierarchy = payload
    },
};

export default AuthModule;