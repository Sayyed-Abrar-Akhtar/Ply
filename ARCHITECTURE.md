# Ply Architecture

Plain HTML, CSS and vanilla JavaScript. No framework, Liquid or Shopify in this phase.

Pages: index.html, collection.html, product.html, cart.html, wishlist.html, contact.html, 404.html and password.html.

Shared runtime UI: header with classic/hamburger/mega variants, mobile navigation, footer, cart drawer, wishlist state, quick add, filters, sorting and pagination.

Product records live in data/products.json. Header variants switch with ?header=classic, ?header=hamburger or ?header=mega. Pagination is switchable in the collection page between numbered and load-more behavior.

The static interactions model future Shopify mechanics: localStorage cart for Ajax Cart, local-array search for predictive search, product variant arrays for swatches, and product metadata for reviews.