import { AxiosError, AxiosResponse } from "axios";
import { getDefaultMessage, getResponseByCommand } from "./backend.lib";

const handlerGetDefaultMessage = async (phone: string) =>
  tryingFunction(() => getDefaultMessage(phone), "getDefaultMessage");

const handlerGetResponseByCommand = async (
  phone: string,
  commandCode: number
) =>
  tryingFunction(
    () => getResponseByCommand(phone, commandCode),
    "getResponseByCommand"
  );

const tryingFunction = async (
  fn: () => Promise<AxiosResponse>,
  name: String
) => {
  try {
    let isEnough = false;
    while (true) {
      if (isEnough) break;
      await fn()
        .then(() => {
          console.log(`trying... ${name}`);
          isEnough = true;
        })
        .catch((err: AxiosError) => {
          console.log(`waiting ${name}`, err.code);
        });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } catch (err) {
    throw err;
  }
};

export { handlerGetDefaultMessage, handlerGetResponseByCommand };
