# PSC Open Sky — working redesign preview, 27 October 2026

The reference supplies art direction: a photographic cloud hero, restrained pastel surfaces, large regular-weight typography and a deliberate difference between expressive discovery and quiet purchasing controls. PSC retains its own logo, institutional positioning, exact catalogue photography and purchasing workflows. The attached design analysis confirms this hierarchy; its decorative uppercase-label suggestion does not override the user's earlier no-eyebrow preference.

## Implemented

- Homepage rebuilt around the supplied cloud photograph and three existing approved transparent packshots. Subject framing reuses reviewed image bounds. No product pixels, labels or photo bindings changed; no synthetic packaging or new product claims.
- Shared blue, mint, butter and peach surfaces; dark restrained controls; compact single master Menu; coordinated typography and spacing across public pages, customer account and admin workspace.
- Expressive discovery and quiet transactional layouts. Public category navigation expands on demand, rather than forcing a category wall before products. Collection cards and their supplied icons remain available.
- Public catalogue/category search and product details are accessible without sign-in. RFQ entry, request additions and requirement submission require an existing signed-in account. Selected SKU/family/pack/quantity intent crosses sign-in once, into an editable draft; no automatic quotation/order submission. Browser intent expires after 30 minutes.
- Available exact matched retail MRP remains the retail reference. Historical retail benchmarks retain their reference/date qualification. Indicative PSC/contract/public-sell values are no longer presented as storefront standard retail. Issued transaction prices and source/master data remain unchanged. Missing prices remain quotation-led.
- Brief route/menu transitions, staggered hero entrances and restrained hover movement. Reduced-motion preference disables these; no scroll-jacking or endless floating animation.

## Verification and limits

112 route/width cases cover public, customer and admin layouts at 320/390/768/1440px, including catalogue, product details, account orders/documents, repeat purchasing, mail, sales, tasks, settings and onboarding. No page exceptions or horizontal overflow observed. Separate flow checks cover public search, direct RFQ sign-in, exact quantity three and recorded pack across sign-in, and displayed matched MRP. Account transport is isolated; no real commercial data is sent or changed.

Existing buyer, photograph-fit and storefront identity unit tests pass (18 cases); catalogue identity/option regression, four-width buyer journeys and assessment, direction-aware navigation, seven shell/basket build checks also pass. These do not establish real staff usability, a genuine authorized commercial transaction or live identity-provider acceptance. Previous visual/copy assertions that encode the superseded hero or sign-in-to-browse model must follow this new approved brief before a production release; no complete hosted CI/deployment is claimed for this preview.

Public enquiry gating is a browser journey change, not a new server access-control policy. Existing database authorization and quotation privacy controls remain unchanged. Existing approved customer scope is required for private account actions. No new memberships, approvals, supplier messages, source-master edits, price/stock updates, deployments or product evidence approvals were performed.

## Review

Working preview uses an isolated sample account server on localhost4186. Public homepage, customer and admin links are supplied in the private review page. Screenshots and before/after comparisons: outputs/sky_redesign_20261027/Review.html. Source branch: feature/public-catalogue-account-rfq-20261027. Baseline production: 0d58a481717080b4b1a890f56923bb8c9faa795b. This design is not deployed.

## Browser review refinements — 27 October

The catalogue search/type toolbar has a shared rounded surface and the same measured width as the collection strip and product grid. Missing-photo listings retain the normal image viewport with a neutral image-not-available placeholder and existing DHA mapping mark, in public and customer catalogue views. The master Menu contains shopping and role-appropriate account/workspace tasks; public Home, How we work, Workshop and Contact are excluded. Company information remains accessible through the public footer and homepage content.

Targeted isolated browser QA passes 12 role/viewport cases at 320/390/768/1480px: toolbar/card-grid edge equality, 12px outer corners, equal photo slot heights, visible missing-photo placeholders, task-only menu contents, existing customer/admin scope, footer information access, Escape dismissal and no page overflow/runtime exceptions. Preview only.


## Second browser review — public navigation and institutional imagery

The public desktop header again exposes Catalogue, Ready baskets and How we work horizontally, with My account separately. Small screens use one public menu with the same routes, requirement submission and account access; Escape/outside click closes it. Authenticated portal/admin navigation retains the existing role-scoped task menu. This supersedes the preceding public task-only Menu decision; footer information routes remain available.

The homepage keeps its cloud composition and floating entrance/hover motion. Its three existing original photographs now represent the controlled DHA medicines, equipment and consumables categories: sodium chloride ampoules, a pulse oximeter and examination gloves. These are category references linking to the corresponding public category, not new exact-SKU offers, evidence approvals or a claim of sales ranking. No image pixels, product identities or mapping conditions changed.

Compact collection tiles retain their journeys without the three decorative icons. Public card mapping statements sit between the flexible content and shared details action; their top positions are tested across each rendered row, including missing-photo and short-description cards. Existing image placeholders and DHA marks remain.
