// This file creates one shared Axios instance pointed at our FastAPI backend. An
// interceptor runs before every request and automatically attaches the logged-in user's
// Supabase access token, so the backend knows who's making each request.

import axios from "axios";
import { supabase } from "./supabase";

const BASE_URL = "http://192.168.0.202:8000"; // update if your laptop's IP changes

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});