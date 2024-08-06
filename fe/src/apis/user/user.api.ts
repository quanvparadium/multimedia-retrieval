import { axiosWithToken } from "../axios-base";

const getUserApi = (postFix: string) => {
  return `api/users/${postFix}`;
};

export const userApi = {
  getMe: async () => {
    return axiosWithToken.get(getUserApi("me"));
  },
  changeAvatar: async (formData: FormData) => {
    return axiosWithToken.put(getUserApi("avatar"), formData);
  },
  changeName: async (newName: string) => {
    return axiosWithToken.put(getUserApi(`rename/${newName}`));
  }
};
