import { Plant, SunZone } from './types'

export const plants: Plant[] = [
  // Full sun
  { name: 'Tomatoes',      emoji: '🍅', sunRequirement: 'full_sun',  zones: [3,4,5,6,7,8,9,10,11], notes: 'Need 6–8 hours of direct sun. Plant after last frost.' },
  { name: 'Bell Peppers',  emoji: '🫑', sunRequirement: 'full_sun',  zones: [4,5,6,7,8,9,10,11],   notes: 'Love heat. Start indoors 8 weeks before last frost.' },
  { name: 'Zucchini',      emoji: '🥬', sunRequirement: 'full_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Prolific producer. Needs room to sprawl.' },
  { name: 'Cucumbers',     emoji: '🥒', sunRequirement: 'full_sun',  zones: [4,5,6,7,8,9,10,11],   notes: 'Trellis to save space and improve airflow.' },
  { name: 'Basil',         emoji: '🌿', sunRequirement: 'full_sun',  zones: [4,5,6,7,8,9,10],      notes: 'Pairs perfectly with tomatoes. Pinch flowers to extend harvest.' },
  { name: 'Rosemary',      emoji: '🌿', sunRequirement: 'full_sun',  zones: [6,7,8,9,10],           notes: 'Drought-tolerant once established. Well-draining soil.' },
  { name: 'Lavender',      emoji: '💜', sunRequirement: 'full_sun',  zones: [5,6,7,8,9],            notes: 'Deer-resistant. Sandy, alkaline soil preferred.' },
  { name: 'Sunflowers',    emoji: '🌻', sunRequirement: 'full_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Attract pollinators. Great as a backdrop.' },
  { name: 'Eggplant',      emoji: '🍆', sunRequirement: 'full_sun',  zones: [5,6,7,8,9,10,11],     notes: 'Needs warm soil. Start indoors 8 weeks early.' },
  { name: 'Strawberries',  emoji: '🍓', sunRequirement: 'full_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Excellent in raised beds or hanging baskets.' },

  // Part sun
  { name: 'Lettuce',       emoji: '🥬', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9,10,11], notes: 'Actually prefers part shade in summer to prevent bolting.' },
  { name: 'Spinach',       emoji: '🥬', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9],       notes: 'Cool-season crop. Sow in early spring or fall.' },
  { name: 'Peas',          emoji: '🫛', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9],       notes: 'Plant as soon as ground thaws. Needs a trellis.' },
  { name: 'Kale',          emoji: '🥬', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9],       notes: 'Sweetens after frost. Extremely cold-hardy.' },
  { name: 'Swiss Chard',   emoji: '🌱', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Harvest outer leaves continuously all season.' },
  { name: 'Cilantro',      emoji: '🌿', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Bolts quickly in heat. Stagger plantings every 2 weeks.' },
  { name: 'Parsley',       emoji: '🌿', sunRequirement: 'part_sun',  zones: [4,5,6,7,8,9],          notes: 'Biennial. Slow to germinate — start early.' },
  { name: 'Chives',        emoji: '🌱', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Perennial. Beautiful edible purple flowers.' },
  { name: 'Bush Beans',    emoji: '🫘', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Direct sow after last frost. No trellis needed.' },
  { name: 'Beets',         emoji: '🌱', sunRequirement: 'part_sun',  zones: [3,4,5,6,7,8,9,10],    notes: 'Both greens and roots are edible.' },

  // Shade
  { name: 'Mint',          emoji: '🌿', sunRequirement: 'shade',     zones: [3,4,5,6,7,8,9,10],    notes: 'Aggressive spreader — grow in containers.' },
  { name: 'Hostas',        emoji: '🌿', sunRequirement: 'shade',     zones: [3,4,5,6,7,8,9],       notes: 'Stunning ornamental foliage. Deer magnet.' },
  { name: 'Ferns',         emoji: '🌿', sunRequirement: 'shade',     zones: [3,4,5,6,7,8,9],       notes: 'Loves moist, humus-rich soil.' },
  { name: 'Impatiens',     emoji: '🌸', sunRequirement: 'shade',     zones: [3,4,5,6,7,8,9,10,11], notes: 'Colorful annual with nonstop blooms all summer.' },
  { name: 'Astilbe',       emoji: '🌺', sunRequirement: 'shade',     zones: [3,4,5,6,7,8],          notes: 'Feathery plumes in pink, red, or white. Attracts butterflies.' },
  { name: 'Bleeding Heart',emoji: '💗', sunRequirement: 'shade',     zones: [3,4,5,6,7,8,9],       notes: 'Spring bloomer, goes dormant in summer.' },
  { name: 'Wild Ginger',   emoji: '🌿', sunRequirement: 'shade',     zones: [3,4,5,6,7,8,9],       notes: 'Native groundcover with aromatic roots.' },
  { name: 'Foxglove',      emoji: '🌸', sunRequirement: 'shade',     zones: [4,5,6,7,8,9],          notes: 'Dramatic tall spikes. Biennial, self-seeds readily.' },
]

export function getRecommendedPlants(sunZone: SunZone, numericZone: number): Plant[] {
  return plants.filter(p =>
    p.sunRequirement === sunZone && p.zones.includes(numericZone)
  )
}
