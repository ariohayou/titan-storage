import http from "./http";

const CameraApi = {
    endPoint: "api/camera/",

    async getAll(filter = {
        keyword: null,
        stockable: null,
        rawMaterials: null,
        finishedGoods: null,
        isActive: null
    }) {
        const response = await http.get(this.endPoint, { params: filter });
        return response.data;
    },
    async CreateUpdateGroup(resource) {
        const response = await http.post(`${this.endPoint}CreateUpdateGroup`, resource);
        return response.data;
    },
    async CreateUpdateCamera(resource) {
        const response = await http.post(`${this.endPoint}CreateUpdateCamera`, resource);
        return response.data;
    },
    async GetListCameraGrouped() {
        const response = await http.get(this.endPoint + `GetListCameraGrouped`);
        return response.data;
    },
    async getStamp(id) {
        const response = await http.get(this.endPoint + `/stamp/${id}`);
        return response.data;
    },

    async get(id) {
        const response = await http.get(this.endPoint + `/${id}`);
        return response.data;
    },

    async create(resource) {
        const response = await http.post(this.endPoint, resource);
        return response.data;
    },

    async update(resource) {
        const response = await http.put(this.endPoint + `/${resource.id}`, resource);
        return response.data;
    },
    async UpdateCameraName(cameraName, rstpAddress) {
        const response = await http.put(this.endPoint + `/UpdateCameraName`, cameraName, rstpAddress);
        return response.data;
    },

    async delete(id) {
        await http.delete(this.endPoint + `/${id}`);
    },
    
    async import(file) {
        const formData = new FormData();
        formData.append("file", file);
        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };
        return await http.post(this.endPoint + `/import`, formData, config);
    },
    
    async getTemplate() {
        const config = {
            responseType: "blob"
        };
        return await http.get(this.endPoint + `/template`, config);
    }
};

export default CameraApi;

