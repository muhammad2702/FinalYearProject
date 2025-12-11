import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Simulation {
    id: string;
    name: string;
    created: string;
    metadata: Record<string, string>;
}

export interface SimulationCollectorsResponse {
    collectors: Record<string, string[]>;
}

export interface SimulationCollectorDataResponse {
    collector: string;
    data: Record<string, {
        headers: string[];
        data: Array<Record<string, any>>;
    }>;
}

export interface Template {
    id: string;
    name: string;
    content: string;
}

export interface Statistics {
    price?: {
        mean: number;
        volatility: number;
        skewness: number;
        kurtosis: number;
        sharpeRatio: number;
        maxDrawdown: number;
        totalReturn: number;
        minPrice: number;
        maxPrice: number;
    };
    skew?: number;
    excessKurtosis?: number;
}

// Simulations
export const getSimulations = async (): Promise<Simulation[]> => {
    const response = await api.get<Simulation[]>('/simulations');
    return response.data;
};

export const getSimulationData = async (
    id: string,
    collector?: string
): Promise<SimulationCollectorsResponse | SimulationCollectorDataResponse> => {
    const response = await api.get<SimulationCollectorsResponse | SimulationCollectorDataResponse>(
        `/simulations/${id}/data`,
        { params: { collector } },
    );
    return response.data;
};

export const getSimulationStats = async (id: string): Promise<Statistics> => {
    const response = await api.get<Statistics>(`/simulations/${id}/stats`);
    return response.data;
};

export const exportSimulation = async (
    id: string,
): Promise<{ success: boolean; path: string; message: string }> => {
    const response = await api.get<{ success: boolean; path: string; message: string }>(
        `/simulations/${id}/export`,
    );
    return response.data;
};

// Templates
export const getTemplates = async (): Promise<Template[]> => {
    const response = await api.get<Template[]>('/templates');
    return response.data;
};

export const getTemplate = async (id: string): Promise<Template> => {
    const response = await api.get<Template>(`/templates/${id}`);
    return response.data;
};

// Run Simulation
export const runSimulation = async (
    xmlContent: string,
    name: string
): Promise<{ success: boolean; simulationId: string; output: string }> => {
    const response = await api.post('/run-sim', { xmlContent, name });
    return response.data;
};

// Auth
export const signup = async (payload: { fullName: string; email: string; password: string }) => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/signup', payload);
    return response.data;
};

export const verifyOtp = async (payload: { email: string; otp: string }) => {
    const response = await api.post<{ success: boolean; token: string; message?: string }>(
        '/auth/verify-otp',
        payload,
    );
    return response.data;
};

export const login = async (payload: { email: string; password: string }) => {
    const response = await api.post<{ success: boolean; token: string }>('/auth/login', payload);
    return response.data;
};

export default api;
