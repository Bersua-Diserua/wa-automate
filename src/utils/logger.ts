import winston, { format, transports } from "winston"
import config from "./config"
// import { teleErrorSend, teleSend } from "./telegramHelper";
import path from "path"
import { inspect } from "node:util"

/**
 * Transport logger to telegram
 */
const teleCallback = format((info) => {
  const { level, message, ...rest } = info as {
    level: LevelMap
    message: string
  } & { [key in any]: any }

  //   if (level == "error") teleErrorSend("", JSON.stringify(info));
  //   else if (level == "activity") teleSend(info.message, JSON.stringify(info));
  //   else console.log(`Not handler logger level :` + JSON.stringify(info));

  return info
})

/**
 * Destruct Error instance
 */
const errorStackFormat = format((info) => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message,
    })
  }
  return info
})

/**
 * Generate transport file config
 */
const transportFileConfig = (
  level: LevelMap,
  filename?: string
): winston.transports.FileTransportOptions => ({
  level,
  filename: path.resolve(
    process.cwd() + "/logs/" + (filename ?? `${level}`) + ".log"
  ),
})

const customLevels = {
  error: 1,
  activity: 4,
  debug: 7,
}

const formatProduction = () =>
  format.combine(
    format.metadata(),
    format.simple(),
    errorStackFormat(),
    format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
    // teleCallback(),
    format.printf(
      ({ timestamp, level, message, ...rest }) =>
        `${timestamp} ${level}: ${message} ${inspect(rest)}`
    )
  )

const formatDevelopment = () =>
  format.combine(
    format.simple(),
    errorStackFormat(),
    format.metadata(),
    format.printf(
      ({ level, message, metadata }) =>
        `${level.toUpperCase()}: ${message} ` + inspect(metadata)
    )
  )

const Logger = winston.createLogger({
  levels: customLevels,
  level: <LevelMap>(config.isProd ? "activity" : "debug"),
  format: format.combine(
    config.isProd ? formatProduction() : formatDevelopment()
  ),
  transports: [new transports.Console()],
  handleExceptions: true,
  exceptionHandlers: [new transports.File(transportFileConfig("error"))],
  handleRejections: true,
  rejectionHandlers: [new transports.File(transportFileConfig("error"))],
  // @ts-expect-error
  exitOnError: (err) => err?.code !== "EPIPE",
}) as CustLoggerProps

Logger.add(new transports.File(transportFileConfig("activity")))
Logger.add(new transports.File(transportFileConfig("error")))

type LevelMap = keyof typeof customLevels

type CustomLevels = {
  [key in keyof typeof customLevels]: winston.LeveledLogMethod
}

interface CustLoggerProps extends winston.Logger, CustomLevels {}

export default Logger
