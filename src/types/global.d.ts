export {}

declare global {
  type TResponse<TObj extends unknown = unknown> = {
    message: string
    payload: TObj
  }
}
