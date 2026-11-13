import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryData } from '../js/gallery-data.js';
import { galleryPhotos } from '../js/gallery-photos.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const thumbnailDirectory = join(root, 'images/galerie-vorschau');
const photosByGroup = {};

mkdirSync(thumbnailDirectory, { recursive: true });

for (const group of galleryData) {
  const relativeDirectory = `images/leistungen/${group.id}/galerie`;
  const directory = join(root, relativeDirectory);
  const previousAlt = new Map(galleryPhotos[group.id]?.map(({ src, alt }) => [src, alt]));
  const files = existsSync(directory) ? readdirSync(directory, { withFileTypes: true }) : [];
  const names = files
    .filter(file => file.isFile() && !file.name.startsWith('.') && /\.(jpe?g|png|webp)$/i.test(file.name))
    .map(file => file.name)
    .sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));

  photosByGroup[group.id] = names.map((name) => {
    const original = join(directory, name);
    const src = `/${relativeDirectory}/${encodeURIComponent(name)}`;
    const hash = createHash('sha256').update(readFileSync(original)).digest('hex').slice(0, 20);
    const thumbnailName = `${hash}.jpg`;
    const thumbnail = join(thumbnailDirectory, thumbnailName);

    if (!existsSync(thumbnail)) {
      execFileSync('sips', [
        '-Z', '600', '-s', 'format', 'jpeg', '-s', 'formatOptions', '75',
        original, '--out', thumbnail
      ]);
    }

    const metadata = execFileSync('sips', [
      '-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'orientation', thumbnail
    ], { encoding: 'utf8' });
    const width = Number(metadata.match(/pixelWidth: (\d+)/)?.[1]);
    const height = Number(metadata.match(/pixelHeight: (\d+)/)?.[1]);
    const rotated = /orientation: [5-8]\s/.test(metadata);

    if (!width || !height) throw new Error(`Bildgröße fehlt: ${original}`);

    return {
      src,
      thumbnail: `/images/galerie-vorschau/${thumbnailName}`,
      width: rotated ? height : width,
      height: rotated ? width : height,
      alt: previousAlt.get(src) ?? `${group.title} – fertige Arbeiten`
    };
  });
}

const header = '// Zusätzliche Nachher-Bilder je Gewerk. Erzeugt von scripts/build-gallery.mjs.\n'
  + '// Alt-Texte dürfen von Hand angepasst werden und bleiben beim nächsten Lauf erhalten.\n';
writeFileSync(
  join(root, 'js/gallery-photos.js'),
  `${header}export const galleryPhotos = ${JSON.stringify(photosByGroup, null, 2)};\n`
);
console.log(Object.entries(photosByGroup).map(([group, photos]) => `${group}: ${photos.length}`).join('\n'));
