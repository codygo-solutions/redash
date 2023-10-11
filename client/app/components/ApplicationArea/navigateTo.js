import location from "@/services/location"
import url from "@/services/url"
import { stripBase } from "./Router"

// When `replace` is set to `true` - it will just replace current URL
// without reloading current page (router will skip this location change)
export default function navigateTo(href, replace = false, target = undefined) {
  // Allow calling chain to roll up, and then navigate
  setTimeout(() => {
    const isExternal = stripBase(href) === false;
    if (isExternal) {
      const isIframe = window.self !== window.top;
      const parentLocation = new URL(isIframe ? document.referrer : document.location.href);
      const urlLocation = new URL(href);
      const dashboardRegex = /\/dashboards\/(.*?)$/;
      const parentMatch = dashboardRegex.exec(parentLocation.pathname);
      const urlMatch = dashboardRegex.exec(urlLocation.pathname);
      if (parentMatch && urlMatch && parentLocation.origin === urlLocation.origin) {
        const id = urlMatch[1]
        return window.open(`${parentLocation.href}/${id}`, target)
      }
      window.open(href, target);
      return;
    }
    href = url.parse(href);
    location.update(
      {
        path: href.pathname,
        search: href.search,
        hash: href.hash,
      },
      replace
    );
  }, 10);
}
