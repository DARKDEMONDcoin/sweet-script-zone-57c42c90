/**
 * Local payment methods across the Arab world.
 *
 * Rendered **only on Arabic landing pages** (`lang === "ar"`) — the rest of the
 * world sees the standard card/wallet copy. Sourced from the payment-method
 * research pass: telecom wallets dominate Egypt, domestic card schemes dominate
 * the GCC, and instant bank rails (CliQ / eFAWATEERcom) dominate Jordan.
 */

export interface LocalPaymentMethod {
  /** Arabic display name — this is the string people actually search for. */
  name: string;
  /** Latin name, used for aria labels and analytics. */
  latin: string;
}

export interface LocalPaymentCountry {
  code: string;
  /** Arabic country name. */
  name: string;
  flag: string;
  methods: LocalPaymentMethod[];
}

export const LOCAL_PAYMENT_COUNTRIES: LocalPaymentCountry[] = [
  {
    code: "EG",
    name: "مصر",
    flag: "🇪🇬",
    methods: [
      { name: "فودافون كاش", latin: "Vodafone Cash" },
      { name: "أورانج كاش", latin: "Orange Cash" },
      { name: "اتصالات كاش", latin: "Etisalat Cash" },
      { name: "وي باي", latin: "WE Pay" },
      { name: "إنستاباي", latin: "InstaPay" },
      { name: "فوري", latin: "Fawry" },
      { name: "أمان", latin: "Aman" },
    ],
  },
  {
    code: "SA",
    name: "السعودية",
    flag: "🇸🇦",
    methods: [
      { name: "مدى", latin: "mada" },
      { name: "STC Pay", latin: "STC Pay" },
      { name: "Apple Pay", latin: "Apple Pay" },
      { name: "تحويل بنكي", latin: "Bank transfer" },
    ],
  },
  {
    code: "AE",
    name: "الإمارات",
    flag: "🇦🇪",
    methods: [
      { name: "بطاقات محلية", latin: "Local cards" },
      { name: "Apple Pay", latin: "Apple Pay" },
      { name: "تحويل بنكي", latin: "Bank transfer" },
    ],
  },
  {
    code: "KW",
    name: "الكويت",
    flag: "🇰🇼",
    methods: [
      { name: "كي‑نت", latin: "KNET" },
      { name: "تحويل بنكي", latin: "Bank transfer" },
    ],
  },
  {
    code: "QA",
    name: "قطر",
    flag: "🇶🇦",
    methods: [
      { name: "نابس", latin: "NAPS" },
      { name: "كيو باي", latin: "QPay" },
    ],
  },
  {
    code: "BH",
    name: "البحرين",
    flag: "🇧🇭",
    methods: [
      { name: "بنفت", latin: "BENEFIT" },
      { name: "بنفت باي", latin: "BenefitPay" },
    ],
  },
  {
    code: "OM",
    name: "عُمان",
    flag: "🇴🇲",
    methods: [
      { name: "عمان نت", latin: "OmanNet" },
      { name: "تحويل بنكي", latin: "Bank transfer" },
    ],
  },
  {
    code: "JO",
    name: "الأردن",
    flag: "🇯🇴",
    methods: [
      { name: "كليك", latin: "CliQ" },
      { name: "إي فواتيركم", latin: "eFAWATEERcom" },
    ],
  },
  {
    code: "MA",
    name: "المغرب",
    flag: "🇲🇦",
    methods: [
      { name: "تحويل بنكي", latin: "Bank transfer" },
      { name: "بطاقات محلية", latin: "Local cards" },
    ],
  },
  {
    code: "DZ",
    name: "الجزائر",
    flag: "🇩🇿",
    methods: [
      { name: "تحويل بنكي", latin: "Bank transfer" },
      { name: "الدهبية / CIB", latin: "Edahabia / CIB" },
    ],
  },
  {
    code: "IQ",
    name: "العراق",
    flag: "🇮🇶",
    methods: [
      { name: "زين كاش", latin: "Zain Cash" },
      { name: "آسيا حوالة", latin: "AsiaHawala" },
    ],
  },
];

/** Flat, de-duplicated list of Arabic payment names — used in meta keywords. */
export const LOCAL_PAYMENT_NAMES: string[] = Array.from(
  new Set(LOCAL_PAYMENT_COUNTRIES.flatMap((c) => c.methods.map((m) => m.name))),
);

export const LOCAL_PAYMENTS_HEADING = "ادفع بطريقتك — فودافون كاش وكل وسائل الدفع المحلية";
export const LOCAL_PAYMENTS_SUBHEAD =
  "مش محتاج فيزا ولا بطاقة ائتمان. اشترك في Megsy AI بفودافون كاش، إنستاباي، أورانج كاش، اتصالات كاش، فوري، مدى، STC Pay، كي‑نت وغيرها من وسائل الدفع المحلية في الوطن العربي.";
