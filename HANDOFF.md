# Ply Shopify Handoff

The static header variants map to a future header section and navigation-style setting. Footer maps to the footer section. Hero maps to an image-banner section. Product cards map to product-card snippets. Product detail maps to main-product. Cart drawer maps to the Ajax Cart API. Filters map to Shopify collection filtering and sorting. Pagination maps to Liquid paginate plus load-more JavaScript.

The current cart uses localStorage as the static stand-in for Ajax Cart. Product JSON stands in for Shopify product and variant data. Reviews stand in for review metafields. The newsletter and contact forms are intentionally UI-only.

Deferred to Shopify phase: Liquid sections/schema, Theme Store compliance, Shopify APIs, localization, checkout and real payment behavior.