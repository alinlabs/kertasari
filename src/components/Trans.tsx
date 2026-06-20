import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TransProps {
  children: string;
}

const translationCache: Record<string, string> = {};

export function Trans({ children }: TransProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (language === 'id' || !children) {
      setTranslatedText(children);
      return;
    }

    const cacheKey = `${language}_${children}`;
    
    // Check memory cache first
    if (translationCache[cacheKey]) {
      setTranslatedText(translationCache[cacheKey]);
      return;
    }

    // Check localStorage cache
    const localCache = localStorage.getItem('translation_cache');
    const parsedCache = localCache ? JSON.parse(localCache) : {};
    
    if (parsedCache[cacheKey]) {
      translationCache[cacheKey] = parsedCache[cacheKey]; // update memory cache
      setTranslatedText(parsedCache[cacheKey]);
      return;
    }

    // Fetch from MyMemory API
    let isMounted = true;
    const fetchTranslation = async () => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(children)}&langpair=id|${language}`
        );
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
          const result = data.responseData.translatedText;
          
          if (isMounted) {
            setTranslatedText(result);
          }

          // Save to caches
          translationCache[cacheKey] = result;
          parsedCache[cacheKey] = result;
          localStorage.setItem('translation_cache', JSON.stringify(parsedCache));
        } else {
          // Fallback to original text if API fails securely
          if (isMounted) setTranslatedText(children);
        }
      } catch (error) {
        console.error("Translation API error:", error);
        // Fallback
        if (isMounted) setTranslatedText(children);
      }
    };

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [children, language]);

  return <>{translatedText}</>;
}
