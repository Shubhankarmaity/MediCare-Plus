/**
 * Centralized hospital image mapping.
 * Maps hospital names to locally generated images so every hospital
 * has a guaranteed-working image regardless of DB state.
 */

import medicaBarrackpore from '../assets/images/hospitals/medica-barrackpore.jpg';
import rubyHowrah from '../assets/images/hospitals/ruby-howrah.jpg';
import lifelineBarrackpore from '../assets/images/hospitals/lifeline-barrackpore.jpg';
import sunriseAsansol from '../assets/images/hospitals/sunrise-asansol.jpg';
import lifelineBarasat from '../assets/images/hospitals/lifeline-barasat.jpg';
import medicaBarasatNiva from '../assets/images/hospitals/medica-barasat-niva.jpg';
import sunriseKalyani from '../assets/images/hospitals/sunrise-kalyani.jpg';
import lifelineKolkata from '../assets/images/hospitals/lifeline-kolkata.jpg';
import sunriseHowrah from '../assets/images/hospitals/sunrise-howrah.jpg';
import medicaBarasatOph from '../assets/images/hospitals/medica-barasat-oph.jpg';
import cityCareKolkata from '../assets/images/hospitals/city-care-kolkata.jpg';
import apolloHowrah from '../assets/images/hospitals/apollo-howrah.jpg';
import durgapurMedical from '../assets/images/hospitals/durgapur-medical.jpg';
import siliguri from '../assets/images/hospitals/siliguri-general.jpg';

// Fallback pool for any unrecognized hospitals
import fallback1 from '../assets/images/city hospital.avif';
import fallback2 from '../assets/images/hospital2.avif';
import fallback3 from '../assets/images/hospital3.avif';
import fallback4 from '../assets/images/hospital4.avif';

const fallbackPool = [fallback1, fallback2, fallback3, fallback4];

/**
 * Name-keyword → image mapping.
 * Order matters: more specific matches first.
 */
const IMAGE_MAP = [
  { keywords: ['medica', 'barrackpore'],               image: medicaBarrackpore },
  { keywords: ['ruby'],                                image: rubyHowrah },
  { keywords: ['lifeline', 'barrackpore'],              image: lifelineBarrackpore },
  { keywords: ['sunrise', 'asansol'],                   image: sunriseAsansol },
  { keywords: ['lifeline', 'barasat'],                  image: lifelineBarasat },
  { keywords: ['sunrise', 'kalyani'],                   image: sunriseKalyani },
  { keywords: ['lifeline', 'kolkata'],                  image: lifelineKolkata },
  { keywords: ['sunrise', 'howrah'],                    image: sunriseHowrah },
  { keywords: ['city care'],                            image: cityCareKolkata },
  { keywords: ['apollo'],                               image: apolloHowrah },
  { keywords: ['durgapur'],                             image: durgapurMedical },
  { keywords: ['siliguri'],                             image: siliguri },
  // Medica Barasat has two entries in DB with different specialties
  { keywords: ['medica', 'barasat', 'ophthalmology'],   image: medicaBarasatOph },
  { keywords: ['medica', 'barasat', 'dermatology'],     image: medicaBarasatOph },
  { keywords: ['medica', 'barasat', 'kidney'],          image: medicaBarasatNiva },
  { keywords: ['medica', 'barasat', 'urology'],         image: medicaBarasatNiva },
  { keywords: ['medica', 'barasat'],                    image: medicaBarasatNiva },
];

/**
 * Resolve the best local image for a hospital.
 * @param {object} hospital - Hospital object with at least `name` (and optionally `specialties`, `image`)
 * @param {number} [index=0] - Index for deterministic fallback
 * @returns {string} Image import path
 */
export function resolveHospitalImage(hospital, index = 0) {
  if (!hospital) return fallbackPool[0];

  // If the hospital has a custom uploaded image (not unsplash default), use it
  if (
    hospital.image &&
    !hospital.image.includes('images.unsplash.com') &&
    !hospital.image.includes('unsplash') &&
    hospital.image.length > 10
  ) {
    return hospital.image;
  }

  const name = (hospital.name || '').toLowerCase();
  const specs = (hospital.specialties || '').toLowerCase();
  const combined = `${name} ${specs}`;

  for (const entry of IMAGE_MAP) {
    if (entry.keywords.every(kw => combined.includes(kw))) {
      return entry.image;
    }
  }

  // Deterministic fallback for any unknown hospital
  return fallbackPool[index % fallbackPool.length];
}

export default resolveHospitalImage;
