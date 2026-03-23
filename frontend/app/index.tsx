// Update index.tsx to redirect to splash
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/splash" />;
}
