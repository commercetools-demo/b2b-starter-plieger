export interface Person {
  firstName: string;
  lastName: string;
  role: "Admin" | "Approver" | "Buyer";
}

export interface BusinessUnit {
  name: string;
  address: string;
  focus?: string;
  people: Person[];
  subUnits?: BusinessUnit[];
}

export interface Company extends BusinessUnit {
  slug: string;
  domain: string;
}

export const companies: Company[] = [
  {
    name: "Vrieseco Klimaatbeheersing & Sanitair",
    slug: "vrieseco",
    domain: "vrieseco.nl",
    address: "Nijverheidsweg 142-B, 3534 GC Utrecht",
    focus: "Warmtepompen en hybride systemen.",
    people: [
      { firstName: "Hendrik", lastName: "de Vries", role: "Admin" },
      { firstName: "Linda", lastName: "van Bemmel", role: "Approver" },
      { firstName: "Marco", lastName: "Bakker", role: "Buyer" },
      { firstName: "Sophie", lastName: "de Jong", role: "Buyer" },
    ],
  },
  {
    name: "Loodgietersbedrijf De Straal & Co.",
    slug: "destraal",
    domain: "destraal.nl",
    address: "Jan van Galenstraat 89, 1056 CC Amsterdam",
    focus: "Spoedreparaties, lekkages en dakwerk.",
    people: [
      { firstName: "Danny", lastName: "van Straalen", role: "Admin" }
    ],
  },
  {
    name: "Voltix Elektro-Installaties",
    slug: "voltix",
    domain: "voltix.nl",
    address: "Industrieterrein De Hurk 12, 5652 AL Eindhoven",
    focus: "Zonnepanelen, laadpalen en slimme meterkasten.",
    people: [
      { firstName: "Pieter-Jan", lastName: "Voltmer", role: "Admin" },
      { firstName: "Annelies", lastName: "de Groot", role: "Approver" },
      { firstName: "Rick", lastName: "van den Heuvel", role: "Buyer" },
      { firstName: "Bas", lastName: "Verstrijden", role: "Buyer" },
    ],
    subUnits: [
      {
        name: "Voltix West-Brabant (Breda)",
        address: "Minervum 7210, 4817 ZG Breda",
        focus: "Grootschalige zonnepark-projecten en logistieke centra langs de A16/A27.",
        people: [
          { firstName: "Jeroen", lastName: "Barendse", role: "Admin" },
          { firstName: "Karin", lastName: "van Dongen", role: "Approver" },
          { firstName: "Stefan", lastName: "Peeters", role: "Buyer" },
          { firstName: "Bram", lastName: "Tilburgs", role: "Buyer" },
        ],
      },
      {
        name: "Voltix Midden-Brabant (Tilburg)",
        address: "Ringbaan-Oost 245, 5014 GB Tilburg",
        focus: "Residentiële verduurzaming (warmtepompen en laadpalen) voor de regio Hart van Brabant.",
        people: [
          { firstName: "Mark", lastName: "Mutsaers", role: "Admin" },
          { firstName: "Chantal", lastName: "Verhoeven", role: "Approver" },
          { firstName: "Kees", lastName: "de Kort", role: "Buyer" },
        ],
      },
      {
        name: "Voltix Noordoost-Brabant ('s-Hertogenbosch)",
        address: "Rietveldenweg 62, 5222 AR 's-Hertogenbosch",
        focus: "Onderhoudscontracten voor de publieke sector en utiliteitsbouw in de Brabantse Delta.",
        people: [
          { firstName: "Robert-Jan", lastName: "van Oss", role: "Admin" },
          { firstName: "Wendy", lastName: "Maaskant", role: "Approver" },
          { firstName: "Luc", lastName: "Willems", role: "Buyer" },
        ],
      },
    ],
  },
];
