import Constants from 'expo-constants';
import { Platform } from 'react-native';

const sanitizeBase = (value: string) => value.replace(/\/+$/, '');

const resolveApiBase = () => {
  const extra = Constants.expoConfig?.extra ?? {};
  const configured = typeof extra.apiUrl === 'string' ? extra.apiUrl.trim() : '';

  if (configured.length > 0) {
    return sanitizeBase(configured);
  }

  if (__DEV__) {
    const hostUri = typeof Constants.expoConfig?.hostUri === 'string' ? Constants.expoConfig.hostUri : undefined;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host) {
        return sanitizeBase(`http://${host}:3001/api`);
      }
    }

    if (Platform.OS === 'android') {
      return sanitizeBase('http://10.0.2.2:3001/api');
    }

    if (Platform.OS === 'ios') {
      return sanitizeBase('http://localhost:3001/api');
    }
  }

  return sanitizeBase('http://localhost:3001/api');
};

export const API_BASE_URL = resolveApiBase();

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${normalizedPath}`;
};
