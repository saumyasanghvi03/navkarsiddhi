import React, { useState } from 'react';

const TRACKS = [
    { id: 'bhaktamar', title: 'Bhaktamar Stotra', duration: '45:00', youtubeId: 's3lUO_2EyRE' }, // T-Series Anuradha Paudwal
    { id: 'uvasaggaharam', title: 'Uvasaggaharam Stotra', duration: '9:00', youtubeId: 'zGXbXPYllD4' }, // 27 Times Recitation
    { id: 'chintamani', title: 'Chintamani Mari Chinta Chur', duration: '6:30', youtubeId: '4dzFnICSvNM' }, // Requested Song
    { id: 'ratnakar', title: 'Ratnakar Pachchishi', duration: '12:00', youtubeId: 'rq1A1SCuO8o' },
    { id: 'navkar-video-1', title: 'Navkar Mantra Video 1', youtubeId: 'w_eRz9reYV4' },
    { id: 'navkar-video-2', title: 'Navkar Mantra Video 2', youtubeId: 'bMnWd0W9j1c' },
    { id: 'navkar-video-3', title: 'Navkar Mantra Video 3', youtubeId: '8XWt06K5H9A' },
    { id: 'navkar-video-4', title: 'Navkar Mantra Video 4', youtubeId: '96G-NHZ-HCI' },
    { id: 'navkar-video-5', title: 'Navkar Mantra Video 5', youtubeId: 'T-wnQjyVnpc' }
];

const BhaktiModal = ({ onClose }) => {
    const [activeTrackId, setActiveTrackId] = useState(null);

    const toggleTrack = (id) => {
        if (activeTrackId === id) {
            setActiveTrackId(null);
        } else {
            setActiveTrackId(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#FDFBF7] w-full max-w-lg mx-4 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20 max-h-[80vh] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 flex items-center justify-between text-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🙏</span>
                        <h2 className="text-xl font-serif font-bold tracking-wide">Bhakti Mode</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4 overflow-y-auto">
                    <p className="text-sm text-gray-500 italic text-center mb-2">
                        Immerse yourself in devotional stotras.
                    </p>

                    <div className="flex flex-col gap-4">
                        {TRACKS.map(track => {
                            const isActive = activeTrackId === track.id;
                            return (
                                <div key={track.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isActive ? 'bg-amber-50 border-amber-500/50 shadow-md ring-1 ring-amber-500/20' : 'bg-white border-gray-100'
                                    }`}>
                                    <button
                                        onClick={() => toggleTrack(track.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-amber-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                                {isActive ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-semibold ${isActive ? 'text-amber-900' : 'text-gray-700'}`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-xs text-gray-400">{track.duration}</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Embedded Video */}
                                    {isActive && (
                                        <div className="aspect-video w-full bg-black">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1`}
                                                title={track.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer info or decorative */}
                <div className="p-4 bg-amber-50/50 text-center text-[10px] text-amber-800/40 uppercase tracking-widest border-t border-amber-100">
                    Pure • Sattvic • Devotional
                </div>

            </div>
        </div>
    );
};

export default BhaktiModal;
