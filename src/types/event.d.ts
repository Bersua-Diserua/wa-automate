import type EventEmitter from "events";
import { AttachImage, GeneralText } from ".";

type SeruaEventMap = {
  send:
    | { type: "general-text"; data: GeneralText }
    | { type: "attach-media"; data: AttachImage };
};

export interface CommonSeruaEventEmitter extends EventEmitter {
  on<T extends keyof SeruaEventMap>(
    event: T,
    listener: (arg: SeruaEventMap[T]) => void
  ): this;
  off<T extends keyof SeruaEventMap>(
    event: T,
    listener: (arg: SeruaEventMap[T]) => void
  ): this;
  removeAllListeners<T extends keyof SeruaEventMap>(event: T): this;
  emit<T extends keyof SeruaEventMap>(event: T, arg: SeruaEventMap[T]): boolean;
}

export type SeruaEventEmitter = CommonSeruaEventEmitter;
