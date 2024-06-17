[![Build Status](https://travis-ci.org/ethical-trading-initiative/history.svg?branch=master)](https://travis-ci.org/ethical-trading-initiative/history)

## Development

```bash
gulp
```

## Deploy

```bash
gulp build
gulp deploy
```

Invalidate Cloudfront cache to see changes immediately.

1. Log into AWS Console and go to Cloudfront.
2. Select the distribution for the site.
3. Select the Invalidations tab.
4. Select Create Invalidation.
5. Enter `/*` as the path.
6. Click "Create Invalidation".
7. Wait for the status to change to "Completed".
