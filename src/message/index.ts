export const VCARD_CUSTOMER_TEMPLATE = (phone: string) => `BEGIN:VCARD
VERSION:3.0
FN:+${phone}
ORG:+${phone};
TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}
END:VCARD`;
