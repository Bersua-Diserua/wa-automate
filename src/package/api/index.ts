import axios from "axios"
import config from "../../utils/config"

const api = axios.create({
  baseURL: config.env.be_server,
  validateStatus: (status) => status < 500,
})

export { api }
