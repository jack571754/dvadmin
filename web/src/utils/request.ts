import qs from 'qs';
import { httpRuntime } from './http';

// Compatibility contract for the legacy /user/signIn adapter: success code 0.
export default httpRuntime.createClient({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 50000,
    headers: { 'Content-Type': 'application/json' },
    paramsSerializer: { serialize: params => qs.stringify(params, { allowDots: true }) },
}, 'legacy');
