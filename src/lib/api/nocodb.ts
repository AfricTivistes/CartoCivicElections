import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Récupérer les variables d'environnement
const API_URL = process.env.API_URL;
const API_TOKEN = process.env.API_TOKEN;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'xc-token': API_TOKEN,
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          // NocoDB expects arrays as repeated params: fields=X&fields=Y
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, String(value));
        }
      }
      return searchParams.toString();
    }
  }
});