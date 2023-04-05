export type MessageTemplate = {
  commandCode: number;
  command?: string;
  message: string;
  callback?: unknown;
  type: "text" | "image";
};

export type GeneralText = {
  phone: string;
  message: string;
};

export type AttachImage = {
  phone: string;
  message: string;
  image: string;
};
