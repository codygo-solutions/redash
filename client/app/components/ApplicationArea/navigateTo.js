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
      /*
        if we are running in an iframe,
        and the parent is a dashboard link,
        and the url we want to visit is also a dashboard link, belonging to the same domain as the parent,
        we extract the dashboard id from the url we want to visit, and append it to the parent url, and open that link

        For example, we are on the page https://app.addressable.com/dashboards/a,
        and the url we want to visit is https://app.addressable.com/dashboards/b,
        because they are both dashboard links with the same domain, we extract b from the url
        and we open up https://app.addressable.com/dashboards/a/b instead

        Similarly, we are now on page https://app.addressable.com/dashboards/a/b,
        if we click on a link to https://app.addressable.com/dashboards/c,
        we open up https://app.addressable.com/dashboards/a/b/c instead
      */
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
