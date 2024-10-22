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
});