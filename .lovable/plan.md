## المشكلة
1. `ResearchDepthDropdown` يسمح للحسابات المجانية باختيار عمق `pro/ultra2x/ultra4x/ultra8x` بدون أي فحص للخطة.
2. `ModelPickerSheet` يفحص الخطة فقط في وضعي `images` و `videos`، بينما نماذج الشات المدفوعة (megsy-pro، megsy-max، GPT-5، Gemini 3 Pro… إلخ) تُختار بحرية.
3. لا يوجد حراسة موحدة على الخادم — يعتمد على واجهة العميل فقط.

## الخطة

### 1) `src/lib/subscriptionGating.ts`
- توسيع `isFreeModel` ليشمل صراحةً: `megsy-lite*`، LTX video، LTX image فقط. أي شيء آخر → مدفوع.
- إضافة `canUseResearchDepth(depth, plan)`: `pro` و `ultra` متاحان مجانًا فقط إذا نُصّ (نبقيهما مجانيين لأن التسعير الحالي يعطي الديب ريسيرش للجميع بحصة يومية)، بينما `ultra2x/4x/8x` للمدفوعين.
- **تصحيح المطلوب من المستخدم:** المستخدم قال "الديب سيرش ال pro يُختار من الحسابات المجانية" ونماذج `Pro` في القائمة هي `ultra2x/4x/8x` (المؤشرة بـ `pro?: boolean`). سنمنع اختيار أي عمق عليه شارة `Pro` من الحسابات المجانية.

### 2) `src/pages/chat/components/ResearchDepthDropdown.tsx`
- استيراد `useUserPlan` + `isPaidUser`.
- عند الضغط على خيار عليه `pro: true` وليس المستخدم مدفوعًا:
  - عرض `toast.error("Upgrade to Starter or higher to use this depth.")`
  - `navigate("/pricing")`
  - عدم استدعاء `setResearchDepth`.
- إضافة شارة قفل مرئية بجانب "Pro" للحسابات المجانية.

### 3) `src/pages/chat/hooks/useChatTier.ts`
- عند تحميل `userPlan`، إذا كان `researchDepth` من الأعماق المدفوعة والمستخدم مجاني → إعادة الضبط إلى `ultra`.

### 4) `src/components/model-picker/ModelPickerSheet.tsx`
- إزالة القيد `(mode === "images" || mode === "videos")` من فحص `handleSelect` — يُطبَّق على كل الأوضاع بما فيها `chat/text`.
- الاعتماد على `isFreeModel(model.id)` من `subscriptionGating` بدل الفحص المحلي `credits === 0` لأن بعض النماذج المدفوعة قد تكون بـ 0 MC ضمن الحصة.

### 5) `src/components/chat/media/MediaModelPickerSheet.tsx`
- نفس المنطق: تطبيق الفحص على كل الأوضاع.

### 6) حراسة الخادم (`src/pages/chat/services/runDeepResearchPlan.ts` + `runChatStreamTurn.ts`)
- إضافة فحص خطة قبل استدعاء `planResearchJob` عندما يكون `researchDepth` مدفوعًا.
- عند اختيار نموذج مدفوع للشات، يرفض الاستدعاء برسالة ترقية.

### 7) اختبار سريع
- تسجيل دخول بحساب مجاني → القائمة `ultra2x` تظهر مقفلة وتوجّه إلى `/pricing`.
- اختيار نموذج شات مدفوع → يوجَّه إلى الترقية.
- التحقق أن ultra و pro يعملان مجانًا (السلوك المسموح حاليًا).

## ملاحظة
تحديد "ما هو مدفوع" مبني على قائمة `FREE_MODEL_IDS` الحالية (فارغة) + `FREE_IMAGE_MODEL_IDS` + بادئة `megsy-lite`. إذا أردت إضافة نماذج مجانية أخرى (مثل megsy-image الحالي أو نماذج مجانية للشات مثل gemini-flash المجاني) أخبرني بالقائمة الدقيقة قبل التطبيق حتى لا نمنع نماذج تريدها متاحة للمجانيين.
