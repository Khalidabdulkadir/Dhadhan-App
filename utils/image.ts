
import { BASE_URL } from '@/constants/api';

/**
 * Helper to ensure image URLs are HTTPS and absolute.
 * Fixes issue where API returns HTTP URLs which fail in APKs due to cleartext constraints.
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    if (url.startsWith('https://')) {
        return url;
    }
    return `${BASE_URL}${url}`;
};
