// js/gallery-data.js
// Vorher/Nachher-Vergleiche je Gewerk. Pfade unter /images/ ablegen.
// orientation: 'portrait' (Handyfotos 9:16) oder 'landscape' (16:9)
// Die zusätzlichen Nachher-Bilder je Gewerk stehen in js/gallery-photos.js
// (wird von scripts/build-gallery.mjs erzeugt).
export const galleryData = [
  {
    id: 'fliesenlegen',
    title: 'Fliesen & Bodenbeläge',
    items: [
      {
        orientation: 'portrait',
        before: '/images/leistungen/fliesenlegen/vorher-1.jpg',
        after: '/images/leistungen/fliesenlegen/nachher-1.jpg',
        altBefore: 'Dachgeschoss-Bad im Rohbau mit Dachfenstern, Estrich und offenen Leitungen vor den Fliesenarbeiten',
        altAfter: 'Dachgeschoss-Bad nach den Fliesenarbeiten mit großformatigen grauen Fliesen an Wand und Boden und Ablaufrinne'
      }
    ]
  },
  {
    id: 'sanierung',
    title: 'Sanierung',
    items: [
      {
        orientation: 'landscape',
        before: '/images/leistungen/sanierung/vorher-1.jpg',
        after: '/images/leistungen/sanierung/nachher-1.png',
        altBefore: 'Objekt vor der Sanierung',
        altAfter: 'Objekt nach der Sanierung'
      }
    ]
  },
  {
    id: 'badsanierung',
    title: 'Badsanierung',
    items: [
      {
        orientation: 'portrait',
        before: '/images/leistungen/badsanierung/vorher-1.jpg',
        after: '/images/leistungen/badsanierung/nachher-1.jpg',
        altBefore: 'Gäste-WC mit alten grauen Wandfliesen und braun gemustertem Bodenbelag vor der Sanierung',
        altAfter: 'Gäste-WC nach der Sanierung mit Wand-WC und großformatigen Fliesen an Wand und Boden'
      }
    ]
  },
  {
    id: 'maler-tapezierarbeiten',
    title: 'Maler- und Tapezierarbeiten',
    items: [
      {
        orientation: 'landscape',
        before: '/images/leistungen/maler-tapezierarbeiten/vorher-1.png',
        after: '/images/leistungen/maler-tapezierarbeiten/nachher-1.png',
        altBefore: 'Wand vor den Malerarbeiten',
        altAfter: 'Wand nach den Maler- und Tapezierarbeiten'
      }
    ]
  },
  {
    id: 'trockenbau',
    title: 'Trockenbau',
    items: [
      {
        orientation: 'portrait',
        before: '/images/leistungen/trockenbau/vorher-1.jpg',
        after: '/images/leistungen/trockenbau/nachher-1.jpg',
        altBefore: 'Flur im Rohbauzustand mit freiliegenden Leitungen und Putzschäden vor dem Trockenbau',
        altAfter: 'Renovierter Flur mit glatten weißen Wänden und Decke, Einbaustrahlern und Boden in Holzoptik'
      }
    ]
  },
  {
    id: 'balkon',
    title: 'Balkon',
    items: [
      {
        orientation: 'landscape',
        before: '/images/leistungen/balkon/vorher-1.png',
        after: '/images/leistungen/balkon/nachher-1.jpg',
        altBefore: 'Balkon vor der Sanierung mit altem Fliesenbelag',
        altAfter: 'Balkon nach der Sanierung mit neuem grauen Fliesenbelag und verzinktem Geländer'
      }
    ]
  }
];
