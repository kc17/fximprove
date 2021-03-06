/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EXPORTED_SYMBOLS = ["safeflag"];

var usingPrincipal = false;

try {
  Components.utils.import("resource://gre/modules/Services.jsm");
  usingPrincipal = Services.vc.compare(Services.appinfo.version, "16.*") > 0;
} catch(e) {}

var _listManager = Components.classes["@mozilla.org/url-classifier/listmanager;1"].getService(Components.interfaces.nsIUrlListManager);
var _ucdbSvc = Components.classes["@mozilla.org/url-classifier/dbservice;1"].getService(Components.interfaces.nsIUrlClassifierDBService);

var safeflag = {
  lookup: function(url, callback) {
    function lookupCallback(tableName) {
      if (typeof callback == "function") {
        callback({
          isMalware: tableName == "goog-malware-shavar" || tableName == "googpub-malware-shavar",
          isPhishing: tableName == "goog-phish-shavar" || tableName == "googpub-phish-shavar"
        });
      }
    }

    if (usingPrincipal) {
      url = Services.scriptSecurityManager.getNoAppCodebasePrincipal(Services.io.newURI(url, null, null));
      try {
        _ucdbSvc.lookup(url, lookupCallback);
      } catch(e) {
        lookupCallback("");
      }
    } else {
      _listManager.safeLookup(url, lookupCallback);
    }
  }
};
