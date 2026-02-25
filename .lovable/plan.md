

## Update Umpires Section with External Links

### Problem
The umpire section currently has a single "Sign Up to Learn More" button linking to Blue Sombrero. It needs three links added: a PDF flyer, a Google Form sign-up, and the FVB website.

### Changes

**File: `src/components/UmpiresSection.tsx`**

1. Add `FileText, ExternalLink, ClipboardList` icons from lucide-react
2. Replace the single "Sign Up to Learn More" button with three buttons/links:
   - **Download Flyer** (PDF link) — opens the JVB flyer PDF in a new tab
   - **Sign Up Now** (Google Form) — primary CTA linking to the Google Form
   - **Visit FVB Website** (external link) — links to fvbumpire.com/jvblues
3. Stack them in a flex column or grid layout so they display cleanly on all screen sizes

### Button Layout
```text
┌─────────────────────────────────┐
│  [Sign Up Now]         (hero)   │  ← Google Form (primary CTA)
│  [Download Flyer]    (outline)  │  ← PDF flyer
│  [Visit FVB Website] (outline)  │  ← FVB website
└─────────────────────────────────┘
```

### Scope
- 1 file modified: `src/components/UmpiresSection.tsx`
- Text and link changes only, no database or logic changes

