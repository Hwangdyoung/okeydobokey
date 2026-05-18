'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

type User = {
  id: string;
  email: string;
  nickname: string;
} | null;

interface AuthContextType {
  localUser: User;
  setLocalUser: (user: User) => void;
  isLoggedIn: boolean;
  logout: () => void;
  currentNickname: string;
  currentEmail: string;
  supabaseUser: any | null;
}

const AuthContext = createContext<AuthContextType>({
  localUser: null,
  setLocalUser: () => {},
  isLoggedIn: false,
  logout: () => {},
  currentNickname: '',
  currentEmail: '',
  supabaseUser: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const [localUser, setLocalUser] = useState<User>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로드 시 로컬 스토리지에서 유저 정보 확인 및 Supabase 세션 구독
  useEffect(() => {
    const storedUser = localStorage.getItem('okeybokey_currentUser');
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
    setIsInitialized(true);

    // Supabase 세션 체크
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로컬 유저 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    if (isInitialized) {
      if (localUser) {
        localStorage.setItem('okeybokey_currentUser', JSON.stringify(localUser));
      } else {
        localStorage.removeItem('okeybokey_currentUser');
      }
    }
  }, [localUser, isInitialized]);

  const isSocialLoggedIn = supabaseUser !== null;
  const isLoggedIn = (localUser !== null) || isSocialLoggedIn;

  const currentNickname = isSocialLoggedIn 
    ? supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || 'Social User' 
    : localUser?.nickname || 'Default_Rapper';
    
  const currentEmail = isSocialLoggedIn 
    ? supabaseUser?.email || '' 
    : localUser?.email || '';

  const logout = async () => {
    setLocalUser(null);
    localStorage.removeItem('okeybokey_currentUser');
    if (isSocialLoggedIn) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ localUser, setLocalUser, isLoggedIn, logout, currentNickname, currentEmail, supabaseUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
