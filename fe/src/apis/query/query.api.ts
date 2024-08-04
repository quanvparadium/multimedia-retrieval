import { axiosWithToken } from "../axios-base";

// const getFolderApi = (postFix: string) => {
//   return `api/users/${postFix}`;
// };

export const queryApi = {
    get: async (params: any) => {
        return axiosWithToken.get(`/api/search/files`, { params });
    },
    search: async (formData: FormData) => {
        return axiosWithToken.post(`/api/search/files`, formData);

    }
    // rename: async (path: string, newName: string) => {
    //   return axiosWithToken.post(`/api/folders/rename`, { path, newName });
    // },
};
