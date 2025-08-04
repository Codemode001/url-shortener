import React, { useState } from 'react';
import { Link } from "react-router";

interface ShortenedUrlResponse {
  success: boolean;
  data: {
    id: number;
    original_url: string;
    slug: string;
    short_url: string;
    created_at: string;
  };
}

interface ErrorResponse {
  error: string;
}

function HomePage() {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [shortenedUrl, setShortenedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setShortenedUrl('');
    setCopySuccess(false);

    if (!originalUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_url: originalUrl }),
      });

      const data: ShortenedUrlResponse | ErrorResponse = await response.json();

      if (response.ok && 'data' in data) {
        setShortenedUrl(data.data.short_url);
      } else if ('error' in data) {
        setError(data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center flex-col p-4 text-white">
      <div className="mb-8 text-center">
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
        </a>
        <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
        <p className="text-gray-400">Transform your long URLs into short, shareable links</p>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              Enter your long URL
            </label>
            <input
              id="url"
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Shortening...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {shortenedUrl && (
          <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-200 text-sm mb-3">Your shortened URL:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shortenedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {copySuccess && (
              <p className="text-green-300 text-xs mt-2">✓ Copied to clipboard!</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link 
          to="/second" 
          className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
        >
          Go to second page
        </Link>
      </div>
    </div>
  );
}

export default HomePage;