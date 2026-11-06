export type School = { id: string; name: string; short_name: string };

export type Roommate = {
  id: string;
  student_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  department: string | null;
  level: number | null;
  school: School | null;
  budget_share: number;
  preferred_location: string | null;
  study_habit: string | null;
  cleanliness: string | null;
  social_style: string | null;
  bio: string | null;
  gender: string;
  cooks: boolean;
  smokes: boolean;
  contact_enabled: boolean;
  match_score: number;
  same_school: boolean;
};

export const starterRoommates: Roommate[] = [
  {
    id: 'rm-1',
    student_id: 'user-emeka',
    full_name: 'Emeka Kalu',
    username: 'emeka_dev',
    avatar_url: null,
    department: 'Computer Engineering',
    level: 300,
    school: { id: 'unilag', name: 'University of Lagos', short_name: 'UNILAG' },
    budget_share: 210000,
    preferred_location: 'Akoka Gate 2 or St. Finbarrs',
    study_habit: 'Focused & quiet study late night',
    cleanliness: 'Very tidy & orderly',
    social_style: 'Calm & studious',
    bio: 'Looking for a flatmate to split a spacious self-contain or 2-bedroom flat around Akoka. Serious about academics, love tech and coding, clean, non-smoker, and cook often.',
    gender: 'Male',
    cooks: true,
    smokes: false,
    contact_enabled: true,
    match_score: 96,
    same_school: true,
  },
  {
    id: 'rm-2',
    student_id: 'user-amina',
    full_name: 'Amina Bello',
    username: 'amina_pharm',
    avatar_url: null,
    department: 'Pharmacy',
    level: 400,
    school: { id: 'ui', name: 'University of Ibadan', short_name: 'UI' },
    budget_share: 180000,
    preferred_location: 'Agbowo or Bodija',
    study_habit: 'Early bird morning reviser',
    cleanliness: 'Neat freak & organized',
    social_style: 'Friendly & peaceful',
    bio: 'Final year pharmacy student. Need a peaceful, clean study environment. Respect personal space and privacy. Non-smoker only.',
    gender: 'Female',
    cooks: true,
    smokes: false,
    contact_enabled: true,
    match_score: 94,
    same_school: true,
  },
  {
    id: 'rm-3',
    student_id: 'user-tobi',
    full_name: 'Tobi Adeleke',
    username: 'tobi_law',
    avatar_url: null,
    department: 'Faculty of Law',
    level: 200,
    school: { id: 'oau', name: 'Obafemi Awolowo University', short_name: 'OAU' },
    budget_share: 150000,
    preferred_location: 'Mayfair or Asherifa',
    study_habit: 'Evening library study',
    cleanliness: 'Clean & considerate',
    social_style: 'Balanced & conversational',
    bio: 'Law 200L student seeking a roommate for a lodge around Mayfair. Easy to live with, love good music at low volume, honest and respectful.',
    gender: 'Male',
    cooks: true,
    smokes: false,
    contact_enabled: true,
    match_score: 91,
    same_school: true,
  },
  {
    id: 'rm-4',
    student_id: 'user-chisom',
    full_name: 'Chisom Okeke',
    username: 'chisom_arch',
    avatar_url: null,
    department: 'Architecture',
    level: 400,
    school: { id: 'futa', name: 'Federal University of Tech Akure', short_name: 'FUTA' },
    budget_share: 190000,
    preferred_location: 'South Gate, FUTA',
    study_habit: 'Night studio design sessions',
    cleanliness: 'Very tidy',
    social_style: 'Quiet & creative',
    bio: 'Architecture student working on final studio models. Spend long nights drawing and rendering. Looking for a quiet, reliable flatmate to share rent.',
    gender: 'Male',
    cooks: true,
    smokes: false,
    contact_enabled: true,
    match_score: 93,
    same_school: true,
  },
  {
    id: 'rm-5',
    student_id: 'user-blessing',
    full_name: 'Blessing Daniel',
    username: 'blessing_uniben',
    avatar_url: null,
    department: 'Accounting',
    level: 300,
    school: { id: 'uniben', name: 'University of Benin', short_name: 'UNIBEN' },
    budget_share: 160000,
    preferred_location: 'BDPA or Osasogie',
    study_habit: 'Structured daily reviews',
    cleanliness: 'High hygiene standard',
    social_style: 'Polite & disciplined',
    bio: 'Looking for a female roommate to share a self-contain near UNIBEN main gate. Quiet, clean, love cooking, non-smoker.',
    gender: 'Female',
    cooks: true,
    smokes: false,
    contact_enabled: true,
    match_score: 95,
    same_school: true,
  },
];
