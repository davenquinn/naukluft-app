/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {remote} from "electron";

const client_url = remote.getGlobal("BROWSER_SYNC_URL");

if (client_url != null) {
  const current = document.currentScript;
  const script = document.createElement('script');
  script.src = client_url;
  script.async = true;
  current.parentNode.insertBefore(script, current);
}

