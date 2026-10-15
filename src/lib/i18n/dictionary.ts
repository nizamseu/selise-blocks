export const defaultDictionary = {
  "app.name": "Meridian",
  "nav.profile": "Profile",
  "nav.logout": "Log out",
  "auth.welcome": "Welcome back",
  "auth.subtitle": "Sign in to manage your brands.",
  "auth.continue": "Continue",
  "auth.redirecting": "Redirecting...",
  "auth.notConfigured": "Sign-in is not configured yet. Register a public OIDC client and set VITE_BLOCKS_OIDC_CLIENT_ID in .env.",
  "auth.failed": "Sign-in failed",
  "auth.back": "Back to sign in",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.refresh": "Refresh",
  "common.loading": "Loading",
  "common.error": "Something went wrong",
  "profile.title": "Profile",
  "profile.subtitle": "Your account details.",
  "notFound.title": "404",
  "notFound.message": "This page does not exist.",
  "notFound.home": "Back home"
} as const;

export type TranslationKey = keyof typeof defaultDictionary;
