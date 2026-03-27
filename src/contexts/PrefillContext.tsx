import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Platform } from '@/types';

interface PrefillState {
  primaryPlatform: Platform | null;
  productCategory: string;
  targetBuyer: string;
  brandVoice: string;
  setPrimaryPlatform: (v: Platform | null) => void;
  setProductCategory: (v: string) => void;
  setTargetBuyer: (v: string) => void;
  setBrandVoice: (v: string) => void;
}

const PrefillContext = createContext<PrefillState | undefined>(undefined);

export function PrefillProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [primaryPlatform, setPrimaryPlatform] = useState<Platform | null>(null);
  const [productCategory, setProductCategory] = useState('');
  const [targetBuyer, setTargetBuyer] = useState('');
  const [brandVoice, setBrandVoice] = useState('');

  useEffect(() => {
    if (profile) {
      setPrimaryPlatform(profile.primary_platform || null);
      setProductCategory(profile.product_category || '');
      setTargetBuyer(profile.target_buyer || '');
      setBrandVoice(profile.brand_voice || '');
    }
  }, [profile]);

  return (
    <PrefillContext.Provider value={{
      primaryPlatform, productCategory, targetBuyer, brandVoice,
      setPrimaryPlatform, setProductCategory, setTargetBuyer, setBrandVoice,
    }}>
      {children}
    </PrefillContext.Provider>
  );
}

export function usePrefill() {
  const ctx = useContext(PrefillContext);
  if (!ctx) throw new Error('usePrefill must be used within PrefillProvider');
  return ctx;
}
