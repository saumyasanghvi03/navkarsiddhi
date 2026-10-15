"use client";

import React, { useState } from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const APP_VERSION = '2.0';

const pads = [
  {
    num: 1,
    sanskrit: 'Namo Arihantanam',
    script: 'णमो अरिहंताणं',
    gujarati: 'નમો અરિહંતાણં',
    meaning: 'I bow to the Arihants — enlightened souls who have conquered all inner passions.',
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    numBg: 'bg-amber-100 text-amber-700',
  },
  {
    num: 2,
    sanskrit: 'Namo Siddhanam',
    script: 'णमो सिद्धाणं',
    gujarati: 'નમો સિદ્ધાણં',
    meaning: 'I bow to the Siddhas — liberated souls who have attained infinite knowledge and bliss.',
    color: 'from-orange-50 to-rose-50',
    border: 'border-orange-200',
    numBg: 'bg-orange-100 text-orange-700',
  },
  {
    num: 3,
    sanskrit: 'Namo Ayariyanam',
    script: 'णमो आयरियाणं',
    gujarati: 'નમો આયરિયાણं',
    meaning: 'I bow to the Acharyas — great teachers who lead the Jain community on the path of dharma.',
    color: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    numBg: 'bg-rose-100 text-rose-700',
  },
  {
    num: 4,
    sanskrit: 'Namo Uvajjhayanam',
    script: 'णमो उवज्झायाणं',
    gujarati: 'નમો ઉવઝ્ઝાયાણं',
    meaning: 'I bow to the Upadhyayas — scholar monks who teach the sacred scriptures.',
    color: 'from-pink-50 to-fuchsia-50',
    border: 'border-pink-200',
    numBg: 'bg-pink-100 text-pink-700',
  },
  {
    num: 5,
    sanskrit: 'Namo Loye Savva Sahunam',
    script: 'णमो लोए सव्व साहूणं',
    gujarati: 'નમો લોએ સવ્વ સાહૂણं',
    meaning: 'I bow to all Sadhus and Sadhvis — monks and nuns devoted to self-discipline and compassion.',
    color: 'from-fuchsia-50 to-violet-50',
    border: 'border-fuchsia-200',
    numBg: 'bg-fuchsia-100 text-fuchsia-700',
  },
];

const features = [
  { icon: '⌚', title: 'Wrist Companion', desc: 'Live mala progress on any Android smartwatch. Milestone buzzes on mala complete and daily target.' },
  { icon: '🟧', title: 'Home Screen Widget', desc: 'Today\'s count, malas, and streak glanceable on your Android home screen without opening the app.' },
  { icon: '🎯', title: 'Tap Goals', desc: 'Set a daily Navkar target, track streaks, and get wrist alerts when you hit your goal.' },
  { icon: '🔢', title: 'Flexible Mala Sizes', desc: 'Choose 9, 27, 36, or 108 beads per mala to match your personal practice.' },
  { icon: '📊', title: 'Progress History', desc: 'Daily and weekly charts of your focus, calm, and Navkar counts over time.' },
  { icon: '🧠', title: 'Neuro Mode', desc: 'Connect a Muse EEG headband to visualise focus and calm metrics in real time during jaap.' },
];

const steps = [
  { step: 1, title: 'Take Sankalp', desc: 'Sit in a clean, quiet place. Resolve your daily target — Navkars or malas — and the duration of your commitment.' },
  { step: 2, title: 'Set Your Daily Target', desc: 'Common targets: 36 (short mala), 108 (1 full mala), 1008 (~9 malas). Choose what fits your practice. Phone on silent.' },
  { step: 3, title: 'Maintain Niyam', desc: 'Practice at a fixed time and place each day. Face east or north if possible. Avoid eating during jaap.' },
  { step: 4, title: 'Begin Jaap', desc: 'Recite each Navkar with attention on each pad. Tap to count. After your chosen mala size, one mala is complete.' },
  { step: 5, title: 'Track & Reflect', desc: 'After completing your count, take a moment of silence. Reflect on kṣamā (forgiveness), ahiṃsā, or samyaktva.' },
];

const whyJoin = [
  { icon: '💼', title: 'Boost Your Resume', desc: 'Co-create real-world deployed projects. Genuine portfolio value, not a college assignment.' },
  { icon: '🚀', title: 'Ship Real Products', desc: 'Everything we build is used by the Jain community. Your work has real users and real impact.' },
  { icon: '🕉️', title: 'Contribute to Jainism', desc: 'Your skills can help preserve, modernise, and spread Jain teachings through technology.' },
  { icon: '🌐', title: 'Grow Your Network', desc: 'Connect with Jain students, developers, designers, and entrepreneurs across India and beyond.' },
  { icon: '🧠', title: 'Learn by Doing', desc: 'Live codebases, peer reviews, React, Next.js, Android, AI — in a supportive environment.' },
  { icon: '🏅', title: 'Get Recognised', desc: 'Contributors are credited in the app and on GitHub. Your name goes on work the community uses daily.' },
];

const AboutPage = () => {
  const { setPage } = useNav();
  const [topPadding] = useState(pageTopPaddingClass);
  const [openSection, setOpenSection] = useState(null);

  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 ${topPadding} pb-10`}>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 px-5 pt-8 pb-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, #fff 0%, transparent 60%)' }} />
        <div className="max-w-lg mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl shadow-lg border border-white/30">
              🪔
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold leading-tight">Navkar Siddhi</h1>
              <p className="text-orange-200 text-xs mt-0.5 font-medium tracking-wide">v{APP_VERSION} · By JainZBharat</p>
            </div>
          </div>
          <p className="text-sm text-orange-100 leading-relaxed mb-5">
            The most sacred prayer in Jainism, always with you. We bow not for wishes — but to honour
            the qualities of five supreme beings and seek those virtues within ourselves.
          </p>
          <button
            onClick={() => setPage('jaap')}
            className="inline-flex items-center gap-2 bg-white text-orange-700 px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-orange-50 transition-colors"
          >
            🙏 Begin Jaap
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">

        {/* ── The Mantra ── */}
        <section className="mt-6 mb-6 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('mantra')}
            className="w-full flex items-center justify-between p-4"
          >
            <h2 className="text-base font-serif font-bold text-orange-900">📿 The Navkar Mantra</h2>
            <span className="text-orange-400 text-lg">{openSection === 'mantra' ? '−' : '+'}</span>
          </button>
          {openSection === 'mantra' && (
            <div className="px-4 pb-5 border-t border-orange-50">
              <div className="mt-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 mb-4">
                <p className="text-center text-orange-900 font-serif text-sm leading-loose">
                  णमो अरिहंताणं · णमो सिद्धाणं<br />
                  णमो आयरियाणं · णमो उवज्झायाणं<br />
                  णमो लोए सव्व साहूणं<br />
                  <span className="text-xs text-orange-600 block mt-2">
                    एसो पंच नमुक्कारो · सव्व पावप्पणासणो<br />
                    मंगलाणं च सव्वेसिं · पढमं हवइ मंगलं
                  </span>
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed text-center italic">
                "This five-fold salutation destroys all sins and is the most auspicious of all auspicious things."
              </p>
            </div>
          )}
        </section>

        {/* ── Five Pads ── */}
        <section className="mb-6">
          <h2 className="text-base font-serif font-bold text-orange-900 mb-3 px-1">The Five Pads</h2>
          <div className="space-y-2.5">
            {pads.map((p) => (
              <div key={p.num} className={`bg-gradient-to-r ${p.color} rounded-xl p-4 border ${p.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full ${p.numBg} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                    {p.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif font-semibold text-gray-900">{p.sanskrit}</p>
                    <div className="flex gap-3 mt-0.5 mb-1">
                      <span className="text-xs text-orange-600">{p.script}</span>
                      <span className="text-xs text-orange-500 opacity-75">·</span>
                      <span className="text-xs text-orange-600 opacity-80">{p.gujarati}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.meaning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── App Features ── */}
        <section className="mb-6 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('features')}
            className="w-full flex items-center justify-between p-4"
          >
            <h2 className="text-base font-serif font-bold text-orange-900">✨ What's in the App</h2>
            <span className="text-orange-400 text-lg">{openSection === 'features' ? '−' : '+'}</span>
          </button>
          {openSection === 'features' && (
            <div className="px-4 pb-4 border-t border-orange-50">
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {features.map((f, i) => (
                  <div key={i} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <div className="text-xl mb-1">{f.icon}</div>
                    <h4 className="text-xs font-semibold text-orange-900 mb-0.5">{f.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Languages: English · हिन्दी · ગુજરાતી
              </p>
            </div>
          )}
        </section>

        {/* ── How to Practice ── */}
        <section className="mb-6 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('practice')}
            className="w-full flex items-center justify-between p-4"
          >
            <h2 className="text-base font-serif font-bold text-orange-900">🔔 How to Do Navkar Siddhi Tap</h2>
            <span className="text-orange-400 text-lg">{openSection === 'practice' ? '−' : '+'}</span>
          </button>
          {openSection === 'practice' && (
            <div className="px-4 pb-5 border-t border-orange-50">
              <p className="text-xs text-gray-500 mt-3 mb-3 leading-relaxed">
                Navkar Siddhi Tap is a structured tapas where you commit to a fixed number of Navkars
                daily for a set duration — cultivating discipline, devotion, and inner peace.
              </p>
              <div className="space-y-3">
                {steps.map(s => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{s.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── JainZBharat Community ── */}
        <section className="mb-6 bg-gradient-to-br from-orange-700 to-orange-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[80px] opacity-10 leading-none -mt-2 -mr-2 select-none">⚡</div>
          <div className="relative z-10">
            <h2 className="text-base font-bold tracking-wide mb-1">JainZBharat Community</h2>
            <p className="text-xs text-orange-200 mb-3 leading-relaxed">
              A tech-driven community where students and professionals co-create impactful digital projects
              rooted in Jain values. Open to all — irrespective of religion.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {whyJoin.slice(0, 4).map((w, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-2.5">
                  <div className="text-base mb-0.5">{w.icon}</div>
                  <h4 className="text-xs font-semibold text-white">{w.title}</h4>
                  <p className="text-xs text-orange-200 leading-relaxed line-clamp-2">{w.desc}</p>
                </div>
              ))}
            </div>
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
          </div>
        </section>

        {/* ── JainZBharat Vision ── */}
        <section className="mb-6 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl p-5 border border-orange-200">
          <h2 className="text-base font-serif font-bold text-orange-900 mb-0.5">JainZBharat</h2>
          <p className="text-xs text-orange-600 mb-3 font-medium">Founded by Saumya Jignesh Sanghvi</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            A youth-driven initiative to strengthen Jain identity in the modern era through disciplined
            action, ethical leadership, and cultural continuity. Built on a simple belief:{' '}
            <em>Modern life is fast. Jain Dharma is timeless.</em>
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            We encourage youth to move beyond passive digital identity and embrace value-driven living
            rooted in Ahiṃsā, Aparigraha, Anekāntavāda, Satya, and Tapasya.
          </p>
          <div className="bg-white/70 rounded-xl p-3 border border-orange-100">
            <p className="text-sm text-orange-800 font-medium leading-relaxed">
              Our vision: A generation of Jain youth who are calm decision-makers, ethically ambitious,
              culturally rooted, and nationally contributive.
            </p>
            <p className="text-xs text-orange-600 mt-1.5 font-semibold">
              JainZ is not a demographic label. It is a commitment to character.
            </p>
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <div className="text-center space-y-3 pb-4">
          <button
            onClick={() => setPage('jaap')}
            className="bg-orange-600 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-orange-700 transition-colors shadow-md"
          >
            🙏 Begin Jaap
          </button>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <button onClick={() => setPage('privacy')} className="hover:text-orange-600 hover:underline transition-colors">
              Privacy Policy
            </button>
            <span>·</span>
            <span>v{APP_VERSION}</span>
            <span>·</span>
            <span>Jai Jinendra 🙏</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
