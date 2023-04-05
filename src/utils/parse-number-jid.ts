const phoneToJid = (phone: string) =>
  `${String(phone).replace(/\s/g, "")}@s.whatsapp.net`;

const jidToPhone = (jid: string) => String(jid).replace("@s.whatsapp.net", "");

export { phoneToJid, jidToPhone };
