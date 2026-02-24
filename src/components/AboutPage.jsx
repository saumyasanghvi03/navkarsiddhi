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
        <div className="text-center">
          <button
            onClick={() => setPage('jaap')}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors shadow-md"
          >
            Begin Jaap
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
