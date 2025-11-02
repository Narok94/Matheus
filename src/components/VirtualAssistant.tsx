

const VirtualAssistantBackground = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 z-0">
        <defs>
            <radialGradient id="assistant-core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <filter id="assistant-glow-filter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
        </defs>

        {/* Background Grid */}
        <g opacity="0.1" stroke="#38bdf8">
            <path d="M 0 150 H 800 M 0 300 H 800 M 0 450 H 800" strokeWidth="0.5" />
            <path d="M 200 0 V 600 M 400 0 V 600 M 600 0 V 600" strokeWidth="0.5" />
        </g>

        {/* Central Core */}
        <g transform="translate(400, 300)">
            <circle r="120" fill="url(#assistant-core-glow)" />
            <circle r="70" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="10 5">
                 <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
            </circle>
            <circle r="85" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="2 8">
                <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="25s" repeatCount="indefinite" />
            </circle>
             <circle r="50" fill="#f1f5f9" filter="url(#assistant-glow-filter)" opacity="0.3"/>
             <circle r="48" fill="#0f172a"/>
             <circle r="50" fill="none" stroke="#f1f5f9" strokeWidth="1" />
        </g>

        {/* Orbiting Particles */}
        <g>
            <circle r="2" fill="#67e8f9">
                <animateMotion dur="8s" repeatCount="indefinite" path="M 250,300 A 150,150 0 1,1 550,300 A 150,150 0 1,1 250,300" />
            </circle>
            <circle r="1.5" fill="#38bdf8" opacity="0.8">
                 <animateMotion dur="12s" repeatCount="indefinite" path="M 400,100 A 200,200 0 1,1 400,500 A 200,200 0 1,1 400,100" />
            </circle>
        </g>
    </svg>
);

const VirtualAssistant = () => {
    return (
        <div className="relative w-full h-full min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-sans overflow-hidden">
            <VirtualAssistantBackground />
            <div className="z-10 text-center p-8 bg-black/30 backdrop-blur-sm rounded-lg">
                <h2 className="text-3xl font-bold text-cyan-300">Assistente Virtual</h2>
                <p className="text-slate-300 mt-2">Como posso ajudar hoje?</p>
                {/* Placeholder for future chat interface */}
            </div>
        </div>
    );
};

export default VirtualAssistant;
