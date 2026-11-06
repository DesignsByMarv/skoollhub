'use client';

import { Star, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: 'Damilola Adebayo',
    school: 'University of Lagos (UNILAG)',
    faculty: 'Faculty of Law • 300L',
    avatar: 'DA',
    gradient: 'from-blue-500 to-indigo-600',
    title: 'Saved me ₦35,000 in bogus agent fees!',
    quote:
      'Finding an apartment around Akoka used to be a terrifying nightmare with endless inspection fees. Through SkoollHub, I verified the lodge, spoke directly to the caretaker, and moved in within 48 hours without paying a dime to middlemen.',
    rating: 5,
    tag: 'Hostel Hunter',
  },
  {
    name: 'Ibrahim Danjuma',
    school: 'Ahmadu Bello University (ABU)',
    faculty: 'Computer Engineering • 400L',
    avatar: 'ID',
    gradient: 'from-indigo-500 to-purple-600',
    title: 'My roommate match is literally my best friend now.',
    quote:
      'I was so worried about getting paired with someone whose sleep schedule clashed with mine. The compatibility filter matched me with another quiet coder. We study together every night without any tension.',
    rating: 5,
    tag: 'Roommate Matched',
  },
  {
    name: 'Chisom Eze',
    school: 'University of Nigeria, Nsukka (UNN)',
    faculty: 'Pharmacy • 200L',
    avatar: 'CE',
    gradient: 'from-purple-500 to-pink-600',
    title: 'The Gemini AI revision summaries saved my GPA.',
    quote:
      'When our Organic Chemistry exam was moved forward by 2 weeks, I was in full panic mode. Skooll AI generated concise revision flashcards and solved past questions with step-by-step explanations. Scored an A!',
    rating: 5,
    tag: 'Gemini AI User',
  },
  {
    name: 'Folake Adeleke',
    school: 'Obafemi Awolowo University (OAU)',
    faculty: 'Accounting • 300L',
    avatar: 'FA',
    gradient: 'from-pink-500 to-rose-600',
    title: 'Timetable alerts mean I never miss 8 AM lectures.',
    quote:
      'OAU lecture schedules change frequently between auditoriums. Having my timetable sync on my phone with 15-minute countdown notifications keeps me completely organized every single week.',
    rating: 5,
    tag: 'Timetable Power User',
  },
  {
    name: 'Osasere Idehen',
    school: 'University of Benin (UNIBEN)',
    faculty: 'Electrical Engineering • 500L',
    avatar: 'OI',
    gradient: 'from-emerald-500 to-teal-600',
    title: 'Sold all my 400L engineering textbooks in 2 hours!',
    quote:
      'The campus marketplace is gold. I posted my old textbooks and rechargeable fan to junior students entering Hall 3 and had buyers messaging me inside the app within minutes. Zero hassle.',
    rating: 5,
    tag: 'Campus Marketplace',
  },
  {
    name: 'Blessing Udoh',
    school: 'Federal Univ. of Tech Akure (FUTA)',
    faculty: 'Applied Geophysics • 400L',
    avatar: 'BU',
    gradient: 'from-amber-500 to-orange-600',
    title: 'Installable app works seamlessly offline.',
    quote:
      'When campus Wi-Fi or data fluctuates during evening lectures, being able to open the PWA and view my saved classes and hostel contact info offline is a game changer.',
    rating: 5,
    tag: 'PWA Mobile App',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-800/70">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Student Stories & Love
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Loved by 15,000+ Students Across Nigeria
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Read how students from UNILAG, UI, OAU, UNIBEN, and beyond transformed their university experience.
          </p>
        </div>

        {/* Testimonials 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Rating & Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t.tag}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                  &ldquo;{t.title}&rdquo;
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {t.quote}
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.gradient} text-white font-bold text-xs flex items-center justify-center shadow-md`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                  </div>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{t.school}</p>
                  <p className="text-[10px] text-slate-400">{t.faculty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
