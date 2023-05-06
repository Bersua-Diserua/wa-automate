import axios from "axios"
import config from "../../utils/config"

const api = axios.create({
  baseURL: config.env.be_server,
  validateStatus: (status) => status < 500,
  headers: {
    "x-api-key": "SEVA",
  },
})

api.interceptors.request.use(
  (val) => {
    val.headers["x-api-key"] = "SEVA"
    return val
  },
  (err) => Promise.reject(err)
)

export { api }
