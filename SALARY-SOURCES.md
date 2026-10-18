# Where the salary figures come from

Researched October 2026. Every number in `netlify/lib/market.mjs` comes from
here. **Read the warnings before you quote any of this publicly.**

## How the figures were chosen

Indian reported-salary sites (AmbitionBox, Payscale India, Glassdoor India,
Indeed India) were preferred over job-advertisement estimates, and both were
preferred over career-coaching blogs.

**Training institutes and course sellers were deliberately excluded as sources.**
Their published figures run roughly 1.5–2× above measured data in the three-to-ten
year bands, and several carry disclaimers admitting the numbers are estimates.
They also sell courses into these careers, so they have a direct interest in the
figures looking good. If your numbers ever look low next to a competitor's, this
is usually why — and being the honest one is the stronger position.

## Confidence ratings, and what they mean on the page

Each role carries a `confidence` value, shown to buyers in plain words.

| Rating | Roles | Meaning |
|---|---|---|
| `good` | Pharmacovigilance, Medical Writing, Customer Success, Data Analytics, Sales | Two or more independent measured sources agree |
| `moderate` | Clinical Research, Product Operations, Healthcare Operations, Healthcare Marketing, Healthcare Consulting | One decent sample, or sources disagree |
| `thin` | Medical Affairs, Product Management | Small samples or inference — the page says so |

## Known weaknesses — be careful with these

1. **Medical Affairs entry pay** is the weakest figure in the set. The reported
   samples are tiny, and the people reporting "0–1 years" as a field medical
   scientist usually have prior clinical or pharma experience. Office-based
   medical affairs figures rest largely on unattributed blogs.
2. **Product Management entry pay** describes campus-recruited graduates at
   funded companies, not clinical graduates entering from outside. The product
   says this plainly in its reality check, which matters more than the number.
3. **Five-plus-year figures** are the weakest band everywhere. Most Indian
   sources stop reporting by year four to six.
4. **No Kerala figures exist** for any of these roles. Expect materially below
   Bengaluru, Delhi NCR and Mumbai. Magnitude unknown.
5. **Global versus domestic employers** is the single biggest hidden variable.
   At identical experience, a global contract research organisation or
   multinational pays roughly 1.5–2.5× an Indian company or hospital. Where this
   matters most, the role's `note` says so.

## The degree-access findings

These are better evidenced than the salary figures, because they come from
actual employer job advertisements rather than aggregators. They are probably
the most valuable thing in the product.

- **Field medical roles are effectively closed to BAMS and BHMS graduates at
  multinationals.** Two major pharma companies' advertisements list MBBS, MD,
  BDS, MDS and PharmD. No advertisement found names BAMS or BHMS, and a
  dedicated BHMS career guide omits medical affairs entirely. The product warns
  about this rather than letting someone waste months.
- **Pharmacovigilance medical review roles require a medical degree and pay
  more than case processing.** This is the strongest pharmacovigilance entry
  point for anyone with a clinical qualification, and it is not widely known.
- **"Clinical Research Associate" is usually not an entry job in India.** The
  real doors are trial assistant, data associate and site coordinator.
- **Healthcare consulting has a genuine non-MBA door** through healthcare
  analytics firms, which accept health-science degrees directly. The famous
  strategy firms effectively require a business degree.
- **Customer success is the one role where a clinical degree is a clear
  advantage** rather than something to explain away.

## Updating this

Salary data ages. Re-check once a year. When you update
`netlify/lib/market.mjs`, run `npm test` — it checks that every role still has
all four bands, that ranges run low to high, and that pay rises across bands.

If you ever get access to AmbitionBox's full dataset, it is the source your
buyers are most likely to check your numbers against, and it was only partly
reachable during this research.
