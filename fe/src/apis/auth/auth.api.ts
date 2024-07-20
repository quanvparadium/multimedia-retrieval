import { axiosWithoutToken } from "../axios-base";

const getAuthApi = (postFix: string) => {
  return `api/auth/${postFix}`;
};

export const authApi = {
  login: async (data: ILogin) => {
    return axiosWithoutToken.post(getAuthApi("login"), data);
  },
  signup: async (data: ISignUp) => {
    return axiosWithoutToken.post(getAuthApi("signup"), data);
  },
};

interface ILogin {
  email: string;
  password: string;
}
interface ISignUp {
  email: string;
  password: string;
  name: string;
}
