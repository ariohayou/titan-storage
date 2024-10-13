const FilterModule = {
    namespaced: true,
    
    state: {
        purchaseOrder: {},
        goodsReceipt: {},
        issueToProduction: {},
        receiptFromProduction: {},
        salesOrder: {},
        deliveryOrder: {},
        stockAdjustment: {},
        stockTransfer: {},
        manualIssue: {},
        manualReceipt: {}
    },

    getters: {
        purchaseOrder: (state) => state.purchaseOrder,
        goodsReceipt: (state) => state.goodsReceipt,
        issueToProduction: (state) => state.issueToProduction,
        receiptFromProduction: (state) => state.receiptFromProduction,
        salesOrder: (state) => state.salesOrder,
        deliveryOrder: (state) => state.deliveryOrder,
        stockAdjustment: (state) => state.stockAdjustment,
        stockTransfer: (state) => state.stockTransfer,
        manualIssue: (state) => state.manualIssue,
        manualReceipt: (state) => state.manualReceipt,
    },

    mutations: {
        purchaseOrder: (state, payload) => state.purchaseOrder = payload,
        goodsReceipt: (state, payload) => state.goodsReceipt = payload,
        issueToProduction: (state, payload) => state.issueToProduction = payload,
        receiptFromProduction: (state, payload) => state.receiptFromProduction = payload,
        salesOrder: (state, payload) => state.salesOrder = payload,
        deliveryOrder: (state, payload) => state.deliveryOrder = payload,
        stockAdjustment: (state, payload) => state.stockAdjustment = payload,
        stockTransfer: (state, payload) => state.stockTransfer = payload,
        manualIssue: (state, payload) => state.manualIssue = payload,
        manualReceipt: (state, payload) => state.manualReceipt = payload,
    },
};

export default FilterModule;