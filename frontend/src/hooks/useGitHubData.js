import { useState, useEffect, useCallback } from 'react';
import { DATA_CONFIG, transformDashboardData, transformProjectData } from '../config/dataConfig';

// Custom hook to fetch data from GitHub
export const useGitHubData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = dataType === 'dashboards' 
        ? DATA_CONFIG.DASHBOARDS_URL 
        : DATA_CONFIG.PROJECTS_URL;

      // Add cache-busting parameter to get fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(url + cacheBuster);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataType}: ${response.status}`);
      }

      const rawData = await response.json();

      // Transform data based on type
      const transformedData = dataType === 'dashboards'
        ? transformDashboardData(rawData)
        : transformProjectData(rawData);

      setData(transformedData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      setError(`Failed to fetch ${dataType}. Please check your internet connection.`);
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh: fetchData,
  };
};
