import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactRequest = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  projectType?: unknown;
  message?: unknown;
  website?: unknown;
};

const resend = new Resend(process.env.RESEND_API_KEY);

const CONTACT_EMAIL = "info@arzmimarlik.net";
const FROM_EMAIL = "ARZ Mimarlık <form@arzmimarlik.net>";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMessage(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY tanımlı değil.");

      return NextResponse.json(
        {
          message:
            "E-posta servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
        },
        { status: 500 },
      );
    }

    let body: ContactRequest;

    try {
      body = (await request.json()) as ContactRequest;
    } catch {
      return NextResponse.json(
        { message: "Geçersiz form verisi gönderildi." },
        { status: 400 },
      );
    }

    const name = cleanText(body.name, 120);
    const phone = cleanText(body.phone, 50);
    const email = cleanText(body.email, 160).toLowerCase();
    const projectType = cleanText(body.projectType, 100);
    const message = cleanText(body.message, 5000);
    const website = cleanText(body.website, 300);

    // Honeypot alanı doluysa bot kabul edilir.
    // Başarılı yanıt dönerek botun tekrar denemesini azaltıyoruz.
    if (website) {
      return NextResponse.json(
        { message: "Mesajınız başarıyla gönderildi." },
        { status: 200 },
      );
    }

    if (!name || !phone || !message) {
      return NextResponse.json(
        {
          message:
            "Lütfen ad soyad, telefon ve mesaj alanlarını doldurun.",
        },
        { status: 400 },
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Lütfen geçerli bir e-posta adresi girin." },
        { status: 400 },
      );
    }

    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email || "Belirtilmedi");
    const safeProjectType = escapeHtml(projectType || "Belirtilmedi");
    const safeMessage = formatMessage(message);

    const adminEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: [CONTACT_EMAIL],
      replyTo: email || undefined,
      subject: `Yeni iletişim talebi — ${name}`,
      html: `
        <!doctype html>
        <html lang="tr">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Yeni İletişim Talebi</title>
          </head>
          <body style="margin:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#111111;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f2f2;padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dddddd;">
                    <tr>
                      <td style="background:#090909;padding:32px;">
                        <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#9a9a9a;">ARZ Mimarlık</p>
                        <h1 style="margin:18px 0 0;font-size:30px;line-height:1.2;font-weight:400;color:#ffffff;">Yeni iletişim talebi</h1>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:32px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding:0 0 18px;border-bottom:1px solid #e5e5e5;">
                              <p style="margin:0 0 7px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777777;">Ad Soyad</p>
                              <p style="margin:0;font-size:17px;line-height:1.5;color:#111111;">${safeName}</p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:18px 0;border-bottom:1px solid #e5e5e5;">
                              <p style="margin:0 0 7px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777777;">Telefon</p>
                              <p style="margin:0;font-size:17px;line-height:1.5;color:#111111;">${safePhone}</p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:18px 0;border-bottom:1px solid #e5e5e5;">
                              <p style="margin:0 0 7px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777777;">E-posta</p>
                              <p style="margin:0;font-size:17px;line-height:1.5;color:#111111;">${safeEmail}</p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:18px 0;border-bottom:1px solid #e5e5e5;">
                              <p style="margin:0 0 7px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777777;">Proje Türü</p>
                              <p style="margin:0;font-size:17px;line-height:1.5;color:#111111;">${safeProjectType}</p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:18px 0 0;">
                              <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777777;">Mesaj</p>
                              <p style="margin:0;font-size:16px;line-height:1.8;color:#222222;">${safeMessage}</p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:30px 0 0;font-size:12px;line-height:1.7;color:#777777;">
                          Bu mesaj arzmimarlik.net iletişim formu üzerinden gönderildi.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: [
        "ARZ Mimarlık - Yeni İletişim Talebi",
        "",
        `Ad Soyad: ${name}`,
        `Telefon: ${phone}`,
        `E-posta: ${email || "Belirtilmedi"}`,
        `Proje Türü: ${projectType || "Belirtilmedi"}`,
        "",
        "Mesaj:",
        message,
      ].join("\n"),
    });

    if (adminEmail.error) {
      console.error("Yönetici e-postası gönderilemedi:", adminEmail.error);

      return NextResponse.json(
        {
          message:
            "Mesaj gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
        },
        { status: 500 },
      );
    }

    // E-posta alanı doldurulduysa kullanıcıya otomatik teşekkür mesajı gönder.
    // Bu e-postanın başarısız olması ana form gönderimini başarısız saymaz.
    if (email) {
      const confirmationEmail = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        replyTo: CONTACT_EMAIL,
        subject: "Talebinizi aldık | ARZ Mimarlık",
        html: `
          <!doctype html>
          <html lang="tr">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>Talebinizi Aldık</title>
            </head>
            <body style="margin:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#111111;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f2f2;padding:32px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#090909;border:1px solid #222222;">
                      <tr>
                        <td style="padding:42px 34px;">
                          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888888;">ARZ Mimarlık</p>

                          <h1 style="margin:28px 0 0;font-size:34px;line-height:1.2;font-weight:400;color:#ffffff;">
                            Talebinizi aldık.
                          </h1>

                          <p style="margin:28px 0 0;font-size:16px;line-height:1.8;color:#bdbdbd;">
                            Merhaba ${safeName},
                          </p>

                          <p style="margin:14px 0 0;font-size:16px;line-height:1.8;color:#bdbdbd;">
                            ARZ Mimarlık ile iletişime geçtiğiniz için teşekkür ederiz.
                            Mesajınız tarafımıza ulaştı. Ekibimiz talebinizi inceleyerek
                            en kısa sürede sizinle iletişime geçecektir.
                          </p>

                          <div style="margin-top:34px;padding-top:26px;border-top:1px solid #2c2c2c;">
                            <p style="margin:0;font-size:13px;line-height:1.8;color:#777777;">
                              info@arzmimarlik.net<br />
                              +90 542 570 44 29<br />
                              arzmimarlik.net
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        text: [
          `Merhaba ${name},`,
          "",
          "ARZ Mimarlık ile iletişime geçtiğiniz için teşekkür ederiz.",
          "Mesajınız tarafımıza ulaştı. En kısa sürede sizinle iletişime geçeceğiz.",
          "",
          "ARZ Mimarlık",
          "info@arzmimarlik.net",
          "+90 542 570 44 29",
          "arzmimarlik.net",
        ].join("\n"),
      });

      if (confirmationEmail.error) {
        console.error(
          "Otomatik teşekkür e-postası gönderilemedi:",
          confirmationEmail.error,
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("İletişim formu hatası:", error);

    return NextResponse.json(
      {
        message:
          "Mesaj gönderilirken beklenmeyen bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
      },
      { status: 500 },
    );
  }
}