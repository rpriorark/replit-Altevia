import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Legal keywords for client-side pre-filtering
const LEGAL_KEYWORDS = [
  'legal', 'demanda', 'abogado', 'negligencia', 'daños', 'compensación',
  'lawsuit', 'lawyer', 'attorney', 'negligence', 'damages', 'compensation',
  'malpractice', 'sue', 'court', 'liability', 'wrongful', 'harm',
  'injury', 'medical error', 'error médico', 'mala praxis', 'irresponsable',
  'culpa', 'responsabilidad', 'tribunal', 'juicio', 'demandado'
];

// Threat/aggressive keywords
const AGGRESSIVE_KEYWORDS = [
  'terrible', 'horrible', 'disgusting', 'worst', 'awful', 'pathetic',
  'scam', 'fraud', 'fraudulent', 'criminal', 'steal', 'stolen',
  'theft', 'robbing', 'rip off', 'ripoff', 'crook', 'dishonest',
  'estafa', 'fraude', 'criminal', 'robar', 'ladrón', 'deshonesto',
  'terrible', 'horrible', 'disgusto', 'peor', 'espantoso', 'patético'
];

interface ConflictDetectionResult {
  isConflictive: boolean;
  conflictLevel: 'low' | 'medium' | 'high';
  detectedKeywords: string[];
  legalRisk: boolean;
  sentimentScore: number;
  recommendedIndustryType?: 'healthcare' | 'legal' | 'consulting' | 'finance' | 'general';
  riskFactors: string[];
  suggestedResponseApproach: string;
}

interface UseConflictDetectionOptions {
  debounceMs?: number;
  minTextLength?: number;
}

export function useConflictDetection({
  debounceMs = 500,
  minTextLength = 20
}: UseConflictDetectionOptions = {}) {
  const [conflictDetection, setConflictDetection] = useState<ConflictDetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clientSidePrediction, setClientSidePrediction] = useState<{
    hasLegalKeywords: boolean;
    hasAggressiveLanguage: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  } | null>(null);

  // AbortController ref for cancelling previous requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Client-side pre-filtering function
  const performClientSideAnalysis = useCallback((text: string, rating: number) => {
    const lowerText = text.toLowerCase();
    
    // Check for legal keywords
    const foundLegalKeywords = LEGAL_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    // Check for aggressive language
    const foundAggressiveKeywords = AGGRESSIVE_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );

    const hasLegalKeywords = foundLegalKeywords.length > 0;
    const hasAggressiveLanguage = foundAggressiveKeywords.length > 0;
    
    // Determine risk level based on client-side analysis
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (hasLegalKeywords && rating <= 2) {
      riskLevel = 'high';
    } else if (hasLegalKeywords || (hasAggressiveLanguage && rating <= 2)) {
      riskLevel = 'medium';
    } else if (hasAggressiveLanguage || rating <= 1) {
      riskLevel = 'low';
    }

    const prediction = {
      hasLegalKeywords,
      hasAggressiveLanguage,
      riskLevel
    };
    
    setClientSidePrediction(prediction);
    return prediction;
  }, []);

  // Main conflict detection function
  const detectConflicts = useCallback(async (
    reviewText: string,
    businessType: string,
    rating: number
  ) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset state if text is too short
    if (!reviewText || !businessType || reviewText.length < minTextLength) {
      setConflictDetection(null);
      setClientSidePrediction(null);
      setIsAnalyzing(false);
      return;
    }

    // Perform immediate client-side analysis
    const clientAnalysis = performClientSideAnalysis(reviewText, rating);
    
    // Debounced backend call
    debounceTimerRef.current = setTimeout(async () => {
      // Abort previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();
      
      setIsAnalyzing(true);

      try {
        const response = await fetch("/api/reviews/detect-conflict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            reviewText,
            rating,
            businessType
          }),
          signal: abortControllerRef.current.signal
        });

        if (response.ok) {
          const result = await response.json();
          setConflictDetection(result);
        }
      } catch (error: any) {
        // Don't log abort errors as they are intentional
        if (error.name !== 'AbortError') {
          console.error("Error detecting conflicts:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }, debounceMs);
  }, [debounceMs, minTextLength, performClientSideAnalysis]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setConflictDetection(null);
    setClientSidePrediction(null);
    setIsAnalyzing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    conflictDetection,
    clientSidePrediction,
    isAnalyzing,
    detectConflicts,
    cleanup
  };
}