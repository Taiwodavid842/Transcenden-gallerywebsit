const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const asset = (path: string) => `${BASE}${path.replace(/^\//, '')}`;

export const BUSINESS = {
  name: 'Transcendent Gallery',
  address: 'Ayeso, Adelegan Compound, Ilesha, Osun State, Nigeria.',
  logo: asset('images/client/transcendent-logo.webp'),
  phone: '+234 913 704 9262',
  phoneHref: 'tel:+2349137049262',
  whatsappUrl: 'https://wa.me/2349137049262',
  email: 'idowuraphaelkehinde@gmail.com',
  instagramHandle: '@transcendent_gallery',
  instagramUrl: 'https://www.instagram.com/transcendent_gallery/',
  facebookName: 'Transcendent Gallery Photography Studio',
  // Set only after the client supplies the exact official page URL.
  facebookUrl: null as string | null,
  openingHours: [
    { day: 'Monday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Sunday', hours: 'Opens at 1:00 PM' },
  ],
} as const;

export const categories = [
  'Studio Sessions',
  'Wedding Sessions',
  'Maternity Sessions',
  'Kids Shoots',
  'Family Sessions',
  'Others — Burials & Events',
  'Church Programs',
  'Lifestyle Photography',
] as const;

export type Category = (typeof categories)[number];

export type Photo = {
  id: string;
  title: string;
  category: Category | null;
  /** Shown only when category is null (pending client confirmation). */
  label?: string;
  alt: string;
  image: string;
  thumbnail: string;
  srcSet: string;
  width: number;
  height: number;
  thumbWidth: number;
  sourceFile: string;
};

function photo(
  base: string,
  w: number,
  h: number,
  tw: number,
  data: Pick<Photo, 'title' | 'category' | 'alt'> & { label?: string },
): Photo {
  const image = asset(`images/client/${base}-1600.webp`);
  const thumbnail = asset(`images/client/${base}-720.webp`);
  return {
    id: base.split('_')[0] + '-' + base.split('_')[1].toLowerCase(),
    image,
    thumbnail,
    srcSet: `${thumbnail} ${tw}w, ${image} ${w}w`,
    width: w,
    height: h,
    thumbWidth: tw,
    sourceFile: base,
    ...data,
  };
}

export const gallery: Photo[] = [
  photo('0_IMG_3893_1793164153510', 1280, 1600, 576, {
    title: 'Green, worn with grace',
    category: 'Studio Sessions',
    alt: 'Studio portrait of a woman in a green headwrap and a richly patterned dress',
  }),
  photo('8_family-gen_1793164154158', 1600, 902, 720, {
    title: 'Four women, one thread',
    category: 'Family Sessions',
    alt: 'Four women standing together in coordinated headwraps and matching outfits',
  }),
  photo('2_reedit-k5_1793164153604', 1280, 1600, 576, {
    title: 'A birthday in pink',
    category: 'Kids Shoots',
    alt: 'A young girl in a pink dress posing beside her birthday board',
  }),
  photo('6_IMG_3152_1793164153965', 1280, 1600, 576, {
    title: 'Purple gele, sweet day',
    category: 'Studio Sessions',
    alt: 'A woman in a purple gele smiling beside a celebration cake',
  }),
  photo('1_LIFE-STYLE_1793164153558', 1280, 1600, 576, {
    title: 'The lifestyle campaign',
    category: 'Lifestyle Photography',
    alt: 'Lifestyle promotional composition featuring a man holding a phone, with designed text elements',
  }),
  photo('4_IMG_9509_1793164153775', 1600, 1067, 720, {
    title: 'When the crowd rose',
    category: null,
    label: 'Celebration',
    alt: 'A crowd gathered together at a lively celebration',
  }),
  photo('3_IMG_3394_1793164153725', 1280, 1600, 576, {
    title: 'Little one, in blue',
    category: 'Kids Shoots',
    alt: 'A child seated in a blue traditional outfit',
  }),
  photo('7_IMG_3067_1793164154077', 1280, 1600, 576, {
    title: 'Easy in pink',
    category: 'Studio Sessions',
    alt: 'Studio portrait of a man in a pink shirt',
  }),
  photo('5_IMG_3189_1793164153853', 1182, 1600, 532, {
    title: 'Side by side',
    category: null,
    label: 'Couple portrait',
    alt: 'A couple seated together for a portrait',
  }),
  photo('9_IMG_2475_1793164154268', 1280, 1600, 576, {
    title: 'A family in green',
    category: 'Family Sessions',
    alt: 'A family dressed in coordinated green outfits posing together',
  }),
];

export const galleryFilters = ['All work', ...categories] as const;

export const services = [
  { number: '01', title: 'Studio Sessions', text: 'Considered portraits under studio light that feel like you on your very best day.', details: 'Solo portraits · Birthdays · Personal branding' },
  { number: '02', title: 'Wedding Sessions', text: 'The big feeling and the small in-between moments, held together in one story.', details: 'Introductions · Engagements · Wedding days' },
  { number: '03', title: 'Maternity Sessions', text: 'Gentle, proud portraits for the season of waiting and becoming.', details: 'Studio · Outdoor · With partner or family' },
  { number: '04', title: 'Kids Shoots', text: 'Patient, playful sessions that let little personalities lead.', details: 'Birthdays · Milestones · Traditional outfits' },
  { number: '05', title: 'Family Sessions', text: 'Generations together, in coordinated colour or just as you are.', details: 'Family portraits · Generations · Reunions' },
  { number: '06', title: 'Others — Burials & Events', text: 'A respectful, thorough record of the people and moments that matter on the day.', details: 'Burials · Celebrations · Gatherings' },
  { number: '07', title: 'Church Programs', text: 'Services, thanksgivings and programmes documented with quiet care.', details: 'Services · Thanksgivings · Anniversaries' },
  { number: '08', title: 'Lifestyle Photography', text: 'Images for your brand, business or everyday life, styled with intent.', details: 'Promotions · Brand content · Everyday stories' },
];
