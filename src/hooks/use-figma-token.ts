"use client";

import { useState, useEffect } from "react";

const FIGMA_TOKEN_KEY = "figma_access_token";

export function useFigmaToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasServerToken, setHasServerToken] = useState(false);

  useEffect(() => {
    const initializeToken = async () => {
      try {
        // First, check if server has a token
        const serverResponse = await fetch("/api/figma/server-token");
        const serverData = await serverResponse.json();
        setHasServerToken(serverData.hasServerToken);

        // Then check localStorage for saved token
        const savedToken = localStorage.getItem(FIGMA_TOKEN_KEY);
        setToken(savedToken);
      } catch (error) {
        console.error("Error initializing token:", error);
        // If server check fails, still check localStorage
        const savedToken = localStorage.getItem(FIGMA_TOKEN_KEY);
        setToken(savedToken);
      } finally {
        setIsLoading(false);
      }
    };

    initializeToken();
  }, []);

  const saveToken = (newToken: string) => {
    localStorage.setItem(FIGMA_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem(FIGMA_TOKEN_KEY);
    setToken(null);
  };

  return {
    token,
    saveToken,
    clearToken,
    isLoading,
    hasToken: !!token || hasServerToken,
    hasServerToken,
  };
}
