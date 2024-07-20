import { axiosWithToken } from "../axios-base";

// const getFolderApi = (postFix: string) => {
//   return `api/users/${postFix}`;
// };

export const fileSystemApi = {
  getFileSystemOfFolder: async (id: string) => {
    return axiosWithToken.get(`/api/folders`, { params: { id } });
  },
  getMyDrive: async () => {
    return axiosWithToken.get(`/api/folders/my-drive`);
  },
  createNewFolder: async (parentFolderId: string | undefined, folderName: string) => {
    return axiosWithToken.post(`/api/folders`, { parentId: parentFolderId, folderName });
  },
  getRecent: async (type: string) => {
    return axiosWithToken.get(`/api/folders/recent`, { params: { type } });
  }
  // rename: async (path: string, newName: string) => {
  //   return axiosWithToken.post(`/api/folders/rename`, { path, newName });
  // },
};
