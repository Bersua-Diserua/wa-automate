export type MessageTemplate = {
  commandCode: number;
  command?: string;
  message: string;
  callback?: unknown;
};
