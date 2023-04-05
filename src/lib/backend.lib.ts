import axios, { AxiosResponse } from "axios";

import config from "../utils/config";

const axiosBackend = axios.create({ baseURL: config.env.be_server });

export const getDefaultMessage = (phone: string): Promise<AxiosResponse> =>
  new Promise((resolve, reject) => {
    axiosBackend
      .get("/bot/default", {
        params: { phone },
      })
      .then((val) => resolve(val))
      .catch((err) => reject(err));
  });

export const getResponseByCommand = (
  phone: string,
  commandCode: number
): Promise<AxiosResponse> =>
  new Promise((resolve, reject) => {
    axiosBackend
      .post("/bot/get-command", {
        commandCode,
        phone,
      })
      .then((val) => resolve(val))
      .catch((err) => reject(err));
  });
