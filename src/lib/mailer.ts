import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransport() {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error("E-posta ayarları eksik (GMAIL_USER / GMAIL_APP_PASSWORD)");
    transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  }
  return transporter;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#faf6ee;font-family:Arial,Helvetica,sans-serif;color:#2b2620">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fdfbf6;border-radius:24px;overflow:hidden;border:1px solid #e8dcc4">
    <tr><td style="background:#2f3718;padding:24px 32px;color:#fdfbf6;font-family:Georgia,serif;font-size:22px">Buharkent<span style="color:#c0703f">.</span></td></tr>
    <tr><td style="padding:32px">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;color:#2f3718">${title}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:20px 32px;background:#f3ebdd;font-size:12px;color:#7a6f60">Buharkent Pazarı · Buharkent Yerel Eylem Grubu Derneği girişimidir.<br>Bu e-postayı siz talep etmediyseniz dikkate almayabilirsiniz.</td></tr>
  </table></td></tr></table></body></html>`;
}

const from = () => `"Buharkent Pazarı" <${process.env.GMAIL_USER}>`;

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const body = `<p style="margin:0 0 20px;line-height:1.6">Merhaba ${esc(name)}, Buharkent Pazarı hesabını doğrulamak için aşağıdaki kodu kullan:</p>
  <div style="font-size:36px;letter-spacing:10px;font-weight:bold;color:#4a5627;background:#f3ebdd;border-radius:16px;padding:18px;text-align:center">${code}</div>
  <p style="margin:20px 0 0;font-size:14px;color:#7a6f60">Kod 10 dakika geçerlidir. Kimseyle paylaşma.</p>`;
  await getTransport().sendMail({
    from: from(),
    to,
    subject: `Doğrulama kodun: ${code}`,
    text: `Merhaba ${name}, Buharkent Pazarı doğrulama kodun: ${code} (10 dakika geçerlidir).`,
    html: layout("Hesabını doğrula", body),
  });
}

export async function sendSellerReceivedEmail(to: string, name: string) {
  const body = `<p style="margin:0;line-height:1.6">Merhaba ${esc(name)}, üretici başvurunu aldık. Ekibimiz başvurunu inceleyip en kısa sürede seninle iletişime geçecek. Onaylandığında bu adrese bilgi göndereceğiz.</p>`;
  await getTransport().sendMail({ from: from(), to, subject: "Üretici başvurun alındı", html: layout("Başvurun alındı", body) });
}

export async function sendSellerDecisionEmail(to: string, name: string, approved: boolean, reason?: string) {
  const site = process.env.AUTH_URL ?? "https://buharkent-pazari.vercel.app";
  const body = approved
    ? `<p style="margin:0 0 20px;line-height:1.6">Merhaba ${esc(name)}, üretici başvurun <b>onaylandı</b>. Buharkent Pazarı ailesine hoş geldin! Artık giriş sayfasındaki <b>Üretici</b> sekmesinden giriş yapabilirsin.</p>
       <a href="${site}/giris?tab=uretici" style="display:inline-block;background:#4a5627;color:#fdfbf6;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">Giriş yap</a>`
    : `<p style="margin:0;line-height:1.6">Merhaba ${esc(name)}, üretici başvurun şu an için onaylanamadı.${reason ? `<br><br><b>Not:</b> ${esc(reason)}` : ""}<br><br>Sorularınız için bize ulaşabilirsiniz.</p>`;
  await getTransport().sendMail({
    from: from(),
    to,
    subject: approved ? "Üretici başvurun onaylandı" : "Üretici başvurun hakkında",
    html: layout(approved ? "Başvurun onaylandı 🎉" : "Başvurun hakkında", body),
  });
}
const siteUrl = () => process.env.AUTH_URL ?? "https://buharkent-pazari.vercel.app";

export async function sendDocumentRejectedEmail(to: string, name: string, docName: string, note?: string) {
  const body = `<p style="margin:0 0 20px;line-height:1.6">Merhaba ${esc(name)}, yüklediğin <b>${esc(docName)}</b> belgesinde düzeltme gerekiyor.${note ? `<br><br><b>Not:</b> ${esc(note)}` : ""}<br><br>Başvurum sayfandan belgeyi yeniden yükleyebilirsin.</p>
  <a href="${siteUrl()}/basvurum" style="display:inline-block;background:#4a5627;color:#fdfbf6;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">Başvuruma git</a>`;
  await getTransport().sendMail({ from: from(), to, subject: "Belgende düzeltme gerekiyor", html: layout("Belgende düzeltme gerekiyor", body) });
}

export async function sendReportAlertEmail(to: string[], productName: string, sellerName: string, reason: string, note: string) {
  if (!to.length) return;
  const body = `<p style="margin:0 0 12px;line-height:1.6"><b>${esc(productName)}</b> (${esc(sellerName)}) için yeni bir bildirim geldi.</p>
  <p style="margin:0 0 12px"><b>Sebep:</b> ${esc(reason)}</p>
  ${note ? `<p style="margin:0 0 20px;white-space:pre-line">${esc(note)}</p>` : ""}
  <p style="margin:0 0 20px;font-size:14px;color:#7a6f60">Aracı hizmet sağlayıcı olarak hukuka aykırı içerikten haberdar olunca gecikmeden işlem yapılmalı.</p>
  <a href="${siteUrl()}/yonetim/bildirimler" style="display:inline-block;background:#c0703f;color:#fdfbf6;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">Bildirimleri incele</a>`;
  await getTransport().sendMail({ from: from(), to, subject: `Ürün bildirimi: ${productName}`, html: layout("Yeni ürün bildirimi", body) });
}

export async function sendListingRemovedEmail(to: string, name: string, productName: string) {
  const body = `<p style="margin:0;line-height:1.6">Merhaba ${esc(name)}, <b>${esc(productName)}</b> ilanın hakkında gelen bir bildirim sonrası yayından kaldırıldı. Detaylar için bizimle iletişime geçebilirsin.</p>`;
  await getTransport().sendMail({ from: from(), to, subject: "İlanın yayından kaldırıldı", html: layout("İlanın yayından kaldırıldı", body) });
}
