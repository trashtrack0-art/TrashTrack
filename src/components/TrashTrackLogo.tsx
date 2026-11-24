import { useState, type ReactNode } from 'react';

export function TrashTrackLogo({
  size = 44,
  variant = 'green',
}: {
  size?: number;
  variant?: 'green' | 'white';
}) {
  const leafFill = variant === 'white' ? '#FFFFFF' : '#1D6B44';
  const accentFill = variant === 'white' ? '#1D6B44' : '#FFFFFF';
  const stemStroke = variant === 'white' ? '#1D6B44' : '#FFFFFF';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M52 10C31 10 14 21 12 41C11.4 46.8 14 52 14 52C14 52 19.5 54.4 25.5 53.8C44.5 51.8 54 33.5 52 10Z"
        fill={leafFill}
      />
      <path
        d="M12 52C18 45 27 36 38 26"
        stroke={stemStroke}
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.35"
      />
      <g stroke={accentFill} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M33 21L38.5 29.5L32.5 30" />
        <path d="M40.5 33.5L36.5 41.5L29 41.5" />
        <path d="M25.5 39L22.5 31.5L28 24.5" />
      </g>
    </svg>
  );
}

export function VillageIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Clean green community neighborhood in Barangay Calongay"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <rect width="640" height="240" fill="#E9F5EE" />
      <circle cx="520" cy="54" r="24" fill="#FDE68A" opacity="0.85" />
      <path
        d="M0 165C95 125 190 132 285 158C380 184 485 120 640 148V240H0V165Z"
        fill="#BEE3CB"
      />
      <path
        d="M0 190C130 156 260 176 380 192C495 206 565 170 640 182V240H0V190Z"
        fill="#7FC49A"
      />
      <path
        d="M0 212C155 196 310 216 470 206C545 201 595 208 640 214V240H0V212Z"
        fill="#278556"
      />
      <rect x="88" y="140" width="66" height="44" rx="4" fill="#FFFFFF" stroke="#1D6B44" strokeWidth="2" />
      <path d="M78 142L121 110L164 142H78Z" fill="#1D6B44" />
      <rect x="112" y="158" width="16" height="26" rx="2" fill="#EAF3ED" stroke="#1D6B44" strokeWidth="1.5" />
      <rect x="95" y="154" width="11" height="11" rx="2" fill="#D5E5DB" />
      <rect x="268" y="132" width="76" height="48" rx="4" fill="#FFFFFF" stroke="#1D6B44" strokeWidth="2" />
      <path d="M258 134L306 98L354 134H258Z" fill="#278556" />
      <rect x="297" y="152" width="18" height="28" rx="2" fill="#EAF3ED" stroke="#1D6B44" strokeWidth="1.5" />
      <rect x="276" y="148" width="12" height="12" rx="2" fill="#D5E5DB" />
      <rect x="322" y="148" width="12" height="12" rx="2" fill="#D5E5DB" />
      <rect x="462" y="144" width="62" height="42" rx="4" fill="#FFFFFF" stroke="#1D6B44" strokeWidth="2" />
      <path d="M454 146L493 116L532 146H454Z" fill="#1D6B44" />
      <rect x="485" y="160" width="16" height="26" rx="2" fill="#EAF3ED" stroke="#1D6B44" strokeWidth="1.5" />
      <rect x="44" y="150" width="6" height="32" rx="3" fill="#155334" />
      <circle cx="47" cy="138" r="20" fill="#278556" />
      <circle cx="37" cy="145" r="13" fill="#3CA06D" />
      <rect x="206" y="144" width="6" height="34" rx="3" fill="#155334" />
      <circle cx="209" cy="130" r="22" fill="#1D6B44" />
      <circle cx="222" cy="138" r="14" fill="#278556" />
      <rect x="398" y="148" width="6" height="30" rx="3" fill="#155334" />
      <circle cx="401" cy="136" r="18" fill="#3CA06D" />
      <rect x="568" y="142" width="6" height="36" rx="3" fill="#155334" />
      <circle cx="571" cy="128" r="22" fill="#1D6B44" />
      <circle cx="558" cy="136" r="13" fill="#278556" />
    </svg>
  );
}

export function CommunityCleanIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Clean Barangay Calongay park and waste segregation bins"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <rect width="320" height="220" fill="#DCEFE3" />
      <path d="M0 154C80 128 190 138 320 152V220H0V154Z" fill="#9ED4B3" />
      <path d="M0 176C110 162 215 170 320 180V220H0V176Z" fill="#278556" />
      <rect x="42" y="108" width="8" height="48" rx="4" fill="#155334" />
      <circle cx="46" cy="92" r="28" fill="#1D6B44" />
      <circle cx="64" cy="102" r="18" fill="#3CA06D" />
      <rect x="266" y="114" width="8" height="44" rx="4" fill="#155334" />
      <circle cx="270" cy="98" r="25" fill="#278556" />
      <rect x="104" y="124" width="30" height="44" rx="5" fill="#1D6B44" />
      <rect x="101" y="118" width="36" height="8" rx="3" fill="#155334" />
      <circle cx="119" cy="146" r="6" fill="#FFFFFF" opacity="0.9" />
      <rect x="145" y="124" width="30" height="44" rx="5" fill="#278556" />
      <rect x="142" y="118" width="36" height="8" rx="3" fill="#1D6B44" />
      <circle cx="160" cy="146" r="6" fill="#FFFFFF" opacity="0.9" />
      <rect x="186" y="124" width="30" height="44" rx="5" fill="#0D9488" />
      <rect x="183" y="118" width="36" height="8" rx="3" fill="#0F766E" />
      <circle cx="201" cy="146" r="6" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export function EarthCareIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Caring for a clean and green environment"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <rect width="640" height="240" fill="#EAF5EE" />
      <circle cx="320" cy="120" r="88" fill="#D5ECE0" />
      <circle cx="320" cy="120" r="64" fill="#38BDF8" opacity="0.28" />
      <circle cx="320" cy="120" r="60" fill="#60A5FA" opacity="0.45" />
      <path
        d="M286 86C296 76 318 76 326 90C333 102 316 116 306 120C294 125 276 112 280 98C282 92 283 89 286 86Z"
        fill="#278556"
      />
      <path
        d="M332 104C346 98 364 108 366 124C368 140 350 156 334 150C322 145 322 126 328 114C330 109 330 105 332 104Z"
        fill="#1D6B44"
      />
      <path d="M242 122C222 114 212 96 218 82C232 82 246 96 248 116" fill="#278556" />
      <path d="M398 122C418 114 428 96 422 82C408 82 394 96 392 116" fill="#1D6B44" />
      <path
        d="M250 156C250 182 280 202 316 202H324C360 202 390 182 390 156"
        stroke="#1D6B44"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SafeIllustration({
  src,
  alt,
  className = '',
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export const ASSETS = {
  villageHills: '/src/assets/images/trashtrack_village_hills_1795496514513.jpg',
  communityBanner: '/src/assets/images/trashtrack_community_banner_1795496515431.jpg',
  earthTips: '/src/assets/images/trashtrack_earth_tips_1795496515972.jpg',
};
