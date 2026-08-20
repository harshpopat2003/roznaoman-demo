/**
 * Every word on the site, and the plan it is arranged on.
 *
 * The site is not a landing page with sections; it is a building with
 * rooms, walked from the gate to the door out. So the content is
 * organised the way the building is — each room holds only what is
 * actually in that room.
 *
 * Verified against roznaoman.com and the restaurant's public listings:
 * the four signature dishes and their descriptions word for word, the
 * 8:00 AM – 11:30 PM hours, the WhatsApp number and Instagram handle,
 * the three-part structure (restaurant / Al Sabla / culinary institute)
 * and the guest reviews under the reviewers' own names.
 *
 * Everything else is demo copy written for this pitch and needs sign-off
 * before launch — in particular the 4.6 rating and the guest count.
 */

import { asset } from "@/lib/asset";

export const brand = {
  name: "Rozna",
  arabic: "روزنة",
  email: "info@roznaoman.com",
  whatsapp: "96897108474",
  whatsappDisplay: "+968 9710 8474",
  instagram: "roznaoman",
  hours: "8:00 AM — 11:30 PM, daily",
  where: "Al Khuwair, near the Ministry of Education, Muscat",
};

/**
 * The plan, in walking order. Drives the header's floor plan, the panel
 * order, and — via `tone` — which way round the header draws itself, so
 * the survey stays legible when the walk arrives in the one pale room.
 */
export const plan = [
  { id: "gate", n: "00", name: "The Gate", tone: "dark" },
  { id: "courtyard", n: "01", name: "The Courtyard", tone: "dark" },
  { id: "table", n: "02", name: "The Table", tone: "dark" },
  { id: "arcade", n: "03", name: "The Arcade", tone: "dark" },
  { id: "sabla", n: "04", name: "Al Sabla", tone: "dark" },
  { id: "kitchen", n: "05", name: "The Kitchen", tone: "dark" },
  { id: "school", n: "06", name: "The School", tone: "light" },
  { id: "exit", n: "07", name: "The Door Out", tone: "dark" },
] as const;

export type RoomId = (typeof plan)[number]["id"];

/**
 * The doorways. One sits between each pair of rooms, and you walk
 * through the arch cut into it — so the threshold is both the site's
 * transition and its one repeated shape.
 *
 * There is deliberately none between the gate and the courtyard: the
 * gate's own carved leaves are that doorway, and putting a second one
 * immediately behind them meant walking through two doors in a row to
 * enter one building.
 */
export const thresholds: { after: RoomId; line: string; through: string }[] = [
  { after: "courtyard", line: "Your table is laid", through: asset("/assets/table-set.jpg") },
  { after: "table", line: "Down the arcade", through: asset("/assets/hall-gold.jpg") },
  { after: "arcade", line: "The hall is through here", through: asset("/assets/event-hall.jpg") },
  { after: "sabla", line: "Mind the fire", through: asset("/assets/institute-chef.jpg") },
  { after: "kitchen", line: "Upstairs, if you want to learn", through: asset("/assets/institute-class.jpg") },
  { after: "school", line: "Come back hungry", through: asset("/assets/exterior-night.jpg") },
];

export const gate = {
  arabicWelcome: "أهلاً وسهلاً",
  title: "Rozna",
  standfirst: "A fort in Muscat that happens to serve lunch.",
  body: "Carved teak, rammed earth, and a courtyard open to the sky — with the Omani dishes your grandmother would recognise coming out of it.",
  hint: "Scroll to walk in",
};

export const courtyard = {
  plaque: "Ground floor · open to the sky",
  title: "Two floors of arcade, and no roof over the middle of it.",
  quote:
    "“The management of Rozna is honored to welcome you and is pleased to offer you a distinguished menu of selected Omani cuisine dishes prepared by our skilled chefs.”",
  attribution: "The management",
  notes: [
    { k: "Open", v: "8:00 AM — 11:30 PM, every day" },
    { k: "Seating", v: "Courtyard tables · private rooms upstairs · garden buffet" },
    { k: "Booking", v: "Strongly recommended. Rozna is usually full." },
  ],
};

/** Room 02. Laid out on a table you look down onto. */
export const dishes = [
  {
    name: "Meat Qabuli",
    arabic: "قبولي لحم",
    img: asset("/assets/dish-qabuli.jpg"),
    body: "Qabooli mutton, seasoned with selected spices, cooked to perfection and served with Qabooli rice.",
    tag: "Mutton",
  },
  {
    name: "Ursiya Chicken",
    arabic: "عرسية دجاج",
    img: asset("/assets/dish-ursiya.jpg"),
    body: "Rice and slow-cooked chicken blended together into a smooth, creamy texture, served with rich local ghee.",
    tag: "Chicken",
  },
  {
    name: "Chicken Mandi",
    arabic: "مندي دجاج",
    img: asset("/assets/dish-mandi.jpg"),
    body: "Fresh chicken marinated in special mandi spices, cooked over charcoal or in the tandoor, served with aromatic mandi rice.",
    tag: "Charcoal",
  },
  {
    name: "Mixed Grill",
    arabic: "مشاوي مشكلة",
    img: asset("/assets/dish-grill.jpg"),
    body: "Lamb, chicken and kofta off the coals on one board, with grilled onion, lemon and two house sauces.",
    tag: "Sharing",
  },
  {
    name: "Harees",
    arabic: "هريس",
    img: asset("/assets/dish-harees.jpg"),
    body: "Wheat and meat beaten together for hours until it gives up and turns to cream. Finished with ghee and cinnamon.",
    tag: "Slow",
  },
  {
    name: "Prawn Qabuli",
    arabic: "قبولي روبيان",
    img: asset("/assets/dish-seafood.jpg"),
    body: "Gulf prawns folded through spiced qabuli rice, finished with lime and coriander from the market that morning.",
    tag: "Coastal",
  },
  {
    name: "Mudarbal",
    arabic: "مدربل",
    img: asset("/assets/dish-mudarbal.jpg"),
    body: "Chickpeas cooked down with cumin and dried lime until the pot goes quiet. The dish people order without reading the menu.",
    tag: "Vegetarian",
  },
  {
    name: "Luqaimat",
    arabic: "لقيمات",
    img: asset("/assets/dish-luqaimat.jpg"),
    body: "Fried until they crack, then drowned in date syrup and sesame. Ordered for the table, eaten by one person.",
    tag: "Sweet",
  },
];

export const table = {
  plaque: "the food",
  title: "Nothing here is plated for one.",
  body: "Omani food arrives in the pot it cooked in, set down in the middle, and the table reaches in together. Pick something up.",
  note: "Please tell your waiter about any food allergies.",
};

/** Room 03. Hung along the arcade wall like framed notices. */
export const voices = [
  {
    quote:
      "You just wow as you enter the place. It's like stepping into old Arab stories. Perfect atmosphere, perfect setup.",
    name: "Mohsen Soltani",
    source: "Tripadvisor",
    depth: 0.06,
  },
  {
    quote:
      "Good Omani food, the atmosphere is amazing, the building itself is so authentic, and the food too. It has an amazing vibe.",
    name: "Esther Ekart",
    source: "Google",
    depth: -0.04,
  },
  {
    quote:
      "I wasn't expecting much as it looked like a tourist trip. We had a large table of folk who all had such a wonderful meal, which felt authentic.",
    name: "Duncan Knight",
    source: "Tripadvisor",
    depth: 0.03,
  },
  {
    quote:
      "The ambiance is beautiful and gives a very authentic Omani vibe, especially with the traditional seating and décor.",
    name: "John Conrad Arquillo",
    source: "Google",
    depth: -0.07,
  },
];

export const arcade = {
  plaque: "what people say on the way out",
  title: "You don't have to take our word for it.",
  rating: "4.6",
  ratingNote: "averaged across Google and Tripadvisor from 2,900+ guests",
};

export const sabla = {
  plaque: "events & weddings",
  title: "Al Sabla",
  lead: "Six hundred seated under one ceiling.",
  body: "The great hall, with the kitchen and the service that feeds the restaurant behind it — so a wedding eats the same food as a Tuesday lunch, at the same standard.",
  specs: [
    { k: "Capacity", v: "600 seated" },
    { k: "Used for", v: "Weddings · corporate · national day" },
    { k: "Catering", v: "The restaurant kitchen, not an outside contract" },
  ],
  images: [asset("/assets/event-hall.jpg"), asset("/assets/event-banquet.jpg"), asset("/assets/event-majlis.jpg")],
};

/** Room 05. Three alcoves, three fires. */
export const methods = [
  {
    n: "i",
    title: "Buried",
    body: "Shuwa goes into the ground wrapped and spiced, and comes back out the best part of a day later, falling apart.",
    img: asset("/assets/dish-maqdeed.jpg"),
  },
  {
    n: "ii",
    title: "Charcoal",
    body: "Mandi is finished over coals or in the tandoor. It is the smoke that makes it mandi; everything else is rice.",
    img: asset("/assets/dish-mandi.jpg"),
  },
  {
    n: "iii",
    title: "On the saj",
    body: "Bread is pulled off the hot plate in front of you, all day, because bread that waited is a different thing entirely.",
    img: asset("/assets/institute-chef.jpg"),
  },
];

export const kitchen = {
  plaque: "how it is cooked",
  title: "Three fires we have not modernised.",
  body: "Not for the photographs. These methods survived because the food is better out of them, and because a shortcut in an Omani kitchen is audible at the table.",
};

export const school = {
  plaque: "Rozna Institute of Culinary Arts",
  title: "A cuisine that is only ever served eventually stops being made.",
  body: "So the last room is a classroom. Short courses in Omani cooking for residents and visitors, taught by the chefs who cook it downstairs — the recipes handed on rather than kept.",
  images: [asset("/assets/institute-class.jpg"), asset("/assets/institute-team.jpg"), asset("/assets/institute-pots.jpg")],
  courses: [
    { k: "Who", v: "Residents, visitors, and children from 10" },
    { k: "What", v: "Qabuli, harees, Omani breads, and pottery alongside" },
    { k: "Where", v: "Upstairs at Rozna, in the teaching kitchen" },
  ],
};

export const exitRoom = {
  plaque: "the way out",
  title: "Book before you come.",
  body: "Walk-ins are welcome and often seated at the garden buffet, but the courtyard tables and the private rooms go early. A message on WhatsApp is the fastest way in.",
  details: [
    { k: "Hours", v: brand.hours },
    { k: "Where", v: brand.where },
    { k: "WhatsApp", v: brand.whatsappDisplay },
    { k: "Instagram", v: `@${brand.instagram}` },
  ],
};
