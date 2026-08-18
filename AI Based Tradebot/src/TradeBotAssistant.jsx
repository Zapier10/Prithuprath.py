import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";


// --- ICONS (Inline SVGs for zero-dependency) ---
const MessageSquare = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const Send = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
);
const Loader2 = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
const Bot = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h20"/><path d="M8 14v4"/><path d="M16 14v4"/><path d="M10 21h4"/></svg>
);
const User = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const Globe = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);
const BarChartIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
);
const TrendingUp = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
const CalculatorIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
);
const CandlestickIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 4v16"/><path d="M7 4v16"/><rect width="4" height="8" x="5" y="8" rx="1"/><rect width="4" height="8" x="15" y="8" rx="1"/></svg>
);
const GridIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
);
const PieChartIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
);

// Configuration for Firebase and App ID
const appId = process.env.REACT_APP_APP_ID || "local-dev-app";
const firebaseConfig = {
  apiKey: "AIzaSyBBFBjqAUl_nP_-QH4J5xHzK4Vna3_GIow",
  authDomain: "tradebot-ai-3f905.firebaseapp.com",
  projectId: "tradebot-ai-3f905",
  storageBucket: "tradebot-ai-3f905.firebasestorage.app",
  messagingSenderId: "638112377286",
  appId: "1:638112377286:web:11e7a460bf8b7ff781eac7",
  measurementId: "G-2HX5NGHG1X"
};
const initialAuthToken = null;


const MAX_RETRIES = 5;

// --- Search Suggestions ---
const searchSuggestions = [
    "Compare MFN tariffs for electronics (HS 85) across US, EU, and China.",       // -> Bar Chart
    "Show the 5-year trend of import duties for agricultural products.",           // -> Line Chart
    "Show the market share distribution of electronics imported into the US.",     // -> Pie Chart
    "Display a compliance risk heatmap for exporting textiles to all regions.",   // -> Heatmap Chart
    "Analyze the price movement for key agricultural commodities over the last month.", // -> Candlestick Chart
];

// --- API Call ---
const chatgptApiCall = async (prompt) => {
    try {
        const response = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        const result = await response.json();

        // Gemini returns actual text in "result.text"
        if (result.text) {
            return { text: result.text, sources: [] };
        }

        // Sometimes Gemini returns inner object in candidates structure
        if (result.candidates &&
            result.candidates[0] &&
            result.candidates[0].content &&
            result.candidates[0].content.parts &&
            result.candidates[0].content.parts[0].text) {
            return { text: result.candidates[0].content.parts[0].text, sources: [] };
        }

        return { text: "⚠️ Gemini returned no usable text output.", sources: [] };

    } catch (error) {
        console.error("Frontend Gemini API error:", error);
        return { text: "❗ Error connecting to Gemini backend.", sources: [] };
    }
};


// --- CHART COMPONENTS ---

const BarChart = () => (
    <div className="flex flex-col h-full">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center"><BarChartIcon className="w-4 h-4 mr-2 text-blue-600"/> Applied Tariff Comparison</h4>
        {/* Changed space-x-2 to gap-1 and added w-1/5 to columns for responsiveness */}
        <div className="flex-1 flex items-end justify-around gap-1 px-2 pb-2 border-b border-l border-gray-300">
            {[
                { label: 'US', h: '40%', c: 'bg-blue-500', val: '4.2%' },
                { label: 'EU', h: '65%', c: 'bg-indigo-500', val: '6.5%' },
                { label: 'CN', h: '30%', c: 'bg-teal-500', val: '3.0%' },
                { label: 'IN', h: '80%', c: 'bg-rose-500', val: '10.0%' },
                { label: 'JP', h: '20%', c: 'bg-amber-500', val: '2.1%' }
            ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center w-1/5 group relative h-full justify-end">
                    <div className={`w-full rounded-t-md transition-all duration-700 ${bar.c} hover:opacity-80`} style={{ height: bar.h }}></div>
                    {/* Changed text-xs to text-[10px] for better fit */}
                    <span className="text-[10px] text-gray-600 mt-1 font-medium truncate">{bar.label}</span>
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                        {bar.label}: {bar.val}
                    </div>
                </div>
            ))}
        </div>
            <p className="text-xs text-gray-500 mt-2 text-center italic">Comparison of Most Favoured Nation (MFN) rates</p>
    </div>
);

const LineChart = () => (
    <div className="flex flex-col h-full">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-green-600"/> 5-Year Tariff Trend</h4>
        <div className="flex-1 relative border-b border-l border-gray-300 m-2">
            <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-gray-100"></div>)}
            </div>
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 250 120`}> 
                <polyline 
                    fill="none" 
                    stroke="#059669" 
                    strokeWidth="3" 
                    points="0,100 50,80 100,85 150,40 200,60 250,20" 
                    vectorEffect="non-scaling-stroke"
                />
                {[
                    {x:0, y:100, val:'2020'}, {x:50, y:80, val:'2021'}, {x:100, y:85, val:'2022'}, {x:150, y:40, val:'2023'}, {x:200, y:60, val:'2024'}, {x:250, y:20, val:'2025'}
                ].map((p, i) => (
                    <g key={i} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="4" className="fill-white stroke-green-600 stroke-2 group-hover:r-6 transition-all" />
                        <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] fill-gray-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{p.val}</text>
                    </g>
                ))}
            </svg>
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span>
            </div>
        </div>
        <p className="text-xs text-gray-500 mt-6 text-center italic">Historical trend analysis of duty rates</p>
    </div>
);

const CandlestickChart = () => {
    // Mock OHLC Data
    const data = [
        {o:50, h:70, l:40, c:60}, {o:60, h:65, l:55, c:58}, {o:58, h:80, l:50, c:75},
        {o:75, h:78, l:60, c:65}, {o:65, h:70, l:55, c:55}, {o:55, h:60, l:45, c:50},
        {o:50, h:55, l:48, c:52}, {o:52, h:65, l:50, c:62}
    ];
    const h = 140; // height of svg area
    return (
        <div className="flex flex-col h-full w-full">
            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center"><CandlestickIcon className="w-4 h-4 mr-2 text-teal-600"/> Commodity Price Range (OHLC)</h4>
            <div className="flex-1 w-full relative border-l border-b border-gray-200 bg-gray-50/30 p-2">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${data.length * 25} ${h}`}>
                    {data.map((d, i) => {
                        const x = i * 25 + 12;
                        const isUp = d.c > d.o;
                        const color = isUp ? '#10B981' : '#EF4444';
                        const scale = (v) => h - v * 1.5; 
                        return (
                            <g key={i}>
                                    <line x1={x} y1={scale(d.h)} x2={x} y2={scale(d.l)} stroke={color} strokeWidth="1.5" />
                                    <rect x={x - 4} y={isUp ? scale(d.c) : scale(d.o)} width="8" height={Math.abs(scale(d.o) - scale(d.c)) || 1} fill={color} />
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Wk 1</span><span>Wk 2</span><span>Wk 3</span><span>Wk 4</span>
                <span>Wk 5</span><span>Wk 6</span><span>Wk 7</span><span>Wk 8</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center italic">Open, High, Low, Close (OHLC) price analysis</p>
        </div>
    );
};

const HeatmapChart = () => {
    const rows = ['Tariff', 'Risk', 'Compliance'];
    const cols = ['NA', 'EU', 'APAC', 'LATAM'];
    const getData = () => Math.floor(Math.random() * 4); // 0-3 intensity
    const colors = ['bg-blue-50', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'];

    return (
        <div className="flex flex-col h-full w-full">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center"><GridIcon className="w-4 h-4 mr-2 text-indigo-600"/> Global Risk Matrix</h4>
                <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1"></div>
                    {cols.map(c => <div key={c} className="text-[10px] font-bold text-center text-gray-500">{c}</div>)}
                    
                    {rows.map(r => (
                        <React.Fragment key={r}>
                            <div className="col-span-1 text-[10px] font-bold text-gray-600 flex items-center">{r}</div>
                            {cols.map(c => {
                                const intensity = getData();
                                return (
                                    <div key={c+r} className={`h-8 rounded ${colors[intensity]} transition-all hover:opacity-80 cursor-pointer relative group`}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[9px] px-1 rounded">
                                            Lvl {intensity+1}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center italic">Intensity of trade barriers by region</p>
        </div>
    );
};

const PieChart = () => {
    const data = [
        { label: 'China', value: 45, color: '#3b82f6' }, // Blue
        { label: 'EU', value: 30, color: '#10b981' },    // Green
        { label: 'Mexico', value: 15, color: '#f59e0b' }, // Amber
        { label: 'Others', value: 10, color: '#9ca3af' }, // Gray
    ];

    let cumulativePercentage = 0;
    const segments = data.map(item => {
        const startAngle = cumulativePercentage;
        cumulativePercentage += item.value;
        const endAngle = cumulativePercentage;

        // Convert percentages to radians
        const startRad = 2 * Math.PI * startAngle / 100;
        const endRad = 2 * Math.PI * endRad / 100;

        // Calculate (x, y) coordinates for a radius of 45
        const startX = Math.cos(startRad) * 45;
        const startY = Math.sin(startRad) * 45;
        const endX = Math.cos(endRad) * 45;
        const endY = Math.sin(endRad) * 45;

        const largeArcFlag = item.value > 50 ? 1 : 0;

        // SVG path: Move to center (0,0), Line to start, Arc to end, Close path (back to center)
        const pathData = [
            `M 0 0`,
            `L ${startX.toFixed(2)} ${startY.toFixed(2)}`,
            `A 45 45 0 ${largeArcFlag} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`,
            `Z`
        ].join(' ');

        return { pathData, ...item };
    });

    return (
        <div className="flex flex-col h-full">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <PieChartIcon className="w-4 h-4 mr-2 text-blue-600"/> Import Source Distribution
            </h4>
            <div className="flex-1 flex flex-col sm:flex-row justify-center items-center p-4">
                <svg width="120" height="120" viewBox="-50 -50 100 100" className="flex-shrink-0 mb-4 sm:mb-0">
                    {segments.map((segment, i) => (
                        <path key={i} d={segment.pathData} fill={segment.color} className="transition-all duration-300 hover:opacity-90 hover:stroke-2 hover:stroke-white"/>
                    ))}
                </svg>
                <div className="ml-0 sm:ml-8 space-y-2">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2 shadow-sm" style={{ backgroundColor: item.color }}></span>
                            <span className="text-sm text-gray-700 font-medium">{item.label} <span className="text-xs text-gray-500">({item.value}%)</span></span>
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center italic">Breakdown of import shares by country of origin</p>
        </div>
    );
};

// --- UI Components ---
const ChatBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const baseClasses = "max-w-[85%] p-4 my-2 rounded-2xl transition-all duration-300";

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-2 ${isUser ? 'space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${isUser ? 'bg-blue-600' : 'bg-teal-500'}`}>
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`${baseClasses} 'bg-white text-gray-800 rounded-tl-md border border-gray-100 shadow-md'`}>
                    <div className={`${baseClasses} 'bg-white text-gray-800 rounded-tl-md border border-gray-100 shadow-md'`}>
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {message.text}
                            </ReactMarkdown>
                        </div>
                    </div>
                    {message.sources && message.sources.length > 0 && (
                        <div className={`mt-3 pt-3 border-t border-opacity-30 ${isUser ? 'border-white' : 'border-gray-300'}`}>
                            <h4 className={`text-xs font-semibold mb-1 flex items-center opacity-90 ${isUser ? 'text-white' : 'text-blue-600'}`}>
                                <Globe className="w-3 h-3 mr-1" /> Grounding Sources
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                {message.sources.slice(0, 3).map((source, index) => (
                                    <li key={index} className="truncate">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className={`${isUser ? 'text-blue-200 hover:text-white' : 'text-blue-700 hover:underline'}`}>
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- VISUALIZATION PANEL ---
const VisualizationPanel = ({ mode }) => {
    // Select Chart based on mode
    const renderChart = () => {
        switch(mode) {
            case 'line': return <LineChart />;
            case 'candlestick': return <CandlestickChart />;
            case 'heatmap': return <HeatmapChart />;
            case 'pie': return <PieChart />;
            case 'bar': 
            default: return <BarChart />;
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 h-72 transition-all duration-500 ease-in-out flex flex-col">
            {renderChart()}
        </div>
    );
};

// --- COST ESTIMATOR MODAL ---
const CostEstimatorModal = ({ isOpen, onClose }) => {
    const [fob, setFob] = useState('');
    const [freight, setFreight] = useState('');
    const [insurance, setInsurance] = useState('');
    const [dutyRate, setDutyRate] = useState('');
    const [vatRate, setVatRate] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        const f = parseFloat(fob) || 0;
        const fr = parseFloat(freight) || 0;
        const i = parseFloat(insurance) || 0;
        const d = parseFloat(dutyRate) || 0;
        const v = parseFloat(vatRate) || 0;

        const cif = f + fr + i;
        const dutyAmount = cif * (d / 100);
        const vatAmount = (cif + dutyAmount) * (v / 100);
        const total = cif + dutyAmount + vatAmount;

        setResult({ cif, dutyAmount, vatAmount, total });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-teal-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center">
                        <CalculatorIcon className="w-5 h-5 mr-2"/> Landed Cost Estimator
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Product (FOB)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input type="number" value={fob} onChange={e=>setFob(e.target.value)} className="w-full p-2 pl-6 border rounded bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Freight Cost</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input type="number" value={freight} onChange={e=>setFreight(e.target.value)} className="w-full p-2 pl-6 border rounded bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00"/>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Insurance</label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-gray-400">$</span>
                                <input type="number" value={insurance} onChange={e=>setInsurance(e.target.value)} className="w-full p-2 pl-5 border rounded bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Duty %</label>
                            <input type="number" value={dutyRate} onChange={e=>setDutyRate(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="5.0"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">VAT/Tax %</label>
                            <input type="number" value={vatRate} onChange={e=>setVatRate(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="20.0"/>
                        </div>
                    </div>

                    <button onClick={calculate} className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-lg transition-all transform active:scale-[0.98]">
                        Calculate Total Cost
                    </button>

                    {result && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>CIF Value:</span>
                                <span>${result.cif.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Duty:</span>
                                <span>${result.dutyAmount.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between text-sm text-gray-600">
                                <span>VAT/Taxes:</span>
                                <span>${result.vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-teal-700">
                                <span>Landed Cost:</span>
                                <span>${result.total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [chartMode, setChartMode] = useState('bar'); // 'bar' | 'line' | 'candlestick' | 'heatmap' | 'pie'
    const [showCostEstimator, setShowCostEstimator] = useState(false);

    const chatContainerRef = useRef(null);

    // --- Firebase Setup ---
    useEffect(() => {
        try {
            const firebaseApp = initializeApp(firebaseConfig);
            const dbInstance = getFirestore(firebaseApp);
            const authInstance = getAuth(firebaseApp);

            setDb(dbInstance);
            setAuth(authInstance);

            const signIn = async () => {
                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance);
                }
            };

            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                }
            });

            signIn();
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase Error:", error);
            setIsAuthReady(true);
        }
    }, []);

    // --- Chat History Sync ---
    useEffect(() => {
        if (db && userId && isAuthReady) {
            // Using the pattern /artifacts/{appId}/users/{userId}/{collectionName}/
            const chatDocRef = doc(db, 'artifacts', appId, 'users', userId, 'tariff_chats', 'main-chat');
            const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
                if (docSnap.exists() && Array.isArray(docSnap.data().history)) {
                    setChatHistory(docSnap.data().history);
                } else {
                    setChatHistory([{
                        role: 'ai',
                        text: "Welcome to TradeBot! I can assist you with real-time, grounded information on international tariffs, HS codes, and trade agreements. How can I help with your export plans today?",
                        sources: []
                    }]);
                }
            }, (error) => {
                console.error("Snapshot error:", error);
            });
            return () => unsubscribe();
        }
    }, [db, userId, isAuthReady]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSuggestionClick = (suggestion) => {
        setUserInput(suggestion);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !db || !userId) return;

        const text = userInput.trim().toLowerCase();
        // --- SMART VISUALIZATION SELECTION LOGIC ---
        if (text.includes('candlestick') || text.includes('price movement') || text.includes('ohlc')) {
            setChartMode('candlestick');
        } else if (text.includes('share') || text.includes('distribution') || text.includes('breakdown') || text.includes('pie') || text.includes('segmentation') || text.includes('market')) {
            setChartMode('pie');
        } else if (text.includes('risk') || text.includes('complex') || text.includes('heat') || text.includes('matrix') || text.includes('overview')) {
            setChartMode('heatmap');
        } else if (text.includes('trend') || text.includes('history') || text.includes('year') || text.includes('change') || text.includes('evolution') || text.includes('duty rates')) {
            setChartMode('line');
        } else if (text.includes('compare') || text.includes('mfn') || text.includes('tariff') || text.includes('across')) {
             setChartMode('bar');
        } else {
            // Default to Bar chart if no keyword matches
            setChartMode('bar');
        }

        const newUserMessage = { role: 'user', text: userInput.trim(), sources: [] };
        const newHistory = [...chatHistory, newUserMessage];
        
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        const chatDocRef = doc(db, 'artifacts', appId, 'users', userId, 'tariff_chats', 'main-chat');

        try {
            await setDoc(chatDocRef, { history: newHistory, lastUpdated: new Date() });
            const { text: aiResponseText, sources } = await chatgptApiCall(newUserMessage.text);
            const newAiMessage = { role: 'ai', text: aiResponseText, sources };
            const updatedHistory = [...newHistory, newAiMessage];
            await setDoc(chatDocRef, { history: updatedHistory, lastUpdated: new Date() });
        } catch (error) {
            console.error("Error:", error);
            const errorHistory = [...newHistory, { role: 'ai', text: 'TradeBot: An error occurred. Please try again.', sources: [] }];
            await setDoc(chatDocRef, { history: errorHistory, lastUpdated: new Date() });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                <span className="ml-3 text-lg font-medium text-gray-700">Loading TradeBot...</span>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col font-sans p-2 sm:p-4 md:p-6 antialiased overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-xl shadow-blue-200/50 mb-4 sticky top-0 z-10 border-b border-blue-100 shrink-0">
                <div className="flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-teal-600" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Trade<span className="text-teal-600">Bot</span></h1>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <User className="w-4 h-4 mr-1 text-blue-500"/>
                    <span className="font-mono text-gray-600 truncate max-w-[100px] sm:max-w-[150px]">ID: {userId}</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Chat Window */}
                <div className="flex-1 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden h-full">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                        {chatHistory.map((message, index) => (
                            <ChatBubble key={index} message={message} />
                        ))}
                        {isLoading && (
                             <div className="flex justify-start">
                                <div className="max-w-[85%] p-3 my-2 rounded-2xl bg-white text-gray-800 rounded-tl-md border border-gray-100 shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        <span className='ml-2 text-sm italic text-gray-500'>TradeBot is analyzing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Suggested Queries:</h4>
                            <div className="flex flex-wrap gap-2">
                                {searchSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 hover:border-blue-300 transition duration-150 ease-in-out shadow-sm disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSendMessage}>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={isLoading}
                                    placeholder="E.g., Tariff for HS 8517 in India?"
                                    className="w-full pr-14 p-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition duration-200 ease-in-out disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!userInput.trim() || isLoading}
                                    className="absolute right-0 mr-1 p-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full hover:from-teal-600 hover:to-blue-600 transition duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-300/50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Visualization Sidebar */}
                <div className="lg:w-1/3 bg-white rounded-2xl shadow-xl p-6 flex flex-col space-y-6 border border-blue-200/50 h-full overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center border-b-2 border-teal-500 pb-3">
                        <Globe className="w-6 h-6 mr-2 text-teal-600" />
                        Trade Visualization & Tools
                    </h2>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-100 p-1 shadow-inner">
                         {/* Dynamic Chart Panel */}
                         <VisualizationPanel mode={chartMode} />
                    </div>

                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-green-600"/> Cost Estimator</h3>
                        <p className="text-sm text-gray-500">
                            Unlock advanced features to calculate landed costs including freight, insurance, and duties for specific HS codes.
                        </p>
                         <button 
                            onClick={() => setShowCostEstimator(true)}
                            className="w-full mt-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition duration-150 shadow-sm"
                        >
                            Launch Calculator
                        </button>
                    </div>
                </div>
            </main>
            <CostEstimatorModal isOpen={showCostEstimator} onClose={() => setShowCostEstimator(false)} />
            <style>
                {`
                body { font-family: 'Inter', sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #6ee7b7; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background-color: #f0fdfa; }
                `}
            </style>
        </div>
    );
}