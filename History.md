1.0.0 / 2014-xx-xx
==================

  * Adds JSHint linter and fixes all warnings.

0.7.0 / 2013-08-12
==================

  * Adds async/defer option to scripts.

0.6.2 / 2012-08-15
==================

  * Added crossorigin attribute to link/script when using asset hosts.

0.6.1 / 2012-08-09
==================

  * Fixed getting inline assets with cache boosters and asset hosts.

0.6.0 / 2012-08-09
==================

  * Added support for asset hosts (-a ... or assetHosts via API).

0.5.0 / 2012-08-07
==================

  * Adds Windows support with all tests fixed.

0.4.0 / 2012-08-03
==================

  * Fallback for path.existsSync in node 0.6.x.
  * Restricting support to node >= 0.6.0.

0.3.1 / 2012-07-04
==================

  * Fixed inline bundles with cache boosters.

0.3.0 / 2012-07-03
==================

  * Added support for new cache boosters created by assets-packager 0.5+.
  * Supports cache boosters via -s option from command line.

0.2.1 / 2012-06-19
==================

  * Fixed link tag for CSS type.

0.2.0 / 2012-06-19
==================

  * Added list mode - include.list(locator) - for getting a flat list of files with mtime.
  * Refactored #group to use #list and some more internals.
  * Added binary list option (-l).

0.1.1 / 2012-06-19
==================

  * Fixed processing absolute paths.

0.1.0 / 2012-06-18
==================

  * First version - expanding unbundled, bundled, and inline assets based on YAML config file.
