import { useState, useCallback } from 'react';

// --- Types ---

export interface FinancialData {
  year: number;
  revenue: number;
  operating_profit: number;
  net_income: number;
  total_assets: number;
  equity: number;
  debt: number;
  operating_cf: number;
  investing_cf: number;
  financing_cf: number;
}

export interface KPI {
  label: string;
  value: number;
  unit: string;
  change: number; // Percent change vs previous year
  status: 'good' | 'neutral' | 'bad';
  description: string;
}

export interface AnalysisResult {
  company: string;
  kpis: KPI[];
  history: FinancialData[];
  scenarios: {
    base: { year: number; revenue: number; net_income: number }[];
    optimistic: { year: number; revenue: number; net_income: number }[];
    pessimistic: { year: number; revenue: number; net_income: number }[];
  };
  monteCarlo: { year: number; paths: number[][] }; // year -> array of revenue values
  risks: string[];
  summary: string[];
}

// --- Mock Data Store (Simulating Database) ---

const MOCK_DB: Record<string, FinancialData[]> = {
  "TechNova Inc.": [
    { year: 2019, revenue: 5000, operating_profit: 800, net_income: 600, total_assets: 4000, equity: 2500, debt: 1500, operating_cf: 900, investing_cf: -400, financing_cf: -200 },
    { year: 2020, revenue: 6200, operating_profit: 1100, net_income: 850, total_assets: 5200, equity: 3200, debt: 2000, operating_cf: 1200, investing_cf: -500, financing_cf: 100 },
    { year: 2021, revenue: 7500, operating_profit: 1400, net_income: 1100, total_assets: 6500, equity: 4000, debt: 2500, operating_cf: 1500, investing_cf: -800, financing_cf: 200 },
    { year: 2022, revenue: 8100, operating_profit: 1350, net_income: 1050, total_assets: 7000, equity: 4500, debt: 2500, operating_cf: 1400, investing_cf: -600, financing_cf: -300 },
    { year: 2023, revenue: 9800, operating_profit: 1900, net_income: 1500, total_assets: 8500, equity: 5500, debt: 3000, operating_cf: 2100, investing_cf: -1000, financing_cf: 400 },
  ],
  "GreenRetail Corp.": [
    { year: 2019, revenue: 12000, operating_profit: 400, net_income: 250, total_assets: 8000, equity: 3000, debt: 5000, operating_cf: 600, investing_cf: -200, financing_cf: -100 },
    { year: 2020, revenue: 11500, operating_profit: 350, net_income: 200, total_assets: 7800, equity: 2900, debt: 4900, operating_cf: 500, investing_cf: -100, financing_cf: -200 },
    { year: 2021, revenue: 12500, operating_profit: 450, net_income: 300, total_assets: 8200, equity: 3200, debt: 5000, operating_cf: 700, investing_cf: -300, financing_cf: 0 },
    { year: 2022, revenue: 13000, operating_profit: 500, net_income: 350, total_assets: 8500, equity: 3400, debt: 5100, operating_cf: 750, investing_cf: -250, financing_cf: -100 },
    { year: 2023, revenue: 13200, operating_profit: 520, net_income: 360, total_assets: 8600, equity: 3500, debt: 5100, operating_cf: 780, investing_cf: -200, financing_cf: -200 },
  ],
  "FutureAuto Dynamics": [
    { year: 2019, revenue: 2000, operating_profit: -500, net_income: -600, total_assets: 3000, equity: 1000, debt: 2000, operating_cf: -200, investing_cf: -800, financing_cf: 1000 },
    { year: 2020, revenue: 2500, operating_profit: -300, net_income: -400, total_assets: 4500, equity: 1500, debt: 3000, operating_cf: -100, investing_cf: -1200, financing_cf: 1500 },
    { year: 2021, revenue: 4000, operating_profit: 100, net_income: -50, total_assets: 6000, equity: 3000, debt: 3000, operating_cf: 400, investing_cf: -1500, financing_cf: 1200 },
    { year: 2022, revenue: 6500, operating_profit: 800, net_income: 600, total_assets: 8000, equity: 5000, debt: 3000, operating_cf: 1200, investing_cf: -2000, financing_cf: 500 },
    { year: 2023, revenue: 9000, operating_profit: 1500, net_income: 1200, total_assets: 11000, equity: 7000, debt: 4000, operating_cf: 2500, investing_cf: -3000, financing_cf: 1000 },
  ]
};

// --- Helper Logic ---

const calculateCAGR = (start: number, end: number, years: number) => {
  return (Math.pow(end / start, 1 / years) - 1);
};

const stdDev = (arr: number[]) => {
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / arr.length);
};

// --- Main Hook ---

export const useFinancialAI = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCompany = useCallback(async (companyName: string) => {
    setLoading(true);
    setResult(null);

    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    const history = MOCK_DB[companyName];
    if (!history) {
        setLoading(false);
        return;
    }

    const latest = history[history.length - 1];
    const prev = history[history.length - 2];

    // --- 1. Calculate KPIs ---
    
    // Profitability: Operating Margin
    const opMargin = (latest.operating_profit / latest.revenue) * 100;
    const prevOpMargin = (prev.operating_profit / prev.revenue) * 100;
    
    // Safety: Equity Ratio
    const equityRatio = (latest.equity / latest.total_assets) * 100;
    const prevEquityRatio = (prev.equity / prev.total_assets) * 100;

    // Efficiency: ROE
    const roe = (latest.net_income / latest.equity) * 100;
    const prevRoe = (prev.net_income / prev.equity) * 100;

    // Debt/Equity
    const deRatio = latest.debt / latest.equity;

    const kpis: KPI[] = [
        {
            label: "Operating Margin",
            value: opMargin,
            unit: "%",
            change: opMargin - prevOpMargin,
            status: opMargin > 15 ? 'good' : opMargin > 5 ? 'neutral' : 'bad',
            description: "Measures core business profitability."
        },
        {
            label: "Equity Ratio",
            value: equityRatio,
            unit: "%",
            change: equityRatio - prevEquityRatio,
            status: equityRatio > 40 ? 'good' : equityRatio > 20 ? 'neutral' : 'bad',
            description: "Indicates financial stability and leverage."
        },
        {
            label: "ROE",
            value: roe,
            unit: "%",
            change: roe - prevRoe,
            status: roe > 12 ? 'good' : roe > 5 ? 'neutral' : 'bad',
            description: "Return on Equity: Efficiency of capital use."
        },
        {
            label: "Debt/Equity",
            value: deRatio,
            unit: "x",
            change: deRatio - (prev.debt / prev.equity),
            status: deRatio < 0.8 ? 'good' : deRatio < 1.5 ? 'neutral' : 'bad',
            description: "High values indicate higher leverage risk."
        }
    ];

    // --- 2. Trend & Risk Analysis ---

    const revenues = history.map(h => h.revenue);
    const revenueGrowthRates = [];
    for(let i=1; i<revenues.length; i++) {
        revenueGrowthRates.push((revenues[i] - revenues[i-1])/revenues[i-1]);
    }
    
    const avgGrowth = revenueGrowthRates.reduce((a,b) => a+b, 0) / revenueGrowthRates.length;
    const volatility = stdDev(revenueGrowthRates);

    const risks: string[] = [];
    if (equityRatio < 20) risks.push("CRITICAL: Low Equity Ratio (<20%) indicates high insolvency risk.");
    if (deRatio > 1.5) risks.push("WARNING: High Debt/Equity ratio suggests over-leverage.");
    if (volatility > 0.15) risks.push("VOLATILITY: Revenue shows significant fluctuation (StdDev > 15%).");
    if (latest.operating_cf < 0) risks.push("CASH FLOW: Negative operating cash flow detected.");

    const summary: string[] = [
        `Average revenue growth of ${(avgGrowth * 100).toFixed(1)}% over past 5 years.`,
        `Volatility index is ${(volatility * 100).toFixed(1)}%, suggesting ${volatility > 0.1 ? 'high' : 'stable'} market conditions.`,
        `Financial health is ${equityRatio > 40 ? 'robust' : equityRatio > 20 ? 'moderate' : 'concerning'} with a ${equityRatio.toFixed(1)}% equity ratio.`
    ];

    // --- 3. Scenarios & Monte Carlo ---

    const futureYears = [2024, 2025, 2026, 2027, 2028];
    const baseGrowth = avgGrowth; 
    const optGrowth = avgGrowth + 0.08; // +8% optimistic
    const pessGrowth = avgGrowth - 0.08; // -8% pessimistic

    const generatePath = (startVal: number, growth: number) => {
        let current = startVal;
        return futureYears.map(y => {
            current = current * (1 + growth);
            return { year: y, revenue: current, net_income: current * (opMargin/100) }; // Simplified profit margin assumption
        });
    };

    // Monte Carlo: Generate 100 random paths
    const mcPaths: number[][] = [];
    for(let i=0; i<100; i++) {
        let current = latest.revenue;
        const path = [];
        for(let y=0; y<futureYears.length; y++) {
             // Random walk with drift
             const shock = (Math.random() - 0.5) * 2 * volatility; // Random shock based on history
             const r = baseGrowth + shock;
             current = current * (1 + r);
             path.push(current);
        }
        mcPaths.push(path);
    }

    setResult({
        company: companyName,
        history,
        kpis,
        risks,
        summary,
        scenarios: {
            base: generatePath(latest.revenue, baseGrowth),
            optimistic: generatePath(latest.revenue, optGrowth),
            pessimistic: generatePath(latest.revenue, pessGrowth),
        },
        monteCarlo: {
            year: 2023, // Start year
            paths: mcPaths
        }
    });
    setLoading(false);

  }, []);

  return { loading, result, analyzeCompany };
};