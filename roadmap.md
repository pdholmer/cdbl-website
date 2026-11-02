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
- [x] Phase 1: household setup + add player (built in preview Nov 2; D301 typed attestation checked but not stored)
- [x] Phase 2: eligibility engine, draft registrations, placement reviews, split-household privacy (built Nov 2; working values await registrar/board confirmation)
- [ ] Pending test runs (board, end of build): new family + two kids; second family can't see them; split-household contact/medical; conflict review end to end; sign a form, reload, status stays; commissioner cannot read signatures; re-sign after a required new version; real cart lock, help request hold and comp with test families; screens at 390/768/1280 light and dark
- [x] Phase 3: forms and waivers (built Nov 2; five forms carry PLACEHOLDER wording until the league supplies final text)
- [x] Phase 4: fees, discounts, cart total, help-paying holds, comps (built Nov 2; values are working values to confirm)
- [ ] Phase 5: Stripe test checkout + paid status (needs Stripe test key)
- [ ] Phase 6: league office registration views; Household to-dos read real status
- [ ] Phase 7: builder layout on top of real steps
