/**
 * Statistical Analysis Utilities for Quantitative Finance
 */

export interface TimeSeriesData {
    timestamp: number;
    value: number;
}

/**
 * Calculate returns from price series
 */
export const calculateReturns = (prices: number[]): number[] => {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
        const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
        returns.push(ret);
    }
    return returns;
};

/**
 * Calculate log returns from price series
 */
export const calculateLogReturns = (prices: number[]): number[] => {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
        const ret = Math.log(prices[i] / prices[i - 1]);
        returns.push(ret);
    }
    return returns;
};

/**
 * Calculate mean
 */
export const mean = (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate variance
 */
export const variance = (values: number[]): number => {
    if (values.length === 0) return 0;
    const m = mean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length;
};

/**
 * Calculate standard deviation
 */
export const stdDev = (values: number[]): number => {
    return Math.sqrt(variance(values));
};

/**
 * Calculate skewness
 */
export const skewness = (values: number[]): number => {
    if (values.length === 0) return 0;
    const m = mean(values);
    const sd = stdDev(values);
    if (sd === 0) return 0;

    const sum = values.reduce((acc, val) => {
        return acc + Math.pow((val - m) / sd, 3);
    }, 0);

    return sum / values.length;
};

/**
 * Calculate excess kurtosis (Fisher's definition)
 */
export const kurtosis = (values: number[]): number => {
    if (values.length === 0) return 0;
    const m = mean(values);
    const sd = stdDev(values);
    if (sd === 0) return 0;

    const sum = values.reduce((acc, val) => {
        return acc + Math.pow((val - m) / sd, 4);
    }, 0);

    return sum / values.length - 3; // Excess kurtosis
};

/**
 * Calculate Sharpe ratio
 * @param returns - Array of returns
 * @param riskFreeRate - Risk-free rate (default: 0)
 * @param periodsPerYear - Number of periods per year for annualization (default: 252 for daily)
 */
export const sharpeRatio = (
    returns: number[],
    riskFreeRate: number = 0,
    periodsPerYear: number = 252
): number => {
    const avgReturn = mean(returns);
    const sd = stdDev(returns);
    if (sd === 0) return 0;

    return ((avgReturn - riskFreeRate) / sd) * Math.sqrt(periodsPerYear);
};

/**
 * Calculate Sortino ratio
 * @param returns - Array of returns
 * @param targetReturn - Target return (default: 0)
 * @param periodsPerYear - Number of periods per year for annualization
 */
export const sortinoRatio = (
    returns: number[],
    targetReturn: number = 0,
    periodsPerYear: number = 252
): number => {
    const avgReturn = mean(returns);
    const downside = returns.filter(r => r < targetReturn);
    const downsideDeviation = Math.sqrt(
        downside.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0) / returns.length
    );

    if (downsideDeviation === 0) return 0;
    return ((avgReturn - targetReturn) / downsideDeviation) * Math.sqrt(periodsPerYear);
};

/**
 * Calculate maximum drawdown
 */
export const maxDrawdown = (prices: number[]): { drawdown: number; peak: number; trough: number } => {
    let maxDD = 0;
    let peak = prices[0];
    let trough = prices[0];
    let peakValue = prices[0];
    let currentPeak = prices[0];

    for (let i = 1; i < prices.length; i++) {
        if (prices[i] > currentPeak) {
            currentPeak = prices[i];
        }

        const dd = (currentPeak - prices[i]) / currentPeak;
        if (dd > maxDD) {
            maxDD = dd;
            peak = currentPeak;
            trough = prices[i];
            peakValue = currentPeak;
        }
    }

    return { drawdown: maxDD, peak: peakValue, trough };
};

/**
 * Calculate Value at Risk (VaR) using historical method
 * @param returns - Array of returns
 * @param confidence - Confidence level (e.g., 0.95 for 95%)
 */
export const valueAtRisk = (returns: number[], confidence: number = 0.95): number => {
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    return -sorted[index]; // VaR is typically expressed as a positive number
};

/**
 * Calculate Conditional Value at Risk (CVaR) / Expected Shortfall
 * @param returns - Array of returns
 * @param confidence - Confidence level
 */
export const conditionalVaR = (returns: number[], confidence: number = 0.95): number => {
    const var95 = valueAtRisk(returns, confidence);
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    const tailReturns = sorted.slice(0, index);

    if (tailReturns.length === 0) return var95;
    return -mean(tailReturns);
};

/**
 * Calculate autocorrelation
 * @param values - Array of values
 * @param lag - Lag period
 */
export const autocorrelation = (values: number[], lag: number): number => {
    if (lag >= values.length) return 0;

    const m = mean(values);
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < values.length - lag; i++) {
        numerator += (values[i] - m) * (values[i + lag] - m);
    }

    for (let i = 0; i < values.length; i++) {
        denominator += Math.pow(values[i] - m, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calculate rolling statistics
 */
export const rollingMean = (values: number[], window: number): number[] => {
    const result: number[] = [];

    for (let i = 0; i < values.length; i++) {
        const start = Math.max(0, i - window + 1);
        const windowValues = values.slice(start, i + 1);
        result.push(mean(windowValues));
    }

    return result;
};

export const rollingStdDev = (values: number[], window: number): number[] => {
    const result: number[] = [];

    for (let i = 0; i < values.length; i++) {
        const start = Math.max(0, i - window + 1);
        const windowValues = values.slice(start, i + 1);
        result.push(stdDev(windowValues));
    }

    return result;
};

/**
 * Calculate cumulative returns
 */
export const cumulativeReturns = (returns: number[]): number[] => {
    let cumulative = 1;
    return returns.map(r => {
        cumulative *= (1 + r);
        return cumulative - 1; // Return as percentage from initial
    });
};

/**
 * Calculate Calmar ratio (Return / Max Drawdown)
 */
export const calmarRatio = (prices: number[], periodsPerYear: number = 252): number => {
    const returns = calculateReturns(prices);
    const annualizedReturn = mean(returns) * periodsPerYear;
    const mdd = maxDrawdown(prices).drawdown;

    if (mdd === 0) return 0;
    return annualizedReturn / mdd;
};

/**
 * Format number for display
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format currency
 */
export const formatCurrency = (value: number, decimals: number = 2): string => {
    return `$${value.toFixed(decimals)}`;
};
