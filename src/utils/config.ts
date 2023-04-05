import dotnev from "dotenv";
import path from "path";
dotnev.config({
  path: path.resolve(
    process.cwd() +
      (process.env.NODE_ENV == "production" ? "/.env" : "/.env.local")
  ),
});

const config = {
  env: {
    be_server: process.env.BE_SERVER,
    port: process.env.PORT,
    node: process.env.NODE_ENV,
    redis_host: process.env.REDIS_HOST,
    redis_port: process.env.REDIS_PORT,
  },
  isProd: process.env.NODE_ENV === "production",
};

if (
  typeof config.env.be_server !== "string" ||
  config.env.be_server.length == 0
)
  throw new Error(`Config be server config should't empty`);

export default config;
