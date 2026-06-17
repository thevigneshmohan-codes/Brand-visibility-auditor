import { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Award, 
  Sparkles, 
  Users, 
  TrendingUp, 
  X, 
  ChevronRight, 
  Check, 
  Loader2, 
  Activity, 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ThumbsUp, 
  Gauge,
  HelpCircle,
  Building,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditReport, Persona, PromptAuditResult, ScoreLevel } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'personas' | 'audits' | 'eeat'>('overview');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Suggested URLs for quick play
  const QUICK_SUGGESTIONS = [
    { name: 'Stripe', url: 'stripe.com', desc: 'Online payment processing for internet businesses.' },
    { name: 'Figma', url: 'figma.com', desc: 'Collaborative web application for interface design.' },
    { name: 'Notion', url: 'notion.so', desc: 'Connected workspace for wiki, docs, and project management.' },
    { name: 'Shopify', url: 'shopify.com', desc: 'Global commerce platform for retail store infrastructures.' }
  ];

  // Loader dynamic phrases to engage users
  const LOADER_STEPS = [
    'Initializing Audit & Parsing Website URL...',
    'Scraping target domain content & bypassing headers...',
    'Extracting Business Offerings & formulating core Ideal Customer Profiles (ICP)...',
    'Synthesizing 1-to-1 Customer Personas matching target segment pain points...',
    'Generating SEO Long-Tail Search queries from Personas...',
    'Invoking server-side Google Grounded Gemini SGE engine...',
    'Simulating ChatGPT web-browsing Bing search response patterns...',
    'Analyzing brand mentions, citations placement, and calculating index score...'
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      const incrementStep = () => {
        setLoadingStep(prev => {
          if (prev < LOADER_STEPS.length - 1) {
            timer = setTimeout(incrementStep, 2500 + Math.random() * 1500);
            return prev + 1;
          }
          return prev;
        });
      };
      timer = setTimeout(incrementStep, 2500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleGenerateReport = async (targetUrl: string, descriptionOverride?: string) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: targetUrl,
          manualDescription: descriptionOverride || manualDescription
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error generating search auditing report.');
      }

      setReport(data);
      if (data.personas && data.personas.length > 0) {
        setSelectedPersonaId(data.personas[0].id);
      }
      setActiveTab('overview');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please check your URL and network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (sug: typeof QUICK_SUGGESTIONS[0]) => {
    setUrl(sug.url);
    setManualDescription(sug.desc);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => {
      setCopiedTextId(null);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getLevelBadge = (level: ScoreLevel) => {
    switch (level) {
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">HIGH (100 pts)</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">MEDIUM (50 pts)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-505 border border-slate-200">NONE (0 pts)</span>;
    }
  };

  // Get index metrics
  const activeAudit = report?.audits.find(a => a.personaId === selectedPersonaId);
  const activePersona = report?.personas.find(p => p.id === selectedPersonaId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Header */}
      <header id="app-header" className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10">
              <Activity className="w-5 h-5" id="brand-logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display text-slate-900">
                Brand Visibility Auditor
              </h1>
              <p className="text-xs text-slate-500 font-medium">Search Generative Experience (SGE) Share of Voice Audit</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 transition flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Scoring Logic</span>
            </button>
            {report && (
              <button
                onClick={() => {
                  setReport(null);
                  setUrl('');
                  setManualDescription('');
                }}
                className="flex items-center space-x-1 px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Audit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: WELCOME / CONFIGURATION */}
          {!loading && !report && (
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto mt-6"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-time AI Search Penetration Auditor</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display sm:text-5xl">
                  Measure your search visibility across <span className="text-indigo-600">ChatGPT</span> &amp; <span className="text-indigo-600">Gemini</span> SGE
                </h2>
                <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
                  Paste your landing page URL. Our pipeline scrapes your offerings, maps out optimal ICP personas, prompts top LLM engines simultaneously, and calculates an actionable visibility rating.
                </p>
              </div>

              {/* Form Input Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-hidden">
                <div className="space-y-5">
                  
                  {/* Web URL Field */}
                  <div>
                    <label htmlFor="url-input" className="block text-sm font-semibold text-slate-800 mb-2 flex items-center space-x-1.5">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>Website URL</span>
                    </label>
                    <div className="relative">
                      <input
                        id="url-input"
                        type="text"
                        placeholder="e.g. stripe.com or https://company.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full pl-4 pr-12 py-3.5 bg-slate-5 w border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium transition"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    id="submit-generate-button"
                    onClick={() => handleGenerateReport(url)}
                    disabled={!url.trim()}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition duration-150 text-sm animate-pulse-slow"
                  >
                    <span>Analyze Website Search Visibility</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>

                {error && (
                  <div className="mt-5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Audit Failure</p>
                      <p className="text-xs mt-1 text-rose-600/90 leading-relaxed font-semibold">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="mt-8 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Or click to run a fast demo</span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {QUICK_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.name}
                      onClick={() => {
                        selectSuggestion(sug);
                        handleGenerateReport(sug.url, sug.desc);
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-slate-800 hover:bg-slate-50 transition cursor-pointer text-center duration-150"
                    >
                      <span className="font-semibold text-sm text-indigo-600 flex items-center space-x-1 font-display">
                        <span>{sug.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="text-[10px] text-slate-400 text-center font-medium mt-1 inline-block truncate w-full">{sug.url}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Info Logic */}
              <div className="mt-14 border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex space-x-3">
                  <div className="text-indigo-600 p-1 rounded-lg bg-indigo-50 h-fit mt-0.5"><Users className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950 font-display">1. ICP Synthesis</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">Extracts target groups, business tags, and shapes three precise client profiles.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="text-indigo-600 p-1 rounded-lg bg-indigo-50 h-fit mt-0.5"><Search className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950 font-display">2. Querying prompts</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">Runs authentic long-tail search conversational queries representing your buyers.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="text-indigo-600 p-1 rounded-lg bg-indigo-50 h-fit mt-0.5"><Award className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950 font-display">3. Multi-Engine score</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">Scans citations lists and text positioning to mathematically determine your Share-of-Voice index.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: LOADING COMPILING */}
          {loading && (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto py-16 text-center"
            >
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse-slow"></div>
                <div className="p-5 bg-white border border-slate-200 shadow-indigo-100/10 shadow-2xl rounded-2xl relative">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Compiling Visibility Audit</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                Our analytical engine is crawling, parsing, and running the simulated searches. Please keep this panel open...
              </p>

              {/* Progress Step Box */}
              <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-6 text-left shadow-sm">
                <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase block mb-3">Live Processing Log</span>
                <div className="space-y-4">
                  {LOADER_STEPS.map((step, idx) => {
                    const isPassed = loadingStep > idx;
                    const isCurrent = loadingStep === idx;
                    return (
                      <div key={idx} className="flex items-center space-x-3 transition">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition border ${
                          isPassed ? 'bg-indigo-600 border-indigo-600 text-white' : 
                          isCurrent ? 'bg-indigo-50 text-indigo-600 border-indigo-300' : 
                          'bg-slate-50 text-slate-300 border-slate-100'
                        }`}>
                          {isPassed ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span className="text-[9px] font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${
                          isCurrent ? 'text-indigo-650 font-bold' : 
                          isPassed ? 'text-slate-600' : 
                          'text-slate-400 font-medium'
                        }`}>
                          {step}
                          {isCurrent && <span className="inline-block animate-bounce ml-1">...</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 3: REPORT DASHBOARD */}
          {!loading && report && (
            <motion.div
              key="report-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Overview Summary Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-indigo-600 font-bold uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Audit for {report.targetUrl}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 mt-1 flex items-center space-x-3">
                    <span>{report.brandName}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-mono border border-slate-200/60 uppercase">
                      {report.extractedCategory}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-550 mt-1 flex items-center space-x-2 font-mono">
                    <span>Audited on {new Date(report.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-indigo-650 font-semibold">{report.audits.length} prompts simulated</span>
                  </p>
                </div>

                {/* Combined Overall visibility rating */}
                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-150 inline-flex w-full md:w-auto">
                  <div className="relative flex items-center justify-center shrink-0">
                    {/* Circle Rating */}
                    <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center relative">
                      <div className={`absolute inset-0 rounded-full border-4 ${getScoreBg(report.overallVisibilityScore)} opacity-10 animate-ping`}></div>
                      <span className="text-lg font-black tracking-tight text-slate-950 font-display">
                        {report.overallVisibilityScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Visibility Index</span>
                    <h3 className="text-md font-bold text-slate-900 leading-tight">
                      {report.overallVisibilityScore >= 80 ? '🔒 Unbeatable' : report.overallVisibilityScore >= 50 ? '📈 Prominent' : '⚠️ Search Invisible'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-semibold max-w-xs">
                      Aggregate average index rating based on placements and citations counts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub Navigation Bar */}
              <div className="border-b border-slate-200 flex items-center space-x-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 text-sm font-semibold relative transition ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('personas')}
                  className={`pb-3 text-sm font-semibold relative transition ${activeTab === 'personas' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Audited ICP Personas
                </button>
                <button
                  onClick={() => setActiveTab('audits')}
                  className={`pb-3 text-sm font-semibold relative transition ${activeTab === 'audits' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  SGE Query Playground
                </button>
                <button
                  onClick={() => setActiveTab('eeat')}
                  className={`pb-3 text-sm font-semibold relative transition ${activeTab === 'eeat' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  EEAT Remediation
                </button>
              </div>

              {/* CORE VIEW 1: OVERVIEW & PROFILER */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left stats: Split comparison */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Visual bar split engine */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-3 block">
                        Engine Performance Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                        
                        {/* Gemini SGE Visibility Card */}
                        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 relative">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 block">Google Search (Gemini SGE)</span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-3xl font-black text-slate-900 tracking-tight font-display">{report.geminiVisibilityScore}%</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md uppercase ${getScoreColor(report.geminiVisibilityScore)}`}>
                              {report.geminiVisibilityScore >= 80 ? 'Excellent' : report.geminiVisibilityScore >= 50 ? 'Moderate' : 'Critical'}
                            </span>
                          </div>
                          
                          {/* SGE rating Bar */}
                          <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full bg-indigo-600 transition-all duration-1000`} style={{ width: `${report.geminiVisibilityScore}%` }}></div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-3 font-medium">
                            How often Gemini lists your products and embeds website citations in AI snippets.
                          </p>
                        </div>

                        {/* ChatGPT Search Visibility Card */}
                        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 relative">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 block">OpenAI Search (ChatGPT GPTs)</span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-3xl font-black text-slate-900 tracking-tight font-display">{report.chatgptVisibilityScore}%</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md uppercase ${getScoreColor(report.chatgptVisibilityScore)}`}>
                              {report.chatgptVisibilityScore >= 80 ? 'Excellent' : report.chatgptVisibilityScore >= 50 ? 'Moderate' : 'Critical'}
                            </span>
                          </div>
                          
                          {/* GPT Rating bar */}
                          <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full bg-emerald-500 transition-all duration-1000`} style={{ width: `${report.chatgptVisibilityScore}%` }}></div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-3 font-medium">
                            Calculates search coverage index for conversational prompts sent directly to ChatGPT.
                          </p>
                        </div>

                      </div>

                      {/* Side-by-side points table */}
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Individual Audit Metrics</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                              <tr className="border-b border-slate-150 text-slate-900 font-bold bg-slate-50 px-2">
                                <th className="p-2.5 font-display rounded-l-lg">Audited Prompts / Personas</th>
                                <th className="p-2.5 font-display text-center">Gemini Mention</th>
                                <th className="p-2.5 font-display text-center">Gemini Citation</th>
                                <th className="p-2.5 font-display text-center">ChatGPT Mention</th>
                                <th className="p-2.5 font-display text-center rounded-r-lg">ChatGPT Citation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.audits.map((aud, index) => {
                                return (
                                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="p-2.5 max-w-[200px] font-semibold text-slate-800">
                                      <p className="truncate font-display text-sm">{aud.personaName}</p>
                                      <p className="truncate text-[10px] text-slate-400 font-mono italic">"{aud.prompt}"</p>
                                    </td>
                                    <td className="p-2.5 text-center font-bold">
                                      <span className={`${aud.gemini.mentionScore === 'HIGH' ? 'text-emerald-600' : aud.gemini.mentionScore === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400'}`}>
                                        {aud.gemini.mentionScore}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center font-bold">
                                      <span className={`${aud.gemini.citationScore === 'HIGH' ? 'text-emerald-600' : aud.gemini.citationScore === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400'}`}>
                                        {aud.gemini.citationScore}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center font-bold">
                                      <span className={`${aud.chatgpt.mentionScore === 'HIGH' ? 'text-emerald-600' : aud.chatgpt.mentionScore === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400'}`}>
                                        {aud.chatgpt.mentionScore}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center font-bold">
                                      <span className={`${aud.chatgpt.citationScore === 'HIGH' ? 'text-emerald-600' : aud.chatgpt.citationScore === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400'}`}>
                                        {aud.chatgpt.citationScore}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Product Profile Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                        <Building className="w-4.5 h-4.5" />
                        <h3 className="text-base font-bold font-display text-slate-900">
                          Extracted Business Segment Profile
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        This reflects how search scrapers index your landing page structure. Check if the offerings and ICP align with your roadmap.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block mb-2">Ideal Customer Profile (ICP)</span>
                          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                              {report.extractedICP}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block mb-2">Core Product/Service Offerings</span>
                          <div className="space-y-2">
                            {report.extractedOfferings.map((off, ind) => (
                              <div key={ind} className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-150 rounded-lg text-xs font-semibold text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span>{off}</span>
                              </div>
                            ))}
                            {report.extractedOfferings.length === 0 && (
                              <p className="text-xs text-slate-400 italic">No explicit offerings extracted. Check website URL.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Recommendations */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-3 block">
                        Actionables
                      </h3>
                      <div className="space-y-4 mt-4">
                        {report.overallVisibilityScore >= 75 ? (
                          <>
                            <div className="flex items-start space-x-3 text-xs leading-relaxed">
                              <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">Capitalize on High Domain Authority</h4>
                                <p className="text-slate-500 mt-0.5 font-semibold">Keep schema markups detailed. Both LLMs cite your domain index prominently. Expand into more long-tail queries.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 text-xs leading-relaxed">
                              <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">Niche Question optimization</h4>
                                <p className="text-slate-500 mt-0.5 font-semibold">Produce content addressing localized pain points of the personas to capture 100% citation share-of-voice.</p>
                              </div>
                            </div>
                          </>
                        ) : report.overallVisibilityScore >= 45 ? (
                          <>
                            <div className="flex items-start space-x-3 text-xs leading-relaxed">
                              <div className="p-1 rounded-full bg-amber-50 text-amber-600 mt-0.5 shrink-0">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">Fix Secondary Citations gap</h4>
                                <p className="text-slate-500 mt-0.5 font-semibold">You are mentioned in comparisons, but competitors get primary citation link positions. Target competitor keywords explicitly.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 text-xs leading-relaxed">
                              <div className="p-1 rounded-full bg-amber-50 text-amber-600 mt-0.5 shrink-0">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">Implement Structured JSON-LD</h4>
                                <p className="text-slate-500 mt-0.5 font-semibold">Make sure your product features, pricing, and ICP definitions are specified clearly in your HTML head block so web crawlers map them cleanly.</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start space-x-3 text-xs leading-relaxed">
                              <div className="p-1 rounded-full bg-rose-50 text-rose-500 mt-0.5 shrink-0">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">Severe SGE Blackhole Warning</h4>
                                <p className="text-slate-500 mt-0.5 font-semibold">Your brand and website domain are ignored by LLM searches for normal category queries. Introduce blog posts targeting conversational phrases immediately.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 text-xs leading-relaxed">
                              <div className="p-1 rounded-full bg-rose-50 text-rose-500 mt-0.5 shrink-0">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">Clarify Service Offerings</h4>
                                <p className="text-slate-500 mt-0.5 font-semibold">Your landing page needs clear, contextual text blocks detailing what product or software solutions you offer. If scrapers can't understand your business, LLMs won't cite you.</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 opacity-10 bg-white/20 w-32 h-32 rounded-full blur-xl"></div>
                      <h4 className="text-sm font-extrabold tracking-widest text-indigo-400 uppercase">Share of Voice Index</h4>
                      <p className="text-xs text-slate-350 leading-relaxed mt-2 font-medium">
                        Increasing visibility indices from <strong>45% → 85%</strong> typically correlates with a <strong>3.2x increase</strong> in high-intent inbound pipeline leads.
                      </p>
                      
                      <button
                        onClick={() => setActiveTab('audits')}
                        className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-300 hover:text-white transition group"
                      >
                        <span>Open Query Playground</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* CORE VIEW 2: PERSONAS */}
              {activeTab === 'personas' && (
                <div className="space-y-6">
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-bold font-display text-slate-950">Synthesized ICP Persona Types</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                      Based on your business offerings and scraper indices, these segment types represent your optimal target audience profiles performing conversational SGE/ChatGPT lookups.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {report.personas.map((per, idx) => {
                      return (
                        <div key={per.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                          {idx === 0 && <span className="absolute top-0 right-0 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-bl-xl text-[10px] font-bold border-l border-b border-indigo-100">Primary ICP</span>}
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                                {per.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 font-display text-sm leading-tight">{per.name}</h4>
                                <span className="text-[11px] font-bold text-slate-500 block truncate">{per.title}</span>
                              </div>
                            </div>

                            <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md inline-block mb-3.5">
                              {per.segment}
                            </span>

                            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                              <div>
                                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Pain Point</span>
                                <p className="text-slate-700 font-medium leading-relaxed mt-0.5">{per.painPoint}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Buyer Goal</span>
                                <p className="text-slate-700 font-medium leading-relaxed mt-0.5">{per.goal}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block mb-1">conversational Search Query</span>
                            <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl font-mono text-[11px] text-slate-700 relative italic leading-relaxed font-semibold">
                              "{per.prompt}"
                            </div>
                            
                            <button
                              onClick={() => {
                                setSelectedPersonaId(per.id);
                                setActiveTab('audits');
                              }}
                              className="mt-4 flex items-center justify-center space-x-1 w-full py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-xl hover:bg-indigo-100 transition"
                            >
                              <span>Audit Queries</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CORE VIEW 3: PLAYGROUND AUDITS */}
              {activeTab === 'audits' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* Left Column: Select Persona Prompt */}
                  <div className="lg:col-span-1 space-y-4">
                    <span className="text-xs font-extrabold text-slate-400 tracking-widest uppercase block mb-1">Select Persona Type</span>
                    <div className="space-y-3">
                      {report.personas.map((per) => {
                        const isSelected = per.id === selectedPersonaId;
                        return (
                          <button
                            key={per.id}
                            onClick={() => setSelectedPersonaId(per.id)}
                            className={`w-full text-left p-4 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div>
                              <div className="flex items-center space-x-2.5">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white text-indigo-700':'bg-slate-100 text-slate-600'}`}>
                                  {per.name.split(' ').map(n=>n[0]).join('')}
                                </div>
                                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'} font-display`}>{per.name}</h4>
                              </div>
                              <p className={`text-[10px] mt-1 truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'} font-bold`}>{per.title}</p>
                            </div>
                            <p className={`text-[10px] font-mono italic mt-3 border-t pt-2 max-h-12 overflow-hidden truncate ${isSelected ? 'border-white/10 text-indigo-150' : 'border-slate-100 text-slate-500'}`}>
                              "{per.prompt}"
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Comparative Grid */}
                  <div className="lg:col-span-3 space-y-6">
                    {activeAudit && activePersona ? (
                      <div>
                        
                        {/* Selected info header */}
                        <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block">Active Long-Tail Query</span>
                            <p className="mt-1 text-md font-bold text-indigo-700 italic font-mono leading-snug">
                              "{activeAudit.prompt}"
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block font-semibold">
                              Synthesized for: <strong>{activePersona.name} ({activePersona.title})</strong>
                            </span>
                          </div>
                        </div>

                        {/* Side by side comparative layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          
                          {/* GEMINI COLUMN */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                              
                              {/* Engine Tab Header */}
                              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                <span className="font-bold text-sm text-indigo-600 block font-display">Google Search (Gemini SGE)</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded-md font-extrabold uppercase text-slate-500 border border-slate-200">Grounded SGE</span>
                              </div>

                              {/* Visibility Metrics */}
                              <div className="space-y-3 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <div>
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span>Brand Mention Index:</span>
                                    {getLevelBadge(activeAudit.gemini.mentionScore)}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-semibold">
                                    {activeAudit.gemini.mentionPlacementReason}
                                  </p>
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span>Website Citation Rating:</span>
                                    {getLevelBadge(activeAudit.gemini.citationScore)}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-semibold">
                                    {activeAudit.gemini.citationPlacementReason}
                                  </p>
                                </div>
                              </div>

                              {/* Simulated Text Response */}
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Simulated Answer Text</span>
                                <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl max-h-[220px] overflow-y-auto text-xs text-slate-700 leading-relaxed font-semibold font-sans space-y-2">
                                  {activeAudit.gemini.answerText.split('\n').map((para, pIdx) => {
                                    if (para.trim().startsWith('*') || para.trim().startsWith('-')) {
                                      return <li key={pIdx} className="ml-3 italic">{para.replace(/^[\s*-]+/, '')}</li>;
                                    }
                                    return <p key={pIdx}>{para}</p>;
                                  })}
                                </div>
                              </div>

                            </div>

                            {/* Citations list footer */}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Sources &amp; Citations</span>
                              <div className="space-y-1.5">
                                {activeAudit.gemini.citations && activeAudit.gemini.citations.length > 0 ? (
                                  activeAudit.gemini.citations.map((cit, cid) => (
                                    <div key={cid} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-150 hover:border-slate-300 transition text-slate-700 text-xs font-semibold">
                                      <span className="truncate max-w-[170px] font-medium">{cit.title}</span>
                                      <a
                                        href={cit.url.startsWith('http') ? cit.url : `https://${cit.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        referrerPolicy="no-referrer"
                                        className="text-indigo-600 hover:text-indigo-800 font-mono text-[10px] flex items-center space-x-0.5 underline shrink-0 cursor-pointer"
                                      >
                                        <span className="truncate max-w-[110px]">{cit.url.replace('https://', '')}</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic">No citations reported by Gemini.</p>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* CHATGPT COLUMN */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                              
                              {/* Engine Tab Header */}
                              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                <span className="font-bold text-sm text-emerald-600 block font-display">OpenAI Search (ChatGPT GPTs)</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded-md font-extrabold uppercase text-slate-500 border border-slate-200">GPT Search</span>
                              </div>

                              {/* Visibility Metrics */}
                              <div className="space-y-3 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <div>
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span>Brand Mention Index:</span>
                                    {getLevelBadge(activeAudit.chatgpt.mentionScore)}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-semibold">
                                    {activeAudit.chatgpt.mentionPlacementReason}
                                  </p>
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span>Website Citation Rating:</span>
                                    {getLevelBadge(activeAudit.chatgpt.citationScore)}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-semibold">
                                    {activeAudit.chatgpt.citationPlacementReason}
                                  </p>
                                </div>
                              </div>

                              {/* Simulated Text Response */}
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Simulated Answer Text</span>
                                <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl max-h-[220px] overflow-y-auto text-xs text-slate-700 leading-relaxed font-semibold font-sans space-y-2">
                                  {activeAudit.chatgpt.answerText.split('\n').map((para, pIdx) => {
                                    if (para.trim().startsWith('*') || para.trim().startsWith('-')) {
                                      return <li key={pIdx} className="ml-3 italic">{para.replace(/^[\s*-]+/, '')}</li>;
                                    }
                                    return <p key={pIdx}>{para}</p>;
                                  })}
                                </div>
                              </div>

                            </div>

                            {/* Citations list footer */}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Sources &amp; Citations</span>
                              <div className="space-y-1.5">
                                {activeAudit.chatgpt.citations && activeAudit.chatgpt.citations.length > 0 ? (
                                  activeAudit.chatgpt.citations.map((cit, cid) => (
                                    <div key={cid} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-150 hover:border-slate-300 transition text-slate-700 text-xs font-semibold">
                                      <span className="truncate max-w-[170px] font-medium">{cit.title}</span>
                                      <a
                                        href={cit.url.startsWith('http') ? cit.url : `https://${cit.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-600 hover:text-emerald-800 font-mono text-[10px] flex items-center space-x-0.5 underline shrink-0 cursor-pointer"
                                      >
                                        <span className="truncate max-w-[110px]">{cit.url.replace('https://', '')}</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic">No citations reported by ChatGPT.</p>
                                )}
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    ) : (
                      <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm font-semibold">Please select a search persona to inspect deep comparative logs.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* CORE VIEW 4: EEAT REMEDIATION CONTENT GENERATOR */}
              {activeTab === 'eeat' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* Left Column: Select Persona Type */}
                  <div className="lg:col-span-1 space-y-4">
                    <span className="text-xs font-extrabold text-slate-400 tracking-widest uppercase block mb-1">Select Persona Type</span>
                    <div className="space-y-3">
                      {report.personas.map((per) => {
                        const isSelected = per.id === selectedPersonaId;
                        return (
                          <button
                            key={per.id}
                            onClick={() => setSelectedPersonaId(per.id)}
                            className={`w-full text-left p-4 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div>
                              <div className="flex items-center space-x-2.5">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white text-indigo-700':'bg-slate-100 text-slate-600'}`}>
                                  {per.name.split(' ').map(n=>n[0]).join('')}
                                </div>
                                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'} font-display`}>{per.name}</h4>
                              </div>
                              <p className={`text-[10px] mt-1 truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'} font-bold`}>{per.title}</p>
                            </div>
                            <p className={`text-[10px] font-mono italic mt-3 border-t pt-2 max-h-12 overflow-hidden truncate ${isSelected ? 'border-white/10 text-indigo-150' : 'border-slate-100 text-slate-500'}`}>
                              "{per.prompt}"
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: EEAT Content generator */}
                  <div className="lg:col-span-3 space-y-6">
                    {activeAudit && activePersona ? (
                      activeAudit.eeatContent ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden space-y-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div>
                              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 border border-emerald-500/10 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                <Award className="w-3.5 h-3.5" />
                                <span>Google E-E-A-T Content Blueprint</span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 font-display">
                                Search Visibility Remediation Guide
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">
                                Remedial strategies and pre-written copy using Experience, Expertise, Authoritativeness, and Trustworthiness guidelines to secure LLM mentions.
                              </p>
                            </div>
                            
                            <div className="px-3.5 py-1.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span className="text-[11px] font-bold text-amber-700 font-mono">EEAT Content Active</span>
                            </div>
                          </div>

                          {/* Strategy details breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Experience */}
                            <div className="p-4 rounded-xl border border-amber-100 bg-amber-500/[0.02]">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs font-mono">E</span>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display">Experience</h4>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                {activeAudit.eeatContent.experienceSection}
                              </p>
                            </div>

                            {/* Expertise */}
                            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-500/[0.02]">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold text-xs font-mono">E</span>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display">Expertise</h4>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                {activeAudit.eeatContent.expertiseSection}
                              </p>
                            </div>

                            {/* Authoritativeness */}
                            <div className="p-4 rounded-xl border border-teal-100 bg-teal-500/[0.02]">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-xs font-mono">A</span>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display">Authority</h4>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                {activeAudit.eeatContent.authoritySection}
                              </p>
                            </div>

                            {/* Trustworthiness */}
                            <div className="p-4 rounded-xl border border-rose-100 bg-rose-500/[0.02]">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold text-xs font-mono">T</span>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display">Trust</h4>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                {activeAudit.eeatContent.trustSection}
                              </p>
                            </div>
                          </div>

                          {/* Pre-written CopySnippet container */}
                          <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50 relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 border-b border-slate-200/60 pb-3 gap-2">
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Suggested Format: {activeAudit.eeatContent.formatType}</span>
                                <h4 className="text-xs font-bold text-slate-800 font-display mt-0.5">
                                  Suggested SEO Title: <span className="text-indigo-600">"{activeAudit.eeatContent.suggestedTitle}"</span>
                                </h4>
                              </div>

                              <button
                                onClick={() => handleCopyText(activeAudit.eeatContent?.readyToUseCopySnippet || "", activeAudit.personaId)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-[11px] transition shrink-0 shadow-sm cursor-pointer"
                              >
                                {copiedTextId === activeAudit.personaId ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copied Draft!</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Copy Draft Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Actual snippet text */}
                            <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700 font-medium font-sans whitespace-pre-wrap max-h-[400px] overflow-y-auto font-semibold">
                              {activeAudit.eeatContent.readyToUseCopySnippet}
                            </div>
                            
                            <p className="text-[10px] text-slate-400 mt-2.5 font-medium leading-relaxed font-semibold">
                              💡 <strong>Implementation Tip:</strong> Copy &amp; paste this structured draft directly onto your website index, blog center, or FAQ section. Google SGE crawlers explicitly index clear, answers-first formatting that incorporates first-person testing, deep expert credentials, and high-quality references.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
                          <Award className="w-12 h-12 text-slate-305 mx-auto mb-4" />
                          <p className="text-sm font-semibold">No E-E-A-T suggestion template was generated for this persona.</p>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">Please try re-generating the report to index fresh structures.</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm font-semibold">Please select a search persona to inspect deep comparative logs.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Info Logic Modal dialog */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold font-display text-slate-900 border-b pb-3 mb-4">
              Brand Visibility Indexing &amp; Scoring Logic
            </h3>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
              <p>
                The <strong>Brand Visibility Score</strong> tracks how frequently and prominently your business is mentioned and cited relative to industry norms under conversational searches. Key ranking weights follow:
              </p>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>1. Answer Mentions Score (Max 100 pts)</span>
                </h4>
                <p className="pl-3.5">
                  We verify if the LLM answers write down your brand name in recommendations:
                </p>
                <div className="pl-3.5 mt-1.5 space-y-1">
                  <div className="flex justify-between"><strong>HIGH (100 pts):</strong> <span>Featured in primary recommendations / top of the fold.</span></div>
                  <div className="flex justify-between"><strong>MEDIUM (50 pts):</strong> <span>Listed among secondary suggestions / inside body comparison lists.</span></div>
                  <div className="flex justify-between"><strong>NONE (0 pts):</strong> <span>Absent in answer recommendation blocks.</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>2. Website Citation Score (Max 100 pts)</span>
                </h4>
                <p className="pl-3.5">
                  We check your website domain's inclusion inside SGE/ChatGPT citation blocks:
                </p>
                <div className="pl-3.5 mt-1.5 space-y-1">
                  <div className="flex justify-between"><strong>HIGH (100 pts):</strong> <span>Your domain is cited in the #1 or #2 source links.</span></div>
                  <div className="flex justify-between"><strong>MEDIUM (50 pts):</strong> <span>Cited as source references further down context blocks.</span></div>
                  <div className="flex justify-between"><strong>NONE (0 pts):</strong> <span>No website citations assigned to your domain index.</span></div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <h4 className="font-bold text-indigo-950 font-display text-[11px] uppercase tracking-wider mb-1">Index formulation mathematical formula:</h4>
                <p className="text-[11px] text-indigo-900">
                  Engine_Score = (Mention_Score + Citation_Score) / 2
                  <br />
                  Final Audit Score = Average of Engine_Scores across all 3 Buyer Personas and prompts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition h-10"
            >
              Close Information
            </button>
          </div>
        </div>
      )}

      {/* Ambient background blur blobs */}
      <div className="fixed top-20 right-0 -z-50 w-80 h-80 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 left-10 -z-50 w-96 h-96 rounded-full bg-indigo-100/15 blur-3xl pointer-events-none"></div>
    </div>
  );
}
