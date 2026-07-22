/**
 * Industry context for the SAFER assessment.
 * ===========================================
 * Every question and every recommendation is phrased in the language of the
 * respondent's sector. This map is the single source of that context: the
 * standards/regulators they answer to, the words they use for "assets" and
 * "the front line", and the pain points that ring true for them.
 *
 * `matchIndustryContext()` maps the free INDUSTRIES labels (and any free-text
 * industry) onto one of these contexts, falling back to GENERAL for SMEs and
 * anything unrecognised.
 */

export type IndustryKey =
  | "financial"
  | "manufacturing"
  | "logistics"
  | "fnb"
  | "retail"
  | "healthcare"
  | "construction"
  | "professional"
  | "general";

export type IndustryContext = {
  key: IndustryKey;
  /** Short label used in report headings and narrative. */
  label: string;
  /** The standards / regulators this sector is measured against. */
  standards: string;
  /** How this sector refers to its trackable things ("assets", "stock", "shipments"). */
  assetWord: string;
  /** The people who do the daily work. */
  frontline: string;
  /** A concrete, recognisable pain the sector feels — used in question framing. */
  painExample: string;
  /** 4 sector-flavoured primary pain points for the Decision Check. */
  painPoints: string[];
  /** A sector-appropriate first AI use case, referenced in advice. */
  starterUseCase: string;
};

export const INDUSTRY_CONTEXTS: Record<IndustryKey, IndustryContext> = {
  financial: {
    key: "financial",
    label: "Financial services",
    standards: "MAS TRM Guidelines, MAS Cyber Hygiene, PDPA and PCI DSS",
    assetWord: "accounts, cases and controls",
    frontline: "operations, risk and compliance officers",
    painExample: "compiling regulatory evidence and chasing approvals across teams",
    painPoints: [
      "Manual, repetitive compliance and reporting work",
      "Slow, fragmented approvals and case handling",
      "Regulatory / audit evidence is hard to assemble",
      "Fraud, risk or exception reviews don't scale",
    ],
    starterUseCase: "an AI assistant that assembles regulatory evidence and flags exceptions for a human to approve",
  },
  manufacturing: {
    key: "manufacturing",
    label: "Manufacturing & precision engineering",
    standards: "ISO 9001 quality, ISO 45001 safety, lean/OEE and traceability requirements",
    assetWord: "machines, work orders and inventory",
    frontline: "production supervisors and quality engineers",
    painExample: "unplanned downtime and manual quality-inspection paperwork",
    painPoints: [
      "Unplanned downtime and reactive maintenance",
      "Manual quality inspection and defect logging",
      "Inventory / spare-parts inaccuracy",
      "Production planning and scheduling is manual",
    ],
    starterUseCase: "an AI assistant that predicts maintenance needs and drafts quality reports for an engineer to verify",
  },
  logistics: {
    key: "logistics",
    label: "Logistics & supply chain",
    standards: "supply-chain SLAs, customs/trade compliance and safety standards",
    assetWord: "shipments, vehicles and inventory",
    frontline: "dispatchers, warehouse and fleet supervisors",
    painExample: "manual route planning and reconciling inventory across systems",
    painPoints: [
      "Manual route / load planning and scheduling",
      "Inventory or shipment tracking is inaccurate",
      "Delivery exceptions and delays handled reactively",
      "Reconciling data across warehouse / transport systems",
    ],
    starterUseCase: "an AI assistant that optimises routes and flags at-risk deliveries for a dispatcher to action",
  },
  fnb: {
    key: "fnb",
    label: "Food & beverage",
    standards: "SFA food-safety and HACCP requirements, PDPA and halal/quality certifications",
    assetWord: "outlets, stock and orders",
    frontline: "outlet managers and kitchen leads",
    painExample: "demand forecasting, wastage and manual stock counts",
    painPoints: [
      "Demand forecasting and over/under-stocking",
      "Food wastage and manual stock counts",
      "Rostering and labour scheduling is manual",
      "Customer feedback / reviews aren't acted on",
    ],
    starterUseCase: "an AI assistant that forecasts demand and drafts stock orders for an outlet manager to approve",
  },
  retail: {
    key: "retail",
    label: "Retail & eCommerce",
    standards: "PDPA, PCI DSS for payments and consumer-protection rules",
    assetWord: "SKUs, stock and orders",
    frontline: "store and eCommerce operations staff",
    painExample: "demand forecasting, stock-outs and manual customer service",
    painPoints: [
      "Demand forecasting and stock-outs / overstock",
      "Manual, repetitive customer-service queries",
      "Pricing and promotion decisions are guesswork",
      "Customer data is fragmented across channels",
    ],
    starterUseCase: "an AI assistant that drafts customer replies and flags stock risks for a human to confirm",
  },
  healthcare: {
    key: "healthcare",
    label: "Health & medical services",
    standards: "MOH / HCSA licensing, PDPA and clinical-governance requirements",
    assetWord: "patient records, cases and equipment",
    frontline: "clinical and administrative staff",
    painExample: "administrative paperwork and manual scheduling",
    painPoints: [
      "Administrative paperwork and documentation load",
      "Appointment scheduling and no-shows",
      "Patient records fragmented across systems",
      "Manual claims / billing processing",
    ],
    starterUseCase: "an AI assistant that drafts documentation and schedules, with a clinician always approving",
  },
  construction: {
    key: "construction",
    label: "Construction & facilities",
    standards: "BCA / WSH safety requirements and project-compliance standards",
    assetWord: "sites, equipment and work orders",
    frontline: "site supervisors and project managers",
    painExample: "tracking assets across sites and manual progress reporting",
    painPoints: [
      "Asset / equipment tracking across sites",
      "Manual progress and safety reporting",
      "Project scheduling and resource planning",
      "Documentation and compliance evidence",
    ],
    starterUseCase: "an AI assistant that compiles site reports and flags safety or schedule risks for a manager",
  },
  professional: {
    key: "professional",
    label: "Professional services",
    standards: "PDPA and professional / regulatory obligations for your practice",
    assetWord: "clients, matters and documents",
    frontline: "consultants, associates and support staff",
    painExample: "document drafting, research and manual reporting",
    painPoints: [
      "Repetitive document drafting and research",
      "Manual reporting and client updates",
      "Knowledge is locked in people's heads",
      "Billable time lost to admin work",
    ],
    starterUseCase: "an AI assistant that drafts documents and research summaries for a professional to review",
  },
  general: {
    key: "general",
    label: "your business",
    standards: "PDPA and any standards specific to your sector",
    assetWord: "customers, jobs and records",
    frontline: "your front-line team",
    painExample: "repetitive manual work and reporting",
    painPoints: [
      "Repetitive, manual back-office work",
      "Data is fragmented or unreliable",
      "Reporting takes too long",
      "Customer response / service doesn't scale",
    ],
    starterUseCase: "an AI assistant that handles a repetitive task end-to-end, with a human approving the output",
  },
};

/** Map an industry label (from INDUSTRIES, or free text) to a context. */
export function matchIndustryContext(industry?: string): IndustryContext {
  const s = (industry ?? "").toLowerCase();
  if (!s) return INDUSTRY_CONTEXTS.general;
  if (/(financ|bank|insur|fintech|wealth|capital|mas\b)/.test(s)) return INDUSTRY_CONTEXTS.financial;
  if (/(manufactur|precision|engineer|factory|production|industrial)/.test(s)) return INDUSTRY_CONTEXTS.manufacturing;
  if (/(logistic|supply chain|transport|freight|warehous|fleet|shipping)/.test(s)) return INDUSTRY_CONTEXTS.logistics;
  if (/(food|beverage|f&b|f & b|restaurant|cafe|catering|accommodation|hospitality)/.test(s)) return INDUSTRY_CONTEXTS.fnb;
  if (/(retail|ecommerce|e-commerce|commerce|wholesale|shop|store)/.test(s)) return INDUSTRY_CONTEXTS.retail;
  if (/(health|medical|clinic|hospital|patient|pharma|dental|care)/.test(s)) return INDUSTRY_CONTEXTS.healthcare;
  if (/(construct|real estate|facilit|building|property)/.test(s)) return INDUSTRY_CONTEXTS.construction;
  if (/(professional|legal|account|education|consult|law|advisory|it |digital|software|admin)/.test(s)) return INDUSTRY_CONTEXTS.professional;
  return INDUSTRY_CONTEXTS.general;
}
