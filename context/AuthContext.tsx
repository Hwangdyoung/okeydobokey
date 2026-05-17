'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
}

const AuthContext = createContext<AuthContextType>({
  localUser: null,
  setLocalUser: () => {},
  isLoggedIn: false,
  logout: () => {},
  currentNickname: '',
  currentEmail: '',
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<User>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로드 시 로컬 스토리지에서 유저 정보 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('okeybokey_currentUser');
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
    setIsInitialized(true);
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

  const isSocialLoggedIn = status === 'authenticated';
  const isLoggedIn = (localUser !== null) || isSocialLoggedIn;

  const currentNickname = isSocialLoggedIn ? session?.user?.name || 'Social User' : localUser?.nickname || 'Default_Rapper';
  const currentEmail = isSocialLoggedIn ? session?.user?.email || '' : localUser?.email || '';

  const logout = () => {
    setLocalUser(null);
    localStorage.removeItem('okeybokey_currentUser');
  };

  return (
    <AuthContext.Provider value={{ localUser, setLocalUser, isLoggedIn, logout, currentNickname, currentEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
