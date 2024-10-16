import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Récupérer les variables d'environnement
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'xc-auth': API_KEY,
    'Content-Type': 'application/json',
  },
});