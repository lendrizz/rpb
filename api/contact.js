// /api/contact.js - Vercel Serverless Function (Node)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, contact, service, location, message, privacy, website, photos } = body;

    // Honeypot
    if (website) return res.status(200).json({ ok: true });

    // Validation
    if (!name || !contact || !message || !privacy) {
      return res.status(400).json({ error: 'Bitte fülle alle Pflichtfelder aus.' });
    }
    if (String(name).length > 200 || String(message).length > 5000 || String(contact).length > 200) {
      return res.status(400).json({ error: 'Eingabe zu lang.' });
    }

    // Optionale Fotos (vom Browser bereits als JPEG verkleinert, Base64)
    const MAX_PHOTOS = 5;
    const MAX_PHOTO_BYTES = 1_500_000;
    const MAX_TOTAL_BYTES = 3_300_000;
    const attachments = [];
    if (photos !== undefined) {
      if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) {
        return res.status(400).json({ error: 'Bitte sende höchstens 5 Fotos.' });
      }
      let total = 0;
      for (let i = 0; i < photos.length; i += 1) {
        const data = photos[i] && photos[i].data;
        if (typeof data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
          return res.status(400).json({ error: 'Ein Foto konnte nicht verarbeitet werden.' });
        }
        const buf = Buffer.from(data, 'base64');
        const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        if (!isJpeg || buf.length > MAX_PHOTO_BYTES) {
          return res.status(400).json({ error: 'Ein Foto hat ein ungültiges Format oder ist zu groß.' });
        }
        total += buf.length;
        if (total > MAX_TOTAL_BYTES) {
          return res.status(400).json({ error: 'Die Fotos sind insgesamt zu groß. Bitte wähle weniger Fotos oder nutze WhatsApp.' });
        }
        attachments.push({ filename: `foto-${i + 1}.jpg`, content: data });
      }
    }

    // Simple in-memory rate limit (best-effort in serverless)
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown';
    globalThis.__rate = globalThis.__rate || new Map();
    const now = Date.now();
    const key = `${ip}`;
    const hits = (globalThis.__rate.get(key) || []).filter(t => now - t < 10 * 60 * 1000);
    if (hits.length >= 5) {
      return res.status(429).json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen oder anrufen.' });
    }
    hits.push(now);
    globalThis.__rate.set(key, hits);

    const apiKey = process.env.RESEND_API_KEY || process.env.RP_BAU;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server nicht konfiguriert. Bitte anrufen.' });
    }

    const from = process.env.RESEND_FROM || 'anfrage@rp-bau.info';
    const to = process.env.RESEND_TO || 'anfrage@rp-bau.info';
    const safe = (s) => String(s || '').replace(/[\r\n<>]/g, ' ').slice(0, 5000);

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `RP-Bau Website <${from}>`,
        to: [to],
        reply_to: /@/.test(contact) ? safe(contact) : undefined,
        subject: `Neue Anfrage${service ? ': ' + safe(service) : ''} – ${safe(name)}`,
        attachments: attachments.length ? attachments : undefined,
        text: [
          `Name: ${safe(name)}`,
          `Kontakt: ${safe(contact)}`,
          `Leistung: ${safe(service)}`,
          `PLZ/Ort: ${safe(location)}`,
          `Fotos: ${attachments.length ? attachments.length + ' im Anhang' : 'keine'}`,
          '',
          `Nachricht:`,
          safe(message)
        ].join('\n')
      })
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Resend error', err);
      return res.status(502).json({ error: 'E-Mail konnte nicht gesendet werden. Bitte anrufen.' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Unbekannter Fehler. Bitte anrufen.' });
  }
}
