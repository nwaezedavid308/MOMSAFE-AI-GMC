# MOMSAFE Connect

Mobile-first demonstration of the original three connected applications:
- Mother's app: local-language voice guidance, pregnancy, health checks and support.
- Birth attendant's app: register mothers, record checks and refer to hospital.
- Hospital board: receive referrals, review risk and coordinate care.

The home screen presents all three apps. Each retains its original component workflows. A labelled app switcher makes presentation and exploration easy. Reports and sign-in remain available.

## Run
npm install
npm run dev
Open http://127.0.0.1:3000

npm run lint checks TypeScript. npm run build builds frontend and server.
Live AI requires GEMINI_API_KEY in .env (see .env.example).

## Design system
See design-system/momsafe/README.md, tokens.css, tokens.json and preview.html.
The six supplied palette anchors are preserved. Naming follows Untitled UI public conventions.
The superseded personal dashboard is no longer the application's entry screen.
Icons use Lucide, with labels; no emoji navigation.

## Limits
Inherited demo authentication is not production access control. Registry storage remains inherited server memory/local storage. Existing SOS/USSD screens contain demonstrations; do not assume a real emergency service connection. The Pinterest video could not be reviewed.

## MVP interface rules
Each portal opens on its main task. Supporting details use native keyboard-accessible disclosures:
- Mothers: health check first; other tools in a labelled menu; warning-sign explanations expand individually. Emergency actions stay visible.
- Birth attendants: find/register a mother and start a health check. Contact/family information and edit/history actions expand on demand.
- Hospital: referral queue first; filters, personal details, risk explanation, clinician review and care notes expand on demand. Urgent alerts, vitals and preparation actions stay visible.

## Hospital layout
The hospital uses a full-width, naturally scrolling workspace with Active referrals and Completed tabs. Referral cards show name, risk, pregnancy/community and status. Opening a referral shows a separate case page, with readable vital signs and a care-preparation checklist. Contact details, risk calculations, clinician review, other symptoms, notes and outcomes use expandable sections. Urgent alerts and reported warning signs remain visible. Verified at 375px mobile width.
