import { axiosWithToken } from "../axios-base";

// const getFolderApi = (postFix: string) => {
//   return `api/users/${postFix}`;
// };

export const fileSystemApi = {
  getFileSystemOfFolder: async (path: string) => {
    return axiosWithToken.get(`/api/folders`, { params: { path } });
  },
  createNewFolder: async (path: string, folderName: string) => {
    return axiosWithToken.post(`/api/folders`, { path, folderName });
  },
  rename: async (path: string, newName: string) => {
    return axiosWithToken.post(`/api/folders/rename`, { path, newName });
  },
};
