import IoRedis from "ioredis";
import config from "../../utils/config";

const redisClient = new IoRedis({
  host: config.env.redis_host,
  port: Number(config.env.redis_port),
});

console.log({ redisStatus: redisClient.status });

if (config.env.node === "development") {
  redisClient.on("monitor", (args) => {
    console.log(args);
  });
}

export { redisClient };
