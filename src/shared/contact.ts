export const CONTACT_PHONE_DISPLAY = '(11) 91418-3670';
export const CONTACT_WHATSAPP_NUMBER = '55' + CONTACT_PHONE_DISPLAY.replace(/\D/g, '');
export function contactWhatsappUrl(text: string) {
  const url = new URL('https://wa.me/' + CONTACT_WHATSAPP_NUMBER);
  url.searchParams.set('text', text);
  return url.href;
}
