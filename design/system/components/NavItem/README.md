# NavItem

A sidebar link to a view or a project: an icon or project dot, then the name.

- 44px tall, `ink-soft` text. The current view has `aria-current="page"`, lifting onto `surface` with `shadow-raised`.
- Views use line icons; projects use their 10px `*-dot` instead of an icon.
- The sidebar is `sidebar-width` (248px) and stacks above content below 820px; it is never sticky.
