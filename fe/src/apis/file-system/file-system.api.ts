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
  },
  getParent: async (fileId: string) => {
    return axiosWithToken.get(`/api/folders/${fileId}/parent`);
  },
  changeFileName: async (fileId: string, fileName: string) => {
    return axiosWithToken.put(`/api/folders/${fileId}/rename/${fileName}`);
  },
  download: async (fileId: string) => {
    return axiosWithToken.get(`/api/folders/${fileId}/download`);
  },
  moveToTrash: async (fileId: string) => {
    return axiosWithToken.delete(`/api/folders/${fileId}`);
  },
  deleteForever: async (fileId: string) => {
    return axiosWithToken.delete(`/api/folders/${fileId}/forever`);
  },
  restore: async (fileId: string) => {
    return axiosWithToken.put(`/api/folders/${fileId}/restore`);
  },
  getDeletedFiles: async () => {
    return axiosWithToken.get(`/api/folders/recentDeleted`);
  },
  getSize: async () => {
    return axiosWithToken.get(`/api/folders/total-size`);
  },
  getTopFiles: async (params: any) => {
    return axiosWithToken.get(`/api/folders/top-size`, { params });
  },
  searchFiles: async (text: string) => {
    return axiosWithToken.get(`/api/folders/search`, { params: { text } });
  }
  // rename: async (path: string, newName: string) => {
  //   return axiosWithToken.post(`/api/folders/rename`, { path, newName });
  // },
};

