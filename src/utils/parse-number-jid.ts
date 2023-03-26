const phoneToJid = (phone: string) =>
  `${String(phone).replace(/\s/g, "")}@s.whatsapp.net`;

export { phoneToJid };
