"use client";

import React from 'react';
import { useNav } from '../lib/navContext';

const pads = [
  {
    sanskrit: 'Namo Arihantanam',
    devanagari: 'णमो अरिहंताणं',
    gujarati: 'નમો અરિહંતાણં',
    meaning: 'I bow to the Arihants — enlightened souls who have conquered all inner passions.',
  },
  {
    sanskrit: 'Namo Siddhanam',
    devanagari: 'णमो सिद्धाणं',
    gujarati: 'નમો સિદ્ધાણં',
    meaning: 'I bow to the Siddhas — liberated souls who have attained infinite knowledge and bliss.',
  },
  {
    sanskrit: 'Namo Ayariyanam',
    devanagari: 'णमो आयरियाणं',
    gujarati: 'નમો આયરિયાણં',
    meaning: 'I bow to the Acharyas — great teachers who lead the Jain community on the path of dharma.',
  },
  {
    sanskrit: 'Namo Uvajjhayanam',
    devanagari: 'णमो उवज्झायाणं',
    gujarati: 'નમો ઉવજ્ઝાયાણં',
    meaning: 'I bow to the Upadhyayas — scholar monks who teach the sacred scriptures.',
  },
  {
    sanskrit: 'Namo Loye Savva Sahunam',
    devanagari: 'णमो लोए सव्व साहूणं',
    gujarati: 'નમો લોએ સવ્વ સાહૂણં',
    meaning: 'I bow to all Sadhus and Sadhvis — monks and nuns devoted to self-discipline and compassion.',
  },
];

const siddhiSteps = [
  {
    step: 1,
    title: 'Take Sankalp',
    desc: 'Sit in a clean, quiet place. Mentally resolve your daily target — how many Navkars or malas you will complete each day and for how many days.',
  },
  {
    step: 2,
    title: 'Set Your Daily Target',
    desc: 'Common targets: 36 (1 short mala), 108 (1 full mala), 1008 (approx. 9 malas), or higher. Choose what suits your practice. Keep your phone on silent.',
  },
  {
    step: 3,
    title: 'Maintain Niyam',
    desc: 'Practice at a fixed time and place each day. Sit facing east or north if possible. Avoid eating during jaap. Stay focused with devotion.',
  },
  {
    step: 4,
    title: 'Begin Jaap',
    desc: 'Recite each Navkar with attention on each pad. Tap to count. You can use 9, 27, 36, or 108 beads per mala. After completing your chosen mala size, one mala is complete. Continue until your daily target is met.',
  },
  {
    step: 5,
    title: 'Track & Reflect',
    desc: 'After completing your daily count, take a moment of silence. Reflect on kshamā (forgiveness), ahimsā (non-violence), or samyaktva (right faith).',
  },
];

const AboutPage = () => {
  const { setPage } = useNav();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-16 pb-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-serif font-bold text-orange-900 text-center mb-2">
          About the Navkar Mantra
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
          The Navkar (Namokar) Mantra is the most sacred prayer in Jainism. It does not ask for
          material things — instead, we bow to the <em>qualities</em> of five supreme beings,
          seeking their virtues within ourselves.
        </p>

        {/* Jain Devotional Resources */}
        <section className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/30 text-white shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">📚</span>
            <div>
              <h2 className="font-serif font-bold text-amber-300 text-base">Jain Devotional Resources</h2>
              <p className="text-xs text-amber-200/70">Sacred texts, timing references & Panchang datasets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {/* Muhurat & Choghadiya Card */}
            <button
              onClick={() => setPage('muhurat')}
              className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">🕐</span>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">MUHURAT</span>
              </div>
              <h3 className="font-bold text-amber-200 text-sm font-serif group-hover:text-amber-300">ચોઘડિયા અને હોરા</h3>
              <p className="text-xs text-amber-200/60 mt-1">Day/Night Choghadiya, Hora planets & auspicious timings</p>
            </button>

            {/* Pachkan Sutras Card */}
            <button
              onClick={() => setPage('pachkan')}
              className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">📿</span>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">PACHKAN</span>
              </div>
              <h3 className="font-bold text-amber-200 text-sm font-serif group-hover:text-amber-300">પચ્ચક્ખાણ પાઠ (Pachkan)</h3>
              <p className="text-xs text-amber-200/60 mt-1">Original Gujarati text for Navkarsi, Porsi, Ayambil, Upvas</p>
            </button>
          </div>
        </section>

        {/* JainZBharat Community */}
        <section className="mb-8 bg-gradient-to-br from-orange-700 to-orange-900 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-bold uppercase tracking-wide">JainZBharat Community</h2>
          </div>
          <p className="text-sm leading-relaxed text-orange-100 mb-3">
            JainZ is a <strong className="text-white">tech-driven community</strong> where students
            and professionals co-create impactful digital projects rooted in Jain values. Whether
            you are a developer, designer, researcher, or simply a Jain at heart — there is a place
            for you here.
          </p>
          <p className="text-xs text-orange-200 mb-4 italic">
            Open to all — irrespective of religion. ✌️
          </p>
          <a
            href="https://chat.whatsapp.com/JUJxtRhHmJ0LM6Uk0OH0v5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-orange-800 px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-50 transition-colors shadow"
          >
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Join JainZBharat on WhatsApp
          </a>
        </section>

        {/* Why Join JainZ */}
        <section className="mb-8 bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
          <h2 className="text-base font-serif font-bold text-orange-800 mb-3">Why Join JainZ?</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">💼</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Boost Your CV / Resume</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Co-create real-world projects with our team — get hands-on experience that adds
                  genuine value to your portfolio and career profile.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🚀</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Ship Real Products</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Everything we build is deployed and used by the Jain community. Your work has
                  real users, real impact — not just a college assignment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🕉️</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Contribute to Jainism</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your skills can help preserve, modernise, and spread Jain teachings and culture
                  through technology.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🌐</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Grow Your Network</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Connect with like-minded Jain students, developers, designers, and entrepreneurs
                  across India and beyond.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🧠</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Learn by Doing</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Work on live codebases, get peer reviews, and pick up industry skills — React,
                  Firebase, PWA, UI/UX, and more — in a supportive environment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🏅</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Get Recognised</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Contributors are credited in the app and on GitHub. Your name goes on work that
                  the Jain community actively uses every day.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🤝</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Students &amp; Professionals Welcome</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Whether you are in college or already working, JainZ has a project and a role
                  that matches your skills and interests. Open to all, irrespective of religion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Language Support */}
        <section className="mb-8 bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
          <h3 className="text-base font-serif font-semibold text-orange-800 mb-2">Language Support</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            This app supports the Navkar Mantra in three languages — <strong>English (Prakrit transliteration)</strong>,{' '}
            <strong>Hindi (Devanagari)</strong>, and <strong>Gujarati</strong>. Use the language toggle button
            in the top-right corner during jaap to switch between them.
          </p>
        </section>

        {/* Five Pads */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-semibold text-orange-800 mb-4">The Five Pads</h2>
          <div className="space-y-3">
            {pads.map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                <div className="flex flex-col gap-1 mb-1">
                  <span className="text-orange-700 font-serif font-semibold text-sm">{p.sanskrit}</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-orange-500 text-xs">{p.devanagari}</span>
                    <span className="text-orange-500 text-xs">{p.gujarati}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{p.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Last lines explanation */}
        <section className="mb-8 bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
          <h3 className="text-base font-serif font-semibold text-orange-800 mb-2">The Concluding Lines</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>Eso Panch Namukkaro, Savva Pavappanasano</strong> — This five-fold salutation
            destroys all sins.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Mangalanam Cha Savvesim, Padhamam Havai Mangalam</strong> — Of all auspicious things,
            this is the most auspicious.
          </p>
        </section>

        {/* How to do Navkar Siddhi Tap */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-semibold text-orange-800 mb-2">
            How to Do Navkar Siddhi Tap
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Navkar Siddhi Tap is a structured tapas where you commit to reciting a fixed number of Navkars
            daily for a set duration. It cultivates discipline, devotion, and inner peace.
          </p>
          <div className="space-y-3">
            {siddhiSteps.map(s => (
              <div key={s.step} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{s.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* JainZBharat */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl p-5 border border-orange-200 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-orange-900 mb-1">JainZBharat</h2>
            <p className="text-xs text-orange-600 mb-3">Founded by Saumya Jignesh Sanghvi</p>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              JainZBharat is a youth-driven initiative dedicated to strengthening Jain identity in
              the modern era through disciplined action, ethical leadership, and cultural continuity.
            </p>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              It is built on a simple belief: Modern life is fast. Jain Dharma is timeless.
              The future belongs to those who can integrate both.
            </p>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              JainZBharat encourages Jain youth to move beyond passive digital identity and embrace
              value-driven living rooted in <em>Ahimsa</em>, <em>Aparigraha</em>, <em>Anekantavada</em>,{' '}
              <em>Satya</em>, and <em>Tapasya</em>.
            </p>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              This is not about replacing tradition. It is about activating it.
            </p>

            <h3 className="text-sm font-semibold text-orange-800 mb-2">JainZBharat seeks to:</h3>
            <ul className="text-sm text-gray-700 leading-relaxed space-y-1.5 mb-3 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">&#8226;</span>
                <span>Translate Jain principles into daily life frameworks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">&#8226;</span>
                <span>Build responsible, self-regulated leaders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">&#8226;</span>
                <span>Strengthen youth engagement within Jain Sanghs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">&#8226;</span>
                <span>Promote ethical entrepreneurship and financial discipline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">&#8226;</span>
                <span>Preserve cultural heritage through modern tools</span>
              </li>
            </ul>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              JainZBharat is open, respectful, and collaborative. It does not compete with existing
              Sanghs or institutions. It exists to support, modernize engagement, and serve.
            </p>

            <div className="bg-white/60 rounded-lg p-3 border border-orange-100">
              <p className="text-sm text-orange-800 font-medium leading-relaxed">
                Our vision: A generation of Jain youth who are calm decision-makers, ethically
                ambitious, culturally rooted, and nationally contributive.
              </p>
              <p className="text-xs text-orange-600 mt-2 font-medium">
                JainZ is not a demographic label. It is a commitment to character.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-3">
          <button
            onClick={() => setPage('jaap')}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors shadow-md"
          >
            Begin Jaap
          </button>
          <div>
            <button
              onClick={() => setPage('privacy')}
              className="text-gray-400 text-xs hover:text-orange-600 hover:underline transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
