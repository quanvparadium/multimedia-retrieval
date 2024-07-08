import { axiosWithToken } from "../axios-base";


export const uploadApi = {
    upload: async (folderId: string, formData: FormData) => {
        return axiosWithToken.post(`/api/uploads/${folderId}`, formData);
    },
};
