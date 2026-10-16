# Navigation and contact usability — 16 October 2026

Requested after the cohesive interface release: reach navigation/Wishlist without returning to the top, and keep a quick WhatsApp contact available.

The existing passive public-header scroll listener now delegates to one shared controller in the existing interaction module. Public headers and a portal header/search wrapper remain sticky in their original document flow; downward movement hides them, and 12 px of upward movement brings them back. Menus, search interaction and keyboard focus keep navigation accessible. Tab reveals hidden navigation before its default focus move. No cloned controls, new router, scroll jumps, animation library or second observer is added. Motion respects reduced-motion preferences.

A restrained rectangular WhatsApp PS link uses the already published +971 55 351 1335 contact. It opens WhatsApp with a generic institutional enquiry message, never automatically passing account, basket, patient or clinical information. It stays above the existing mobile request summary and hides behind menus, sheets and mobile input focus. It does not send a message or promise clinical advice. No medicine-use or pharmacology content is introduced; that remains a separate source-backed product-information task.

Browser verification covers mobile/desktop, public and client pages, reduced motion, direction reveal at deep scroll, stable content position, menu-to-Wishlist navigation, request overlay and search focus, correct WhatsApp destination, no request-button overlap and no horizontal overflow. Existing identity/image/price/account/request regression suites remain release gates.

Base production commit: eb369030184f177819b3688ce5afc487bf3c9457. This change is prepared for preview and verification; no additional production release is assumed.
