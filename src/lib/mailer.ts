import nodemailer from "nodemailer";
import type { IOrder, IOrderPart } from "@/models/Order";
import { STATUS, trackingUrl, type PartStatus } from "@/lib/orders";

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

export async function sendListingDecisionEmail(to: string, name: string, productName: string, approved: boolean, note?: string) {
  const body = approved
    ? `<p style="margin:0 0 20px;line-height:1.6">Merhaba ${esc(name)}, <b>${esc(productName)}</b> ürünün onaylandı ve artık sitede satışta. Bundan sonra eklediğin ürünler doğrudan yayına girecek.</p>
       <a href="${siteUrl()}/panel" style="display:inline-block;background:#4a5627;color:#fdfbf6;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">Panelime git</a>`
    : `<p style="margin:0 0 20px;line-height:1.6">Merhaba ${esc(name)}, <b>${esc(productName)}</b> ürününde düzeltme gerekiyor.${note ? `<br><br><b>Not:</b> ${esc(note)}` : ""}<br><br>Panelinden ürünü düzenleyip tekrar gönderebilirsin.</p>
       <a href="${siteUrl()}/panel" style="display:inline-block;background:#4a5627;color:#fdfbf6;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">Panelime git</a>`;
  await getTransport().sendMail({
    from: from(),
    to,
    subject: approved ? `Ürünün yayında: ${productName}` : `Ürününde düzeltme gerekiyor: ${productName}`,
    html: layout(approved ? "Ürünün yayında 🎉" : "Ürününde düzeltme gerekiyor", body),
  });
}

/* ---------- Sipariş e-postaları ---------- */

const tl = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
const fmtIban = (s?: string) => (s ?? "").replace(/(.{4})/g, "$1 ").trim();
const button = (href: string, text: string, color = "#4a5627") =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fdfbf6;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">${text}</a>`;
const orderLink = (o: Pick<IOrder, "orderNo" | "token">) => `${siteUrl()}/siparis/${o.orderNo}?t=${o.token}`;

function itemsTable(p: IOrderPart) {
  const rows = p.items
    .map(
      (i) => `<tr><td style="padding:6px 0;font-size:14px">${i.qty} × ${esc(i.name)} <span style="color:#7a6f60">(${esc(i.label)})</span></td>
      <td style="padding:6px 0;font-size:14px;text-align:right;white-space:nowrap">${tl(i.price * i.qty)}</td></tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0">${rows}
    <tr><td style="padding:6px 0;font-size:13px;color:#7a6f60;border-top:1px solid #e8dcc4">Kargo</td><td style="padding:6px 0;font-size:13px;color:#7a6f60;text-align:right;border-top:1px solid #e8dcc4">${p.shipping === 0 ? "Ücretsiz" : tl(p.shipping)}</td></tr>
    <tr><td style="padding:6px 0;font-weight:bold">Toplam</td><td style="padding:6px 0;font-weight:bold;text-align:right">${tl(p.total)}</td></tr></table>`;
}

function payBox(o: IOrder, p: IOrderPart) {
  if (o.payment !== "havale" || p.status !== "pending_payment") return "";
  return `<div style="margin-top:12px;background:#fff7e6;border:1px solid #f0d9a8;border-radius:14px;padding:14px;font-size:14px;line-height:1.6">
    <b>Bu tutarı doğrudan üreticinin hesabına gönder:</b><br>
    Alıcı: <b>${esc(p.ibanName ?? p.sellerName)}</b><br>
    IBAN: <b style="font-family:monospace">${esc(fmtIban(p.iban))}</b><br>
    Tutar: <b>${tl(p.total)}</b><br>
    Açıklama: <b>${o.orderNo}</b></div>`;
}

export async function sendOrderPlacedEmail(o: IOrder) {
  const havale = o.payment === "havale";
  const parts = o.parts
    .map(
      (p) => `<div style="margin:0 0 18px;padding:16px;border:1px solid #e8dcc4;border-radius:16px">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a65a2e;font-weight:bold">${esc(p.sellerName)}</p>
      ${itemsTable(p)}${payBox(o, p)}</div>`
    )
    .join("");
  const intro = havale
    ? `Siparişin alındı. Buharkent Pazarı'nda para hiçbir aracıdan geçmez: her üreticiye ait tutarı <b>doğrudan o üreticinin hesabına</b> havale/EFT ile gönder. Açıklamaya sipariş numaranı (<b>${o.orderNo}</b>) yazmayı unutma. Ödeme ulaşınca üretici siparişini hazırlamaya başlar.`
    : `Siparişin alındı. Ödemeyi kargo teslimatında yapacaksın. Üreticiler siparişini hazırlamaya başladı.`;
  const body = `<p style="margin:0 0 6px;line-height:1.6">Merhaba ${esc(o.customer.name)},</p>
    <p style="margin:0 0 20px;line-height:1.6">${intro}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#7a6f60">Sipariş no: <b style="color:#2b2620">${o.orderNo}</b>${o.parts.length > 1 ? ` · ${o.parts.length} üreticiden ayrı paketler gelecek` : ""}</p>
    ${parts}
    <p style="margin:0 0 20px;font-size:15px"><b>Genel toplam: ${tl(o.total)}</b></p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#7a6f60">Teslimat adresi: ${esc(o.address.address)}, ${esc(o.address.district)} / ${esc(o.address.city)}</p>
    ${button(orderLink(o), "Siparişimi takip et")}`;
  await getTransport().sendMail({ from: from(), to: o.customer.email, subject: `Siparişin alındı · ${o.orderNo}`, html: layout("Siparişin alındı 🎉", body) });
}

export async function sendSellerNewOrderEmail(to: string, name: string, o: IOrder, p: IOrderPart) {
  const pay =
    o.payment === "havale"
      ? `Müşteri <b>${tl(p.total)}</b> tutarını havale ile <b>senin hesabına</b> gönderecek (açıklama: ${o.orderNo}). Para hesabına geçince panelden <b>"Ödeme geldi"</b> butonuna bas, sonra kargola.`
      : `Ödeme <b>kapıda</b> alınacak (${tl(p.total)}). Kargoyu tahsilatlı gönder.`;
  const body = `<p style="margin:0 0 16px;line-height:1.6">Merhaba ${esc(name)}, <b>yeni bir siparişin var!</b></p>
    <div style="margin:0 0 16px;padding:16px;border:1px solid #e8dcc4;border-radius:16px">${itemsTable(p)}</div>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px">${pay}</p>
    <p style="margin:0 0 20px;line-height:1.6;font-size:14px;background:#f3ebdd;border-radius:14px;padding:14px">
      <b>Alıcı:</b> ${esc(o.customer.name)} · ${esc(o.customer.phone)}<br>
      <b>Adres:</b> ${esc(o.address.address)}, ${esc(o.address.district)} / ${esc(o.address.city)}${o.note ? `<br><b>Not:</b> ${esc(o.note)}` : ""}</p>
    ${button(`${siteUrl()}/panel?sekme=siparisler`, "Siparişi panelde aç")}`;
  await getTransport().sendMail({ from: from(), to, subject: `Yeni sipariş · ${o.orderNo}`, html: layout("Yeni siparişin var", body) });
}

export async function sendOrderStatusEmail(o: IOrder, p: IOrderPart, status: PartStatus) {
  const track = trackingUrl(p.cargoCompany, p.trackingNo);
  const text: Record<PartStatus, string> = {
    pending_payment: "",
    preparing: o.payment === "havale" ? `<b>${esc(p.sellerName)}</b> ödemeni aldı ve siparişini hazırlıyor.` : `<b>${esc(p.sellerName)}</b> siparişini hazırlıyor.`,
    shipped: `<b>${esc(p.sellerName)}</b> siparişini kargoya verdi.<br><br><b>Kargo firması:</b> ${esc(p.cargoCompany ?? "-")}<br><b>Takip no:</b> ${esc(p.trackingNo ?? "-")}${track ? `<br><a href="${track}" style="color:#4a5627">Kargonu takip et</a>` : ""}`,
    delivered: `<b>${esc(p.sellerName)}</b> siparişinin teslim edildiğini bildirdi. Afiyet olsun! Ürünleri beğendiysen üreticiye bir yorum bırakmayı unutma.`,
    cancelled: `<b>${esc(p.sellerName)}</b> tarafından gönderilecek ürünlerin iptal edildi.${p.cancelReason ? `<br><br><b>Sebep:</b> ${esc(p.cancelReason)}` : ""}${o.payment === "havale" ? "<br><br>Ödeme yaptıysan iade için üreticiyle iletişime geç; sorun yaşarsan bize yaz." : ""}`,
  };
  if (!text[status]) return;
  const body = `<p style="margin:0 0 6px;line-height:1.6">Merhaba ${esc(o.customer.name)},</p>
    <p style="margin:0 0 20px;line-height:1.6">${text[status]}</p>
    <div style="margin:0 0 20px;padding:16px;border:1px solid #e8dcc4;border-radius:16px">${itemsTable(p)}</div>
    ${button(orderLink(o), "Siparişimi görüntüle")}`;
  await getTransport().sendMail({ from: from(), to: o.customer.email, subject: `${STATUS[status].label} · ${o.orderNo}`, html: layout(STATUS[status].label, body) });
}
