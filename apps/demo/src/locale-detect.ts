export type DocsLocale = "en" | "es" | "pt";

export function localeFromPathname(pathname: string): DocsLocale {
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    return "es";
  }
  if (pathname === "/pt" || pathname.startsWith("/pt/")) {
    return "pt";
  }
  return "en";
}

export function shouldSkipLocaleDetect(pathname: string): boolean {
  return (
    pathname.startsWith("/playground") ||
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/pagefind") ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

export function preferredBrowserLocale(languages: readonly string[]): DocsLocale {
  for (const lang of languages) {
    const code = lang.split("-")[0]?.toLowerCase();
    if (code === "es") {
      return "es";
    }
    if (code === "pt") {
      return "pt";
    }
  }
  return "en";
}

export function localizedPath(pathname: string, locale: Exclude<DocsLocale, "en">): string {
  if (pathname === "/") {
    return `/${locale}/`;
  }
  return `/${locale}${pathname}`;
}

/** Inline script for Starlight doc pages (static hosting; reads navigator.languages + cookie). */
export function getLocaleDetectScript(): string {
  return `(function(){var c="docs-locale",p=location.pathname;function g(n){var m=document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]*)"));return m?decodeURIComponent(m[1]):null}function s(n,v){document.cookie=n+"="+encodeURIComponent(v)+"; path=/; max-age=31536000; SameSite=Lax"}function u(){if(p==="/es"||p.indexOf("/es/")===0)return"es";if(p==="/pt"||p.indexOf("/pt/")===0)return"pt";return"en"}function b(){var l=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||"en"];for(var i=0;i<l.length;i++){var x=String(l[i]).split("-")[0].toLowerCase();if(x==="es")return"es";if(x==="pt")return"pt"}return"en"}function t(x){if(x==="en")return p;return p==="/"?"/"+x+"/":"/"+x+p}if(p.indexOf("/playground")===0||p.indexOf("/_astro")===0||p.indexOf("/pagefind")===0||/\\.[a-z0-9]+$/i.test(p))return;var cur=u(),saved=g(c);if(cur!=="en"){if(saved!==cur)s(c,cur);return}var target=saved!==null?saved:b();if(target==="en"){if(saved===null)s(c,"en");return}s(c,target);location.replace(t(target))})();`;
}
