// js/config.js
// Daten aus credentials.md - Keine Secrets hier!

export const config = {
  company: {
    name: "RP-Bau",
    legalName: "RP-Bau",
    owner: "Robert Palumbo",
    form: "Einzelunternehmen",
    profession: "Inhaber von RP-Bau",
    slogan: "Handwerker des Vertrauens. Seit 20 Jahren.",
    yearsExperience: 20
  },
  address: {
    street: "Blenkenweg 30",
    zip: "69234",
    city: "Dielheim",
    area: "100 km um Dielheim"
  },
  contact: {
    phone: "017676897808",
    phoneDisplay: "0176 / 76897808",
    email: "anfrage@rp-bau.info",
    whatsapp: "4917676897808",
    whatsappText: "Guten Tag, ich möchte ein Projekt anfragen.",
    hours: "08:00 - 18:00"
  },
  legal: {
    taxNumber: "44197/22488",
    chamber: "[PLATZHALTER]",
    tradeRegister: "[PLATZHALTER]",
    liability: "[PLATZHALTER]",
    responsibleMstv: "Robert Palumbo"
  },
  domain: "rp-bau.info",
  resend: {
    from: "anfrage@rp-bau.info",
    to: "anfrage@rp-bau.info"
  },
  social: {
    google: "tbd",
    instagram: "tbd",
    facebook: "tbd"
  },
  media: {
    logo: "/images/logo/logo.png",
    ownerPhoto: "/images/ueber-uns/robert-palumbo.jpg"
  }
};

export function getWhatsAppUrl() {
  const text = encodeURIComponent(config.contact.whatsappText);
  return `https://wa.me/${config.contact.whatsapp}?text=${text}`;
}

export function getTelUrl() {
  return `tel:${config.contact.phone}`;
}

export function getMailUrl() {
  return `mailto:${config.contact.email}`;
}
