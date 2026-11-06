export type Category = 'Academic' | 'Housing' | 'Events' | 'Marketplace';
export type Comment = { id: string; authorId: string; author: string; handle: string; text: string; timestamp: string };
export type Post = {
  id: string;
  isOwnPost: boolean;
  author: string;
  handle: string;
  department: string;
  avatarUrl: string | null;
  timestamp: string;
  category: Category | null;
  content: string;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  locationLat: number | null;
  locationLng: number | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
};

export const starterFeedPosts: Post[] = [
  {
    id: 'feed-1',
    isOwnPost: false,
    author: 'Chinedu Okafor',
    handle: 'chinedu_mech',
    department: 'Mechanical Engineering • 400L',
    avatarUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35m ago
    category: 'Housing',
    content: 'Just finalized inspection for Greenwood Court lodge near Gate 2! 🏠🔑 Landlord verified on SkoollHub with zero agent fee nonsense. If anyone in Faculty of Engineering is still stranded for accommodation, hit up the housing tab before rooms fill up.',
    mediaUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    locationLat: 6.5173,
    locationLng: 3.3986,
    likesCount: 124,
    commentsCount: 18,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: 'c-1',
        authorId: 'u-1',
        author: 'Tobi Adeleke',
        handle: 'tobi_law',
        text: 'How is the light situation in that axis? Is solar inverter available?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: 'c-2',
        authorId: 'u-chinedu',
        author: 'Chinedu Okafor',
        handle: 'chinedu_mech',
        text: 'Yes bro, 24/7 backup inverter installed for each room and borehole is steady!',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
    ],
  },
  {
    id: 'feed-2',
    isOwnPost: false,
    author: 'Fatima Tijani',
    handle: 'fatima_med',
    department: 'Medicine & Surgery • 500L',
    avatarUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    category: 'Academic',
    content: 'Uploaded my summarized Pathology & Pharmacology revision flashcards for 300L/400L premed students in the Course Materials vault tab! 🩺📚 Used Skooll AI to test key clinical case questions. Go grab the PDF for free.',
    mediaUrl: null,
    mediaType: null,
    locationLat: null,
    locationLng: null,
    likesCount: 89,
    commentsCount: 14,
    isLiked: false,
    isBookmarked: true,
    comments: [
      {
        id: 'c-3',
        authorId: 'u-3',
        author: 'Amina Bello',
        handle: 'amina_pharm',
        text: 'Just downloaded it! The kidney nephron pathway diagrams are so clear. Thank you so much!',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: 'feed-3',
    isOwnPost: false,
    author: 'Emeka Kalu',
    handle: 'emeka_dev',
    department: 'Computer Science • 300L',
    avatarUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5h ago
    category: 'Marketplace',
    content: 'Selling my LONTOR 16-inch rechargeable standing fan with remote (battery lasts 8 hours continuous). Moving into a solar-powered apartment next week. ₦28,000 negotiable. DM or message on SkoollHub to inspect in campus hostel.',
    mediaUrl: 'https://images.unsplash.com/photo-1618941716939-5e78b1d7d740?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    locationLat: 6.518,
    locationLng: 3.399,
    likesCount: 42,
    commentsCount: 8,
    isLiked: false,
    isBookmarked: false,
    comments: [],
  },
  {
    id: 'feed-4',
    isOwnPost: false,
    author: 'Student Union Campus Pulse',
    handle: 'campus_pulse',
    department: 'SUG Directorate of Socials',
    avatarUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 540).toISOString(), // 9h ago
    category: 'Events',
    content: 'Inter-Faculty Football Cup Semi-Finals happening tomorrow at the Main Sports Complex! 🏆⚽ Faculty of Science vs Faculty of Law at 4:00 PM. Free energy drinks for the first 100 students wearing faculty colors.',
    mediaUrl: null,
    mediaType: null,
    locationLat: null,
    locationLng: null,
    likesCount: 215,
    commentsCount: 31,
    isLiked: true,
    isBookmarked: false,
    comments: [],
  },
];
