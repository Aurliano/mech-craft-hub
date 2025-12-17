/**
 * Root index route - redirects to public home
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(public)/index" />;
}
