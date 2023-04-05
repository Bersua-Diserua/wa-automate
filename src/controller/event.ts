import Event from "events";
import { SeruaEventEmitter } from "../types/event";

const SERUA_EVENT = new Event.EventEmitter() as SeruaEventEmitter;

export { SERUA_EVENT };
