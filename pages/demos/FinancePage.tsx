import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, TrendingDown, AlertTriangle, PieChart, Activity, Download, Cpu } from 'lucide-react';
import { Language } from '../../types';
import { useFinancialAI, KPI } from '../../hooks/useFinancialAI';

// --- Types for Plotly ---
declare global {
    interface Window {
        Plotly: any;
    }
}

interface Props {
  lang: Language;
}

const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  <div className="bg-white border border-black/5 rounded-lg p-4 relative overflow-hidden group hover:border-mncc-primary/50 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-2">
          <h4 className="text-mncc-muted text-xs uppercase font-bold tracking-wider">{kpi.label}</h4>
          <div className={`text-xs font-mono flex items-center gap-1 ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(kpi.change).toFixed(1)}%
          </div>
      </div>
      <div className="text-2xl font-mono text-mncc-text font-bold mb-1">
          {kpi.value.toFixed(1)} <span className="text-sm text-mncc-muted font-normal">{kpi.unit}</span>
      </div>
      <div className="text-[10px] text-mncc-muted border-t border-black/5 pt-2 mt-2">
          {kpi.description}
      </div>
      {/* Status Indicator Line */}
      <div className={`absolute bottom-0 left-0 w-full h-1 ${
          kpi.status === 'good' ? 'bg-green-500' : kpi.status === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'
      }`}></div>
  </div>
);

const RiskPanel: React.FC<{ risks: string[]; summary: string[] }> = ({ risks, summary }) => (
    <div className="bg-white border border-black/5 rounded-lg p-6 h-full shadow-sm">
        <h3 className="text-mncc-text font-bold text-sm uppercase flex items-center gap-2 mb-4">
            <Cpu size={16} className="text-mncc-primary" /> AI Analysis Summary
        </h3>
        
        <div className="space-y-4 mb-6">
            {summary.map((s, i) => (
                <div key={i} className="flex gap-3 text-sm text-mncc-muted">
                    <span className="text-mncc-primary font-bold">›</span>
                    {s}
                </div>
            ))}
        </div>

        {risks.length > 0 && (
            <div className="bg-red-50 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-red-600 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <AlertTriangle size={12} /> Risk Factors Detected
                </h4>
                <ul className="space-y-2">
                    {risks.map((r, i) => (
                        <li key={i} className="text-xs text-red-800 pl-4 relative">
                            <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {r}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

const FinancePage: React.FC<Props> = ({ lang }) => {
  const { loading, result, analyzeCompany } = useFinancialAI();
  const [selectedCompany, setSelectedCompany] = useState("TechNova Inc.");
  const historyChartRef = useRef<HTMLDivElement>(null);
  const scenarioChartRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
      analyzeCompany(selectedCompany);
  }, [selectedCompany, analyzeCompany]);

  // Plotly Rendering
  useEffect(() => {
      if (!result || !window.Plotly) return;

      // 1. History Chart
      const years = result.history.map(h => h.year);
      const rev = result.history.map(h => h.revenue);
      const profit = result.history.map(h => h.operating_profit);
      const net = result.history.map(h => h.net_income);

      const trace1 = { x: years, y: rev, type: 'scatter', mode: 'lines+markers', name: 'Revenue', line: {color: '#5D9CEC', width: 3} };
      const trace2 = { x: years, y: profit, type: 'scatter', mode: 'lines+markers', name: 'Op. Profit', line: {color: '#387C6D'} };
      const trace3 = { x: years, y: net, type: 'bar', name: 'Net Income', marker: {color: '#94a3b8'} };

      const layoutCommon = {
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#75706b', family: 'monospace' },
          xaxis: { showgrid: false, color: '#75706b' },
          yaxis: { gridcolor: '#e6e4dd', color: '#75706b' },
          legend: { orientation: 'h', y: 1.1 },
          margin: { t: 30, l: 40, r: 20, b: 40 }
      };

      window.Plotly.newPlot(historyChartRef.current, [trace3, trace1, trace2], {
          ...layoutCommon,
          title: ''
      }, {responsive: true, displayModeBar: false});

      // 2. Scenario Chart
      const futureYears = result.scenarios.base.map(s => s.year);
      
      // Monte Carlo Cloud
      const mcTraces = result.monteCarlo.paths.map(path => ({
          x: futureYears,
          y: path,
          type: 'scatter',
          mode: 'lines',
          line: { color: 'rgba(56, 124, 109, 0.05)', width: 1 },
          showlegend: false,
          hoverinfo: 'skip'
      }));

      const traceBase = { 
          x: futureYears, y: result.scenarios.base.map(s => s.revenue), 
          type: 'scatter', mode: 'lines+markers', name: 'Base Case', 
          line: {color: '#5D9CEC', width: 3, dash: 'solid'} 
      };
      const traceOpt = { 
          x: futureYears, y: result.scenarios.optimistic.map(s => s.revenue), 
          type: 'scatter', mode: 'lines', name: 'Optimistic', 
          line: {color: '#387C6D', width: 2, dash: 'dot'} 
      };
      const tracePess = { 
          x: futureYears, y: result.scenarios.pessimistic.map(s => s.revenue), 
          type: 'scatter', mode: 'lines', name: 'Pessimistic', 
          line: {color: '#ef4444', width: 2, dash: 'dot'} 
      };

      window.Plotly.newPlot(scenarioChartRef.current, [...mcTraces, traceBase, traceOpt, tracePess], {
          ...layoutCommon,
          title: ''
      }, {responsive: true, displayModeBar: false});

  }, [result]);

  return (
    <div className="bg-[#f3f1ea] min-h-screen pt-24 pb-12 px-4 font-sans">
       <div className="max-w-7xl mx-auto">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div className="flex items-center gap-4">
                <Link to="/demos" className="p-2 rounded-full bg-white text-mncc-text hover:text-mncc-primary transition-colors shadow-sm">
                   <ArrowLeft size={20} />
                </Link>
                <div>
                   <h1 className="text-2xl font-bold text-mncc-text flex items-center gap-2">
                      AI Financial Analyst
                      <span className="bg-mncc-primary/10 text-mncc-primary text-[10px] px-2 py-1 rounded border border-mncc-primary/30">BETA</span>
                   </h1>
                   <p className="text-mncc-muted text-sm">
                      Automated financial health assessment & Monte Carlo forecasting.
                   </p>
                </div>
             </div>

             {/* Company Selector */}
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-mncc-muted" />
                </div>
                <select 
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="bg-white border border-black/10 text-mncc-text text-sm rounded-lg focus:ring-mncc-primary focus:border-mncc-primary block w-64 pl-10 p-2.5 appearance-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <option>TechNova Inc.</option>
                    <option>GreenRetail Corp.</option>
                    <option>FutureAuto Dynamics</option>
                </select>
             </div>
          </div>

          {/* Main Dashboard */}
          {loading || !result ? (
             <div className="h-96 flex flex-col items-center justify-center text-mncc-muted gap-4">
                 <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-mncc-primary/20 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-mncc-primary border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <p className="text-sm font-mono animate-pulse">Analyzing Financial Statements...</p>
             </div>
          ) : (
             <div className="space-y-6 animate-fade-in-up">
                
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Left Col: Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-black/5 rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-mncc-text font-bold text-sm flex items-center gap-2">
                                    <Activity size={16} className="text-mncc-accent"/> Historical Performance
                                </h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] text-mncc-muted bg-gray-100 px-2 py-1 rounded">5Y Lookback</span>
                                </div>
                            </div>
                            <div ref={historyChartRef} className="w-full h-[300px]"></div>
                        </div>

                        <div className="bg-white border border-black/5 rounded-lg p-6 relative overflow-hidden shadow-sm">
                            {/* Decor */}
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <PieChart size={100} className="text-black" />
                            </div>

                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <div>
                                    <h3 className="text-mncc-text font-bold text-sm flex items-center gap-2">
                                        <TrendingUp size={16} className="text-mncc-primary"/> Future Scenarios (Monte Carlo)
                                    </h3>
                                    <p className="text-[10px] text-mncc-muted mt-1">
                                        100 stochastic iterations based on historical volatility
                                    </p>
                                </div>
                            </div>
                            <div ref={scenarioChartRef} className="w-full h-[350px] relative z-10"></div>
                        </div>
                    </div>

                    {/* Right Col: Analysis Text */}
                    <div className="lg:col-span-1">
                        <RiskPanel risks={result.risks} summary={result.summary} />
                        
                        <div className="mt-6 bg-white border border-black/5 rounded-lg p-6 shadow-sm">
                             <h3 className="text-mncc-text font-bold text-sm mb-4">Scenario Parameters</h3>
                             <div className="space-y-3 text-xs font-mono">
                                 <div className="flex justify-between border-b border-black/5 pb-2">
                                     <span className="text-mncc-muted">Base Growth</span>
                                     <span className="text-mncc-primary">Avg. Hist.</span>
                                 </div>
                                 <div className="flex justify-between border-b border-black/5 pb-2">
                                     <span className="text-mncc-muted">Optimistic</span>
                                     <span className="text-green-600">+8.0%</span>
                                 </div>
                                 <div className="flex justify-between border-b border-black/5 pb-2">
                                     <span className="text-mncc-muted">Pessimistic</span>
                                     <span className="text-red-500">-8.0%</span>
                                 </div>
                                 <button className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-mncc-text py-2 rounded border border-black/10 transition-colors">
                                     <Download size={12} /> Export Report
                                 </button>
                             </div>
                        </div>
                    </div>

                </div>
             </div>
          )}

       </div>
    </div>
  );
};

export default FinancePage;