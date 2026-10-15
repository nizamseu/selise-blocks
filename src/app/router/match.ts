export type MatchResult = { params: Record<string, string> } | undefined;

export function matchPath(pattern: string, pathname: string): MatchResult {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return undefined;

  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart === undefined || pathPart === undefined) return undefined;
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return undefined;
    }
  }
  return { params };
}

export function parseQuery(search: string): URLSearchParams {
  return new URLSearchParams(search);
}
