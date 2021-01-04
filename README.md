# Miami Library Chrome Extension

Install the extension for Chrome at [the Chrome Web Store](https://chrome.google.com/webstore/detail/auto-library-proxy-access/lgdaghheeajbnnhhjeimkogdifbkalah?hl=en&authuser=0).

## Overview

This is a Chrome extension that automatically rewrites journal URLs to include
the Miami library proxy.

The proxy is:

 * https://access.library.miami.edu

e.g. nature.com would become: nature.com.access.library.miami.edu


NOTE: This extension requires a Cane ID and library proxy access.

## Options

 * Auto Redirect (default: true)
  * Should we automatically redirect the page if it's in a database of known journals ([LIB]-journals.js)?



## Authors
**Mike Rizzo**

Based on by  [WashU Library Chrome Extension](https://github.com/semenko/washu-library-proxy-chrome-extension) by [Nick Semenkovich](https://github.com/semenko/)

## License
Copyright 2019, Mike Rizzo

Released under the MIT License. See LICENSE for details.

Some content (e.g. options.html) is licensed under the Google BSD 3-Clause License:
http://code.google.com/google_bsd_license.html
