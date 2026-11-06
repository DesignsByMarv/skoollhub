export type School = { id: string; name: string; short_name: string; city: string; state: string };

export type House = {
  id: string;
  owner_id: string;
  school_id: string;
  title: string;
  description: string;
  price_per_year: number;
  address: string;
  area_name: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  is_verified: boolean;
  room_type: string;
  caution_deposit: number;
  agency_fee: number;
  legal_fee: number;
  service_charge: number;
  school: School | null;
  owner: { id: string; full_name: string; username: string; avatar_url: string | null; phone_number: string | null } | null;
  contact_unlocked?: boolean;
  is_owner?: boolean;
};

export const starterSchools: School[] = [
  { id: 'unilag', name: 'University of Lagos', short_name: 'UNILAG', city: 'Akoka, Lagos', state: 'Lagos' },
  { id: 'ui', name: 'University of Ibadan', short_name: 'UI', city: 'Ibadan', state: 'Oyo' },
  { id: 'oau', name: 'Obafemi Awolowo University', short_name: 'OAU', city: 'Ile-Ife', state: 'Osun' },
  { id: 'futa', name: 'Federal University of Technology Akure', short_name: 'FUTA', city: 'Akure', state: 'Ondo' },
  { id: 'uniben', name: 'University of Benin', short_name: 'UNIBEN', city: 'Benin City', state: 'Edo' },
  { id: 'cu', name: 'Covenant University', short_name: 'CU', city: 'Ota', state: 'Ogun' },
];

export const starterHouses: House[] = [
  {
    id: 'emerald-court-akoka',
    owner_id: 'host-1',
    school_id: 'unilag',
    title: 'Emerald Court Luxury Self-Contain',
    description: 'Located exactly 4 minutes walk from UNILAG Second Gate. Built with modern student conveniences: constant running borehole water, heavy solar inverter backup (charges laptops and lights throughout blackouts), 24/7 security guard at the gate, and individual prepaid meters. Super quiet study environment.',
    price_per_year: 420000,
    address: '14 University Road, Akoka',
    area_name: 'Akoka Gate 2',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['24/7 Solar Light', 'Constant Water', 'Security Guard', 'Free WiFi', 'Prepaid Meter', 'POP Ceiling'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    is_available: true,
    is_featured: true,
    is_verified: true,
    room_type: 'Self-contained',
    caution_deposit: 30000,
    agency_fee: 0,
    legal_fee: 15000,
    service_charge: 25000,
    school: starterSchools[0],
    owner: {
      id: 'host-1',
      full_name: 'Alhaji Rasheed Caretaker',
      username: 'rasheed_lodges',
      avatar_url: null,
      phone_number: '08023456789',
    },
    contact_unlocked: false,
    is_owner: false,
  },
  {
    id: 'greenwood-suites-agbowo',
    owner_id: 'host-2',
    school_id: 'ui',
    title: 'Greenwood Executive Student Suites',
    description: 'Freshly renovated self-contained apartment in Agbowo right across from University of Ibadan main gate. Tiled throughout, dedicated borehole, perimeter fence with night guard, and clean modern kitchenette. Walking distance to faculty buildings.',
    price_per_year: 320000,
    address: '8 Agbowo Shopping Complex Road',
    area_name: 'Agbowo Main Gate',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Borehole Water', 'Tiled Floors', 'Night Security', 'Private Balcony', 'Prepaid Meter'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    is_available: true,
    is_featured: true,
    is_verified: true,
    room_type: 'Self-contained',
    caution_deposit: 25000,
    agency_fee: 0,
    legal_fee: 10000,
    service_charge: 15000,
    school: starterSchools[1],
    owner: {
      id: 'host-2',
      full_name: 'Chief Oladipo Hostels',
      username: 'oladipo_ui',
      avatar_url: null,
      phone_number: '08134567890',
    },
    contact_unlocked: false,
    is_owner: false,
  },
  {
    id: 'coral-heights-mayfair',
    owner_id: 'host-3',
    school_id: 'oau',
    title: 'Coral Heights Single Room with Kitchenette',
    description: 'Peaceful, secure student lodging in Mayfair Ile-Ife. Popular among OAU medical and engineering scholars. Includes steady pumped water, solar lighting for night study, and a paved compound with perimeter razor wire.',
    price_per_year: 260000,
    address: '22 Mayfair Express Road',
    area_name: 'Mayfair, Ife',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Solar Study Light', 'Constant Pumping Water', 'Gated Perimeter', 'Quiet Study Zone'],
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
    ],
    is_available: true,
    is_featured: false,
    is_verified: true,
    room_type: 'Single room',
    caution_deposit: 20000,
    agency_fee: 0,
    legal_fee: 10000,
    service_charge: 10000,
    school: starterSchools[2],
    owner: {
      id: 'host-3',
      full_name: 'Mrs. Funke Adeleke',
      username: 'funke_mayfair',
      avatar_url: null,
      phone_number: '09012345678',
    },
    contact_unlocked: false,
    is_owner: false,
  },
  {
    id: 'falcon-villas-futa',
    owner_id: 'host-4',
    school_id: 'futa',
    title: 'Falcon Modern 1-Bedroom Flat',
    description: 'Spacious one-bedroom flat just 500 meters from FUTA South Gate. Separate living room, bedroom with wardrobe, modern bathroom, and dedicated kitchen. Solar power inverter ensures study sessions are never interrupted.',
    price_per_year: 380000,
    address: '7 South Gate Link Road',
    area_name: 'South Gate, Akure',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Solar Power Inverter', 'Borehole', 'Security Guard', 'Wardrobe', 'Prepaid Meter'],
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b2b91e0eb?auto=format&fit=crop&w=800&q=80',
    ],
    is_available: true,
    is_featured: true,
    is_verified: true,
    room_type: '1 bedroom flat',
    caution_deposit: 30000,
    agency_fee: 0,
    legal_fee: 15000,
    service_charge: 20000,
    school: starterSchools[3],
    owner: {
      id: 'host-4',
      full_name: 'Engr. Bamidele Property',
      username: 'bamidele_futa',
      avatar_url: null,
      phone_number: '07034567891',
    },
    contact_unlocked: false,
    is_owner: false,
  },
  {
    id: 'royal-annex-uniben',
    owner_id: 'host-5',
    school_id: 'uniben',
    title: 'Ugbowo Royal Annex Self-Con',
    description: 'High-demand self-contained unit behind BDPA, close to UNIBEN Ugbowo campus main gate. Fully tiled, running water, prepaid meter, and gated compound with resident caretaker.',
    price_per_year: 290000,
    address: '5 BDPA Quarters',
    area_name: 'BDPA, Ugbowo',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Running Water', 'Prepaid Meter', 'Tiled Floor', 'Resident Caretaker'],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ],
    is_available: true,
    is_featured: false,
    is_verified: true,
    room_type: 'Self-contained',
    caution_deposit: 20000,
    agency_fee: 0,
    legal_fee: 10000,
    service_charge: 10000,
    school: starterSchools[4],
    owner: {
      id: 'host-5',
      full_name: 'Mr. Osagie Properties',
      username: 'osagie_bdpa',
      avatar_url: null,
      phone_number: '08056789012',
    },
    contact_unlocked: false,
    is_owner: false,
  },
];
