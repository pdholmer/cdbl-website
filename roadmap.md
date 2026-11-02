# Email update

- [x] Inventory legacy senders, templates, queue internals, and retained-table contracts.
- [x] Re-render authentication transport and scaffold app-email helper/preview.
- [x] Verify replacement email functions and deploy them.
- [x] Remove replaced legacy queue files and configuration from source only.
- [x] Check final app diagnostics and report review/publish boundary.
# Two-step sign-in
- [x] Fix /two-step/setup and /two-step/verify for signed-in admins in preview (stale session, QR, help message)
- [x] Email-code two-step: Migration A, function, email, screens built
- [ ] Email-code live tests (real code, resend/lock/expiry/trust rules): waiting for Paul to sign in to preview himself
- [ ] Migration B (policies that require two-step): not approved
# Night Game Builder
- [x] Stage 1: signed-in look (fonts, colors, shapes, flat cards, Light/Dark/Device on /account)
- [ ] Stage 3: delete retired tokens and restyle public pages (waiting on Paul)
- [x] Stage 2: textures, flood cards, blue selected states, icon cleanup
- [x] Stage 3 shell: lit header, piping, tab bar, grouped sidebar, Prompt 2 follow-ups
- [x] Prompt 4: sign-in screens restyle + Prompt 3 cleanup
- [ ] Coach My Team tab: waiting on a real team section
- [x] Prompt 4 follow-ups: dark link contrast, inline sign-in errors, edge-bar rescan
- [x] Prompt 5: parent Home (/household) to-dos, flood card, player pickers, steps
- [ ] Household Forms and Pay steps: waiting on a forms/payment data source (shows "Not tracked yet")
# 2027 in-house registration (each phase needs its own "approved"; SQL shown first)
- [ ] Phase 1: household setup + add player (SQL drafted, waiting for approval)
- [ ] Phase 2: registration record + division placement by birth date (needs 2027 cutoff date, clinic details)
- [ ] Phase 3: forms and waivers (needs waiver list and wording)
- [ ] Phase 4: fees, discounts, cart total (needs league decisions 1-6)
- [ ] Phase 5: Stripe test checkout + paid status (needs Stripe test key)
- [ ] Phase 6: league office registration views; Household to-dos read real status
- [ ] Phase 7: builder layout on top of real steps
