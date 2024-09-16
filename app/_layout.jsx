// app/_layout.jsx
import { Stack, useRouter, useSegments } from 'expo-router';
import CustomNavbar from './components/CustomNavbar';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  
  const showNavbar = !(segments.includes('login') || segments.includes('register') || segments.length === 0);

  return (
    <>
      <Stack />
      {showNavbar && <CustomNavbar />}
    </>
  );
}
