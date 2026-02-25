# Openomics

## Current State

The app is a tokenomics consulting portfolio and calculator platform with the following features:
- Internet Identity authentication
- Admin/user approval system with 7-day time-based access
- Tokenomics calculator with allocation categories, vesting schedules, and unlock timelines
- Save/load session functionality for tokenomics configurations
- CSV and PDF export capabilities
- Visual charts (pie chart, vesting timeline chart) and data tables

**Current Issues:**
1. Branding inconsistency: "TokenomicsIQ" is still displayed in several places (Navigation, Footer, LoginPage, ApprovalStatusScreen) instead of "Openomics"
2. Load session export bug: After selecting a saved session in the LoadSessionModal and clicking "Load Session", nothing happens. The modal doesn't trigger export options.
3. Admin authentication regression: After Internet Identity login, the admin user (principal: `q3syc-vqmgp-nwaeb-rw7fw-xuz23-y5jv7-snkfo-dzkdq-4ycxg-3r2wi-oqe`) is being treated as a regular user/guest and sees the "Pending Approval" screen instead of being recognized as admin.

## Requested Changes (Diff)

### Modify

**Branding (Frontend Components)**
- `Navigation.tsx` line 90: Change "TokenomicsIQ" → "Openomics"
- `Footer.tsx` line 18: Change "TokenomicsIQ" → "Openomics"  
- `Footer.tsx` line 23: Change "TokenomicsIQ" → "Openomics"
- `LoginPage.tsx` line 38: Change "TokenomicsIQ" → "Openomics"
- `ApprovalStatusScreen.tsx` line 69: Change "TokenomicsIQ" → "Openomics"

**Load Session Export Flow (LoadSessionModal.tsx)**
- Current behavior: Clicking "Load Session" button after selecting a session calls `handleLoad()`, which loads the session data into the calculator and closes the modal
- New behavior: Clicking "Load Session" button after selecting a session should:
  1. Load the session data
  2. Show an export options dialog/popup with "Export as CSV" and "Export as PDF" buttons
  3. Allow the user to export directly without needing to view the calculator first

**Admin Authentication**
- Review and fix the authentication flow in `AuthGuard.tsx`, `ApprovalGuard.tsx`, and admin-related hooks to ensure the hardcoded admin principal (`q3syc-vqmgp-nwaeb-rw7fw-xuz23-y5jv7-snkfo-dzkdq-4ycxg-3r2wi-oqe`) is always recognized correctly after Internet Identity login
- Ensure query cache invalidation doesn't inadvertently clear admin status

### Add

**Export Modal Component**
- New dialog component that shows after "Load Session" button click
- Contains two export buttons: "Export as CSV" and "Export as PDF"
- Uses existing `exportPDF` and `exportCSV` utilities
- Should work with session data directly from the LoadSessionModal context

### Remove
None

## Implementation Plan

1. **Branding Update** (Frontend)
   - Find and replace all instances of "TokenomicsIQ" with "Openomics" in:
     - `src/frontend/src/components/Navigation.tsx`
     - `src/frontend/src/components/Footer.tsx`
     - `src/frontend/src/components/LoginPage.tsx`
     - `src/frontend/src/components/ApprovalStatusScreen.tsx`

2. **Load Session Export Flow** (Frontend)
   - Modify `LoadSessionModal.tsx`:
     - Add state for showing export dialog after session selection
     - When "Load Session" button is clicked with a selected session:
       - Call `onLoad` to load session data into calculator
       - Show an export options dialog with CSV and PDF buttons
     - Wire up CSV export using `exportCSV` utility with session data
     - Wire up PDF export using `exportPDF` utility with session data
     - Ensure exports generate full visual output (charts, tables, timeline, summary)

3. **Admin Authentication Fix** (Frontend)
   - Review `useInternetIdentity` hook to ensure identity persists after login
   - Review `useIsAdmin` hook to verify admin principal check logic
   - Ensure `ApprovalGuard` component correctly checks admin status
   - Add defensive checks to prevent queryClient.clear() from breaking admin status
   - Verify hardcoded admin principal is correctly compared against authenticated principal

4. **Testing & Validation**
   - Verify all branding changes display "Openomics"
   - Test load session → export flow with saved sessions
   - Test admin login to ensure no "Pending Approval" screen appears
   - Verify CSV export has properly formatted data
   - Verify PDF export contains all visual elements

## UX Notes

- **Branding**: "Openomics" should be consistent across all user-facing text
- **Export Flow**: Export modal should appear immediately after selecting a session and clicking "Load Session", allowing direct export without loading into calculator first
- **Admin Recognition**: Admin users should never see "Pending Approval" screen after successful login
- **Export Quality**: Both CSV and PDF exports must match the calculator's visual quality (charts with colors, formatted numbers with M/B suffixes, proper labels)
