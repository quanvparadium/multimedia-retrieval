import { axiosWithToken } from "../axios-base";

// const getFolderApi = (postFix: string) => {
//   return `api/users/${postFix}`;
// };

export const fileSystemApi = {
  getFileSystemOfFolder: async (path: string) => {
    return axiosWithToken.get(`/api/folders`, { params: { path } });
  },
};
