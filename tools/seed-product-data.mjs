import { apiRoot } from "./ct-admin.mjs";

const productTypeDraft = {
  name: "Simple Product",
  description: "A simple product",
  key: "simple",
  attributes: [
    {
      name: "size",
      label: {
        "en": "Size",
        "de-DE": "Größe",
        "en-GB": "Size",
        "it-IT": "Misurare",
        "nl-NL": "Grootte",
        "fr-FR": "Taille",
        "pt-PT": "Tamanho",
        "es-ES": "Tamaño"
      },
      isRequired: false,
      type: {
        name: "text"
      },
      attributeConstraint: "None",
      isSearchable: true,
      inputHint: "SingleLine",
      displayGroup: "Other"
    },
    {
      name: "fp_color",
      label: {
        "en": "Color",
        "de-DE": "Farbe",
        "en-GB": "Color",
        "it-IT": "Colore",
        "nl-NL": "Kleur",
        "fr-FR": "Couleur",
        "pt-PT": "Cor",
        "es-ES": "Color"
      },
      inputTip: {
        "en": "Enter Color",
        "de-DE": "Farbe eingeben",
        "en-GB": "Enter Color",
        "it-IT": "Immettere il colore",
        "nl-NL": "Voer kleur in",
        "fr-FR": "Entrer la couleur",
        "pt-PT": "Digite a cor",
        "es-ES": "Entrar en color"
      },
      isRequired: false,
      type: {
        name: "lenum",
        values: [
          {
            key: "black",
            label: {
              "en": "Black",
              "de-DE": "Schwarz",
              "en-GB": "Black",
              "it-IT": "Nero",
              "nl-NL": "Zwart",
              "fr-FR": "Noir",
              "pt-PT": "Preto",
              "es-ES": "Negro"
            }
          },
          {
            key: "grey",
            label: {
              "en": "Grey",
              "de-DE": "Grau",
              "en-GB": "Grey",
              "it-IT": "Grigio",
              "nl-NL": "Grijs",
              "fr-FR": "Gris",
              "pt-PT": "Cinza",
              "es-ES": "Gris"
            }
          },
          {
            key: "beige",
            label: {
              "en": "Beige",
              "de-DE": "Beige",
              "en-GB": "Beige",
              "it-IT": "Beige",
              "nl-NL": "Beige",
              "fr-FR": "Beige",
              "pt-PT": "Bege",
              "es-ES": "Beige"
            }
          },
          {
            key: "white",
            label: {
              "en": "White",
              "de-DE": "Weiß",
              "en-GB": "White",
              "it-IT": "Bianco",
              "nl-NL": "Wit",
              "fr-FR": "Blanc",
              "pt-PT": "Branco",
              "es-ES": "Blanco"
            }
          },
          {
            key: "blue",
            label: {
              "en": "Blue",
              "de-DE": "Blau",
              "en-GB": "Blue",
              "it-IT": "Blu",
              "nl-NL": "Blauw",
              "fr-FR": "Bleu",
              "pt-PT": "Azul",
              "es-ES": "Azul"
            }
          },
          {
            key: "brown",
            label: {
              "en": "Brown",
              "de-DE": "Braun",
              "en-GB": "Brown",
              "it-IT": "Marrone",
              "nl-NL": "Bruin",
              "fr-FR": "Brun",
              "pt-PT": "Marrom",
              "es-ES": "Marrón"
            }
          },
          {
            key: "turquoise",
            label: {
              "en": "Turquoise",
              "de-DE": "Türkis",
              "en-GB": "Turquoise",
              "it-IT": "Turchese",
              "nl-NL": "Turkoois",
              "fr-FR": "Turquoise",
              "pt-PT": "Turquesa",
              "es-ES": "Turquesa"
            }
          },
          {
            key: "lightslategrey",
            label: {
              "en": "Petrol",
              "de-DE": "Benzin",
              "en-GB": "Petrol",
              "it-IT": "Benzina",
              "nl-NL": "Benzine",
              "fr-FR": "Essence",
              "pt-PT": "Gasolina",
              "es-ES": "Gasolina"
            }
          },
          {
            key: "green",
            label: {
              "en": "Green",
              "de-DE": "Grün",
              "en-GB": "Green",
              "it-IT": "Verde",
              "nl-NL": "Groente",
              "fr-FR": "Vert",
              "pt-PT": "Verde",
              "es-ES": "Verde"
            }
          },
          {
            key: "red",
            label: {
              "en": "Red",
              "de-DE": "Rot",
              "en-GB": "Red",
              "it-IT" : "Rosso",
              "nl-NL": "Rood",
              "fr-FR": "Rouge",
              "pt-PT": "Vermelho",
              "es-ES": "Rojo"
            }
          },
          {
            key: "purple",
            label: {
              "en": "Purple",
              "de-DE": "Violett",
              "en-GB": "Purple",
              "it-IT": "Porpora",
              "nl-NL": "Paars",
              "fr-FR": "Mauve",
              "pt-PT": "Roxo",
              "es-ES": "Púrpura"
            }
          },
          {
            key: "pink",
            label: {
              "en": "Pink",
              "de-DE": "Rosa",
              "en-GB": "Pink",
              "it-IT": "Rosa",
              "nl-NL": "Roze",
              "fr-FR": "Rose",
              "pt-PT": "Rosa",
              "es-ES": "Rosa"
            }
          },
          {
            key: "orange",
            label: {
              "en": "Orange",
              "de-DE": "Orange",
              "en-GB": "Orange",
              "it-IT": "Arancia",
              "nl-NL": "Oranje",
              "fr-FR": "Orange",
              "pt-PT": "Laranja",
              "es-ES": "Naranja"
            }
          },
          {
            key: "yellow",
            label: {
              "en": "Yellow",
              "de-DE": "Gelb",
              "en-GB": "Yellow",
              "it-IT": "Giallo",
              "nl-NL": "Geel",
              "fr-FR": "Jaune",
              "pt-PT": "Amarelo",
              "es-ES": "Amarillo"
            }
          },
          {
            key: "olive",
            label: {
              "en": "Olive",
              "de-DE": "Olive",
              "en-GB": "Olive",
              "it-IT": "Oliva",
              "nl-NL": "Olijf",
              "fr-FR": "olive",
              "pt-PT": "Oliva",
              "es-ES": "Aceituna"
            }
          },
          {
            key: "gold",
            label: {
              "en": "Gold",
              "de-DE": "Gold",
              "en-GB": "Gold",
              "it-IT": "Oro",
              "nl-NL": "Goud",
              "fr-FR": "Or",
              "pt-PT": "Ouro",
              "es-ES": "Oro"
            }
          },
          {
            key: "silver",
            label: {
              "en": "Silver",
              "de-DE": "Silber",
              "en-GB": "Silver",
              "it-IT": "Argento",
              "nl-NL": "Zilver",
              "fr-FR": "Argent",
              "pt-PT": "Prata",
              "es-ES": "Plata"
            }
          },
          {
            key: "multicolored",
            label: {
              "en": "Multicolored",
              "de-DE": "Mehrfarbig",
              "en-GB": "Multicolored",
              "it-IT": "Multicolore",
              "nl-NL": "Veelkleurig",
              "fr-FR": "Multicolore",
              "pt-PT": "Multicolorido",
              "es-ES": "Multicolor"
            }
          }
        ]
      },
      attributeConstraint: "None",
      isSearchable: true,
      inputHint: "SingleLine",
      displayGroup: "Other"
    },
  ]
}


const productDraft = 
  {
    productType: {
      typeId: "product-type",
      key: "simple"
    },
    name: {
      "en": "Duck",
      "en-GB": "Duck",
      "nl-NL": "Eend",
      "de-DE": "Ente",
      "fr-FR": "Canard",
      "it-IT": "Anatra",
      "es-ES": "Pato",
      "pt-PT": "Pato"
    },
    description: {
      "en": "This cheerful mallard glides effortlessly across the pond's glassy surface before beginning its rhythmic bathing ritual. With a sudden burst of energy, it vigorously flaps its wings, sending a spray of sparkling droplets into the air. Diving beneath the ripples, it emerges refreshed, meticulously preening its waterproof feathers into place.",
      "en-GB": "This cheerful mallard glides effortlessly across the pond's glassy surface before beginning its rhythmic bathing ritual. With a sudden burst of energy, it vigorously flaps its wings, sending a spray of sparkling droplets into the air. Diving beneath the ripples, it emerges refreshed, meticulously preening its waterproof feathers into place.",
      "nl-NL": "Deze vrolijke woerd glijdt moeiteloos over het spiegelgladde water van de vijver voordat hij aan zijn badritueel begint. Met een plotselinge energie klappert hij krachtig met zijn vleugels, waardoor fonkelende druppels in het rond vliegen. Na een korte duik komt hij verfrist boven en poetst hij zorgvuldig zijn waterdichte veren.",
      "de-DE": "Diese fröhliche Stockente gleitet mühelos über die spiegelglatte Oberfläche des Teiches, bevor sie mit ihrem Baderitual beginnt. Mit einem plötzlichen Energieschub schlägt sie kräftig mit den Flügeln und wirbelt glitzernde Wassertropfen auf. Nach dem Untertauchen taucht sie erfrischt wieder auf und putzt akribisch ihr wasserdichtes Gefieder, bis alles perfekt sitzt.",
      "fr-FR": "Ce colvert joyeux glisse sans effort sur la surface miroitante de l'étang avant de commencer son rituel de bain. Dans un élan d'énergie, il bat vigoureusement des ailes, projetant des gouttelettes étincelantes dans l'air. Après avoir plongé, il émerge rafraîchi et lisse méticuleusement ses plumes imperméables avec son bec.",
      "it-IT": "Questo allegro germano reale scivola senza fatica sulla superficie specchiata dello stagno prima di iniziare il suo rituale del bagno. Con un improvviso sussulto di energia, sbatte vigorosamente le ali, lanciando goccioline scintillanti nell'aria. Dopo essersi immersa, emerge rinfrescata e pulisce meticolosamente le sue piume impermeabili con grande cura.",
      "es-ES": "Este alegre ánade se desliza sin esfuerzo sobre la superficie cristalina del estanque antes de comenzar su ritual de baño. Con un repentino estallido de energía, sacude vigorosamente sus alas, lanzando gotas brillantes al aire. Tras zambullirse, emerge refrescado y limpia meticulosamente sus plumas impermeables para mantenerlas en perfecto estado.",
      "pt-PT": "Este alegre pato-real desliza sem esforço pela superfície espelhada do lago antes de iniciar o seu ritual de banho. Com uma explosão repentina de energia, bate vigorosamente as asas, lançando gotas cintilantes pelo ar. Após mergulhar, emerge revigorado e limpa meticulosamente as suas penas impermeáveis com o seu bico."
    },
    slug: {
      "en": "duck",
      "en-GB": "duck",
      "nl-NL": "eend",
      "de-DE": "ente",
      "fr-FR": "canard",
      "it-IT": "anatra",
      "es-ES": "pato",
      "pt-PT": "pato"
    },
    metaTitle: {
      "en": "Duck",
      "en-GB": "Duck",
      "nl-NL": "Eend",
      "de-DE": "Ente",
      "fr-FR": "Canard",
      "it-IT": "Anatra",
      "es-ES": "Pato",
      "pt-PT": "Pato"
    },
    metaDescription: {
      "en": "Duck",
      "en-GB": "Duck",
      "nl-NL": "Eend",
      "de-DE": "Ente",
      "fr-FR": "Canard",
      "it-IT": "Anatra",
      "es-ES": "Pato",
      "pt-PT": "Pato"
    },
    masterVariant: {
      sku: "duck-yellow",
      key: "duck-yellow",
      prices: [
        {
          value: {
            type: "centPrecision",
            currencyCode: "EUR",
            centAmount: 1000,
            fractionDigits: 2
          },
          key: "eur-all"
        },
        {
          value: {
            type: "centPrecision",
            currencyCode: "GBP",
            centAmount: 1000,
            fractionDigits: 2
          },
          key: "gbp-all"
        }
      ],
      images: [
        {
          url: "https://demo-images.deno.dev/duck-yellow.jpeg",
          dimensions: {
            w: 1424,
            h: 1424
          },
          label: "A yellow duck"
        },
        {
          url: "https://demo-images.deno.dev/duck-yellow-front.jpeg",
          dimensions: {
            w: 233,
            h: 233
          },
          label: "A yellow duck coming right at you"
        },
        {
          url: "https://demo-images.deno.dev/duck-yellow-right-side.jpeg",
          dimensions: {
            w: 233,
            h: 233
          },
          label: "A yellow duck swiming away to the right of the screen"
        },
        {
          url: "https://demo-images.deno.dev/duck-yellow-left-side.jpeg",
          dimensions: {
            w: 233,
            h: 233
          },
          label: "A yellow duck swiming away to the left of the screen"
        }
      ],
      attributes: [
        {
          name: "fp_color",
          value: "yellow"
        }
      ]
    },
    variants: [
      {
        sku: "duck-blue",
        key: "duck-blue",
        prices: [
          {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "eur-all"
          },
          {
            value: {
              type: "centPrecision",
              currencyCode: "GBP",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "gbp-all"
          }
        ],
        images: [
          {
            url: "https://demo-images.deno.dev/duck-blue.jpeg",
            dimensions: {
              w: 600,
              h: 600
            },
            label: "A blue duck"
          }
        ],
        attributes: [
          {
            name: "fp_color",
            value: "blue"
          }
        ]
      },
      {
        sku: "duck-red",
        key: "duck-red",
        prices: [
          {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "eur-all"
          },
          {
            value: {
              type: "centPrecision",
              currencyCode: "GBP",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "gbp-all"
          }
        ],
        images: [
          {
            url: "https://demo-images.deno.dev/duck-red.jpeg",
            dimensions: {
              w: 600,
              h: 600
            },
            label: "A red duck"
          }
        ],
        attributes: [
          {
            name: "fp_color",
            value: "red"
          }
        ]
      },
      {
        sku: "duck-green",
        key: "duck-green",
        prices: [
          {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "eur-all"
          },
          {
            value: {
              type: "centPrecision",
              currencyCode: "GBP",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "gbp-all"
          }
        ],
        images: [
          {
            url: "https://demo-images.deno.dev/duck-green.jpeg",
            dimensions: {
              w: 600,
              h: 600
            },
            label: "A green duck"
          }
        ],
        attributes: [
          {
            name: "fp_color",
            value: "green"
          }
        ]
      },
      {
        sku: "duck-pink",
        key: "duck-pink",
        prices: [
          {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "eur-all"
          },
          {
            value: {
              type: "centPrecision",
              currencyCode: "GBP",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "gbp-all"
          }
        ],
        images: [
          {
            url: "https://demo-images.deno.dev/duck-pink.jpeg",
            dimensions: {
              w: 600,
              h: 600
            },
            label: "A pink duck"
          }
        ],
        attributes: [
          {
            name: "fp_color",
            value: "pink"
          }
        ]
      },
      {
        sku: "duck-orange",
        key: "duck-orange",
        prices: [
          {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "eur-all"
          },
          {
            value: {
              type: "centPrecision",
              currencyCode: "GBP",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "gbp-all"
          }
        ],
        images: [
          {
            url: "https://demo-images.deno.dev/duck-orange.jpeg",
            dimensions: {
              w: 600,
              h: 600
            },
            label: "An orange duck, must be a winner"
          }
        ],
        attributes: [
          {
            name: "fp_color",
            value: "orange"
          }
        ]
      },
      {
        sku: "duck-purple",
        key: "duck-purple",
        prices: [
          {
            value: {
              type: "centPrecision",
              currencyCode: "EUR",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "eur-all"
          },
          {
            value: {
              type: "centPrecision",
              currencyCode: "GBP",
              centAmount: 1000,
              fractionDigits: 2
            },
            key: "gbp-all"
          }
        ],
        images: [
          {
            url: "https://demo-images.deno.dev/duck-purple.jpeg",
            dimensions: {
              w: 600,
              h: 600
            },
            label: "A purple duck"
          }
        ],
        attributes: [
          {
            name: "fp_color",
            value: "purple"
          }
        ]
      }
    ],
    key: "duck",
    taxCategory: {
      typeId: "tax-category",
      key: "standard"
    }
  }



// ── Inline setup functions (avoid top-level side effects from imports) ──

async function ensureProductType(draft) {
  try {
    const existing = await apiRoot
      .productTypes()
      .withKey({ key: draft.key })
      .get()
      .execute();
    console.log(`  Product type "${draft.name}" already exists (key: ${draft.key})`);
    return existing.body;
  } catch (err) {
    if (err.statusCode === 404) {
      const result = await apiRoot
        .productTypes()
        .post({
          body: draft,
        })
        .execute();
      console.log(`  Created product type "${draft.name}" (key: ${draft.key})`);
      return result.body;
    }
    throw err;
  }
}


async function ensureProduct(draft) {
  try {
    const existing = await apiRoot.products().withKey({ key: draft.key }).get().execute();
    console.log(`  Product "${draft.name}" already exists (key: ${draft.key})`);
    return existing.body;
  } catch (err) {
    if (err.statusCode === 404) {
      const result = await apiRoot
        .products()
        .post({
          body: draft,
        })
        .execute();
      console.log(`  Created product "${draft.name}" (key: ${draft.key})`);
      return result.body;
    }
    throw err;
  }
}



// ── Main seed script ──

async function run() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   B2B Starter - Product Data Seeder      ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Step 1: product types
  console.log("Step 1: Setting up product types...");
  try {
    await ensureProductType(productTypeDraft);
  }
  catch (_err) {
    console.log(JSON.stringify(_err, null, 2));
    throw _err;
  }
    


  // Step 2: Products
  console.log("\nStep 2: Setting product...");
  await ensureProduct(productDraft);
  

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   Seed complete!                         ║");
  console.log("╚══════════════════════════════════════════╝\n");
}

run().catch((err) => {
  console.error("Seed failed:", JSON.stringify(err.message || err, null, 2));
  process.exit(1);
});
