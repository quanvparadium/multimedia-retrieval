import { axiosWithToken } from "../axios-base";

const getUserApi = (postFix: string) => {
  return `api/users/${postFix}`;
};

export const userApi = {
  getMe: async () => {
    return axiosWithToken.get(getUserApi("me"));
  },
};
