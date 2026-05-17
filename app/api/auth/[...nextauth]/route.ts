import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/profile', // 로그인 페이지 커스텀 (우리가 만든 /profile 사용)
  },
  callbacks: {
    async session({ session, token }) {
      // 세션에 추가적인 정보를 넣고 싶을 때 여기서 설정 가능
      return session;
    },
  },
});

export { handler as GET, handler as POST };
