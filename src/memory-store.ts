import { getFilePath } from "."
import { makeInMemoryStore } from "@whiskeysockets/baileys"

const FILE_NAME = "seva_store.json"

const store = makeInMemoryStore({})

try {
  store.readFromFile(getFilePath(FILE_NAME))
} catch (error) {}

// saves the state to a file every 10s
setInterval(() => {
  try {
    store.writeToFile(FILE_NAME)
  } catch (error) {}
}, 10_000)

export { store }
