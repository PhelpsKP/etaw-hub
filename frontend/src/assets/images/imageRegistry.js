// Image Registry - Centralized image imports for ETAW Hub

// ===========================
// BRANDING
// ===========================
import logoTransparent from './branding/elite-logo-transparent-001.png';
import logoStandard from './branding/elite-logo-001.jpg';

// ===========================
// HERO IMAGES
// ===========================
import heroPrimaryCoachingGym from './hero/hero-primary-approachable-coaching-gym-001.jpg';
import heroPrimaryCommunityGroup from './hero/hero-primary-community-group-training-002.jpg';
import heroAtmosphereStrengthFacility from './hero/hero-section-atmosphere-strength-facility-001.jpg';
import heroFacilityOpenSpace from './hero/hero-section-facility-open-space-002.jpg';
import heroStrongCoachIdentity from './hero/hero-secondary-strong-coach-identity-001.jpg';
import heroEquipmentStrengthFocus from './hero/hero-section-equipment-strength-focus-003.jpg';
import heroPersonalConnection from './hero/hero-secondary-personal-connection-coach-002.jpg';

// ===========================
// GALLERY IMAGES
// ===========================
import galleryBoxingGlovesCloseup from './gallery/gallery-boxing-training-gloves-closeup-001.jpg';
import galleryBoxingPadwork1 from './gallery/gallery-boxing-coaching-padwork-001.jpg';
import galleryBoxingPadwork2 from './gallery/gallery-boxing-coaching-padwork-002.jpg';
import galleryBoxingPadwork3 from './gallery/gallery-boxing-coaching-padwork-003.jpg';
import galleryBoxingRing from './gallery/gallery-boxing-training-ring-001.jpg';
import galleryBoxingHeavybag1 from './gallery/gallery-boxing-training-heavybag-001.jpg';
import galleryBoxingHeavybag3 from './gallery/gallery-boxing-training-heavybag-003.jpg';
import galleryBoxingPair1 from './gallery/gallery-boxing-training-pair-001.jpg';
import galleryStrengthFloor1 from './gallery/gallery-strength-training-floor-001.jpg';
import galleryStrengthFloor3 from './gallery/gallery-strength-training-floor-003.jpg';
import galleryMixedGymWide1 from './gallery/gallery-mixed-training-gym-wide-001.jpg';
import galleryMixedGymWide2 from './gallery/gallery-mixed-training-gym-wide-002.jpg';
import galleryEquipmentRacks from './gallery/gallery-facility-equipment-racks-001.jpg';
import galleryKettlebells from './gallery/gallery-conditioning-equipment-kettlebells-001.jpg';

// ===========================
// PEOPLE IMAGES
// ===========================
import peopleCoachBoxing from './people/people-coach-boxing-coaching-001.jpg';
import peopleCoachStrength from './people/people-coach-strength-coaching-002.jpg';
import peopleCoachCandid from './people/people-coach-candid-gym-003.jpg';
import peoplePetCommunity from './people/people-pet-gym-community-001.jpg';

// ===========================
// FACILITY IMAGES
// ===========================
// NOTE: Facility PNG images are too large (>25MB) for Cloudflare Pages deployment
// and are not currently used in marketing pages. Commented out to reduce bundle size.
// import facilityBoxingRingHero from './facility/facility-boxing-hero-ring-training-001.png';
// import facilityStrengthCoaching from './facility/facility-strength-section-coaching-in-action-001.png';
// import facilityBoxingWallBags from './facility/facility-boxing-background-wall-bags-001.png';

// ===========================
// EXPORTS
// ===========================
export const branding = {
  logoTransparent,
  logoStandard,
};

export const hero = {
  primary: heroPrimaryCommunityGroup,
  primaryAlt: heroPrimaryCoachingGym,
  atmosphere: heroAtmosphereStrengthFacility,
  openSpace: heroFacilityOpenSpace,
  coachIdentity: heroStrongCoachIdentity,
  equipment: heroEquipmentStrengthFocus,
  personalConnection: heroPersonalConnection,
};

export const gallery = [
  { src: galleryBoxingGlovesCloseup, alt: 'Boxing training gloves closeup' },
  { src: galleryBoxingPadwork1, alt: 'Boxing padwork coaching session' },
  { src: galleryBoxingRing, alt: 'Boxing ring training session' },
  { src: galleryBoxingHeavybag1, alt: 'Heavy bag boxing training' },
  { src: galleryBoxingHeavybag3, alt: 'Boxing heavy bag workout' },
  { src: galleryBoxingPair1, alt: 'Partner boxing training' },
  { src: galleryStrengthFloor1, alt: 'Strength training floor session' },
  { src: galleryStrengthFloor3, alt: 'Floor-based strength training' },
  { src: galleryMixedGymWide1, alt: 'Gym training space and equipment' },
  { src: galleryMixedGymWide2, alt: 'Wide facility training area' },
  { src: galleryEquipmentRacks, alt: 'Strength equipment and racks' },
  { src: galleryKettlebells, alt: 'Conditioning equipment and kettlebells' },
  { src: galleryBoxingPadwork2, alt: 'Boxing coaching and padwork' },
  { src: galleryBoxingPadwork3, alt: 'Padwork training session' },
];

export const people = {
  coachBoxing: peopleCoachBoxing,
  coachStrength: peopleCoachStrength,
  coachCandid: peopleCoachCandid,
  petCommunity: peoplePetCommunity,
};

// Facility images commented out due to file size limits
// export const facility = {
//   boxingRingHero: facilityBoxingRingHero,
//   strengthCoaching: facilityStrengthCoaching,
//   boxingWallBags: facilityBoxingWallBags,
// };
