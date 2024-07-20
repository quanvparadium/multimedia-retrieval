import { authApi } from "@/src/apis/auth/auth.api";
import { userApi } from "@/src/apis/user/user.api";
import { useAppDispatch, useAppSelector } from "@/src/store/store";
import { getUser, setUser } from "@/src/store/user/userSlice";
import Image from "next/image";
import { useRouter } from "next/router";
import { FormEventHandler, useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const getMySelf = async () => {
      try {
        const data: any = await userApi.getMe();
        dispatch(setUser(data.user));
        router.push("/");
      } catch (error) {
        console.log(error);
      }
    };
    getMySelf();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data: any = await authApi.login(formData);
      if (data.tokens) {
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
      }
      router.push("/");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="bg-red-200">
      <section className="bg-gray-50  ">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 ">
            <Image className="w-10 h-10 mr-2" src="logo.svg" alt="logo" width={400} height={400} />
            Retrieval System
          </a>
          <div className="w-full bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Sign In to your account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                action="#"
                onSubmit={handleSubmit}
                onChange={handleChange}
              >
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  "
                    placeholder="name@company.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                  />
                </div>
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm font-medium text-primary-600 hover:underline ">
                    Forgot password?
                  </a>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                >
                  Sign In
                </button>
                <p className="text-sm font-light text-gray-500 ">
                  Don’t have an account yet?{" "}
                  <a href="/signup" className="font-medium text-primary-600 hover:underline ">
                    Sign up
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
