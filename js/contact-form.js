// js/contact-form.js
const MAX_PHOTOS = 5;
const MAX_TOTAL_BYTES = 3_000_000; // Vercel erlaubt ca. 4,5 MB pro Anfrage; Base64 vergrößert um etwa ein Drittel
// Stufen: (längste Kante in px, JPEG-Qualität). Es wird die erste Stufe genommen, die unter dem Limit bleibt.
const QUALITY_STEPS = [[1600, 0.8], [1280, 0.7], [1024, 0.6]];

const form = document.getElementById('contact-form');
const serviceNames = new Map([
  ['fliesenlegen', 'Fliesen & Bodenbeläge'],
  ['sanierung', 'Sanierung'],
  ['badsanierung', 'Badsanierung'],
  ['maler-tapezierarbeiten', 'Maler- und Tapezierarbeiten'],
  ['trockenbau', 'Trockenbau'],
  ['balkon', 'Balkon']
]);
const selectedService = serviceNames.get(new URLSearchParams(window.location.search).get('leistung'));

async function loadBitmap(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return createImageBitmap(file);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Lesefehler'));
    reader.readAsDataURL(blob);
  });
}

async function resizeToJpeg(bitmap, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Bild konnte nicht umgewandelt werden');
  return blob;
}

// Verkleinert alle Fotos im Browser, damit die Anfrage klein genug bleibt.
async function preparePhotos(files) {
  const bitmaps = [];
  for (const file of files) bitmaps.push(await loadBitmap(file));

  let blobs = [];
  for (const [maxSide, quality] of QUALITY_STEPS) {
    blobs = [];
    for (const bitmap of bitmaps) blobs.push(await resizeToJpeg(bitmap, maxSide, quality));
    if (blobs.reduce((sum, b) => sum + b.size, 0) <= MAX_TOTAL_BYTES) break;
  }
  bitmaps.forEach((b) => b.close && b.close());

  const total = blobs.reduce((sum, b) => sum + b.size, 0);
  if (total > MAX_TOTAL_BYTES) throw new Error('Fotos zu groß');

  const photos = [];
  for (let i = 0; i < blobs.length; i += 1) {
    photos.push({ name: `foto-${i + 1}.jpg`, data: await blobToBase64(blobs[i]) });
  }
  return photos;
}

if (form) {
  if (selectedService && !form.elements.message.value) {
    form.elements.message.value = `Mein Projekt: ${selectedService}\n\n`;
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const btn = form.querySelector('button[type="submit"]');
    const fd = new FormData(form);
    fd.delete('photos');
    const data = Object.fromEntries(fd.entries());
    const files = Array.from(form.querySelector('#photos')?.files || []);

    data.name = data.name?.trim();
    data.contact = data.contact?.trim();
    data.message = data.message?.trim();
    if (selectedService) data.service = selectedService;

    if (data.website) return; // honeypot
    if (!data.name || !data.contact || !data.message || data.message === `Mein Projekt: ${selectedService}` || !data.privacy) {
      if (status) status.textContent = 'Bitte fülle alle Pflichtfelder aus.';
      return;
    }
    if (files.length > MAX_PHOTOS) {
      if (status) status.textContent = `Bitte wähle höchstens ${MAX_PHOTOS} Fotos aus.`;
      return;
    }

    btn.disabled = true;
    try {
      if (files.length) {
        if (status) status.textContent = 'Fotos werden vorbereitet…';
        try {
          data.photos = await preparePhotos(files);
        } catch {
          if (status) status.textContent = 'Die Fotos konnten nicht verarbeitet werden. Bitte wähle andere Bilder (JPG, PNG oder WebP) oder sende sie per WhatsApp.';
          return;
        }
      }
      if (status) status.textContent = 'Anfrage wird gesendet…';
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        if (status) status.textContent = 'Vielen Dank. Deine Anfrage wurde gesendet. Wir melden uns innerhalb von 24 Stunden.';
      } else {
        if (status) status.textContent = out.error || 'Die Anfrage konnte nicht gesendet werden. Bitte nutze Telefon oder WhatsApp.';
      }
    } catch {
      if (status) status.textContent = 'Verbindungsfehler. Bitte nutze Telefon oder WhatsApp.';
    } finally {
      btn.disabled = false;
    }
  });
}
