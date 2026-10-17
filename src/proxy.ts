import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Redirection de langue uniquement : ce fichier n'est JAMAIS une barrière de
// sécurité (voir docs/security/access-rules.md). L'autorisation vit dans les services.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
