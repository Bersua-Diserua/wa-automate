const phoneToJid = (phone: string) =>
  `${String(phone).replace(/\s/g, "")}@s.whatsapp.net`;

const jidToPhone = (jid: string) => String(jid).replace("@s.whatsapp.net", "");

const isGroupJid = (jid: string) => String(jid).includes("@g.us");

export { phoneToJid, jidToPhone, isGroupJid };
