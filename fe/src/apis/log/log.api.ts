import { axiosWithToken } from "../axios-base";


export const logApi = {
    upload: async (action: any, data: any) => {
        return axiosWithToken.post(`/api/logs`, { action, data });
    },
};
