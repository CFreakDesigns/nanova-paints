/* ==========================================================================
   Nanova Paints — Content data (bilingual)
   --------------------------------------------------------------------------
   Every object carries both languages ({ ar, en }) so the UI can re-render
   instantly when the visitor switches language.
   Exposed as a single global: window.NANOVA_DATA
   ========================================================================== */
(function () {
  'use strict';

  /* Unsplash CDN helper — every URL below was verified to return HTTP 200 */
  var img = function (id, w) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 1000) + '&q=80';
  };

  /* ------------------------------------------------------------------------
     PRODUCTS
     coverage = m² per litre per coat (used by the calculator)
     sizes    = can sizes in litres, prices = indicative SAR incl. VAT
     ------------------------------------------------------------------------ */
  var products = [
    {
      id: 'nanoshield',
      cats: ['exterior'],
      color: '#1D8A9E',
      badges: ['bestseller', 'gulf'],
      name: { ar: 'NanoShield', en: 'NanoShield' },
      type: { ar: 'دهان خارجي ذاتي التنظيف', en: 'Self-cleaning exterior paint' },
      short: {
        ar: 'تأثير اللوتس يُبقي الواجهات نظيفة مع كل رشة مطر.',
        en: 'Lotus-effect facades that rinse clean with every rain.'
      },
      desc: {
        ar: 'دهان خارجي أكريليكي معزّز بجسيمات النانو يكوّن سطحًا كارهًا للماء بتأثير ورقة اللوتس، فتتكوّر قطرات المطر وتنزلق حاملةً الغبار معها. صُمّم لتحمّل الغبار والشمس الحارقة وتقلّبات الحرارة في المملكة، مع ثبات عالٍ للّون.',
        en: 'A nano-reinforced acrylic exterior paint that forms a water-repellent, lotus-effect surface: rain beads up and rolls away, taking the dust with it. Engineered for Saudi dust, blazing sun and daily temperature swings, with outstanding color retention.'
      },
      features: [
        { ar: 'تنظيف ذاتي بمياه الأمطار', en: 'Self-cleans with rainwater' },
        { ar: 'متانة حتى 10 سنوات', en: 'Up to 10 years of durability' },
        { ar: 'مقاومة عالية للأشعة فوق البنفسجية والتشقق', en: 'High UV and crack resistance' }
      ],
      finish: { ar: 'مطفي ناعم', en: 'Smooth matte' },
      coverage: 10,
      dry: { ar: 'ساعة واحدة', en: '1 hour' },
      recoat: { ar: '4 ساعات', en: '4 hours' },
      coats: 2,
      sizes: [18, 3.6],
      prices: { '18': 689, '3.6': 169 },
      surfaces: {
        ar: 'اللياسة الإسمنتية، الخرسانة، الألواح الإسمنتية، الدهانات القديمة السليمة',
        en: 'Cement plaster, concrete, fiber-cement boards, sound existing paint'
      }
    },
    {
      id: 'thermocool-roof',
      cats: ['roof'],
      color: '#E8744F',
      badges: ['gulf'],
      name: { ar: 'ThermoCool Roof', en: 'ThermoCool Roof' },
      type: { ar: 'طلاء عازل للحرارة للأسطح', en: 'Heat-insulating roof coating' },
      short: {
        ar: 'يعكس حرارة الشمس ويقلّل اكتساب الحرارة عبر السقف.',
        en: 'Reflects solar heat and cuts heat gain through the roof.'
      },
      desc: {
        ar: 'طلاء مرن عالي السماكة يجمع بين كرات سيراميكية مجوّفة وصبغات عاكسة لأشعة الشمس. يشكّل غشاءً متّصلًا بلا فواصل يعكس الحرارة ويحمي السقف من التشقّقات وتسرّب المياه.',
        en: 'A high-build elastomeric coating combining hollow ceramic micro-spheres with solar-reflective pigments. It forms a seamless membrane that bounces back heat and protects the roof from cracking and water ingress.'
      },
      features: [
        { ar: 'اكتساب حرارة أقل حتى 40%', en: 'Up to 40% less heat gain' },
        { ar: 'غشاء مرن يغطّي الشقوق الشعرية', en: 'Elastic film bridges hairline cracks' },
        { ar: 'مناسب للخرسانة والأسطح المعدنية', en: 'For concrete and metal roofs' }
      ],
      finish: { ar: 'أبيض عاكس مرن', en: 'Reflective elastomeric white' },
      coverage: 1.5,
      dry: { ar: 'ساعتان', en: '2 hours' },
      recoat: { ar: '6 ساعات', en: '6 hours' },
      coats: 2,
      sizes: [18, 3.6],
      prices: { '18': 749, '3.6': 179 },
      surfaces: {
        ar: 'أسطح الخرسانة، ألواح الصاج المعدنية، أغشية العزل البيتومينية',
        en: 'Concrete roofs, metal sheeting, bituminous membranes'
      }
    },
    {
      id: 'thermocool-facade',
      cats: ['exterior'],
      color: '#D9A441',
      badges: ['new'],
      name: { ar: 'ThermoCool Facade', en: 'ThermoCool Facade' },
      type: { ar: 'دهان خارجي عاكس للحرارة', en: 'Heat-reflective exterior paint' },
      short: {
        ar: 'صبغات عاكسة للأشعة تحت الحمراء تُبقي الجدران أبرد، حتى بالألوان الداكنة.',
        en: 'IR-reflective pigments keep walls cooler — even in deeper shades.'
      },
      desc: {
        ar: 'دهان خارجي بصبغات خاصة تعكس الأشعة تحت الحمراء، فيحافظ على برودة الجدران حتى عند اختيار الألوان المتوسطة والداكنة. خيار مثالي للواجهات المعرّضة للشمس طوال اليوم.',
        en: 'An exterior paint with special pigments that reflect infrared radiation, keeping walls cooler even in mid and deep shades. Ideal for facades that face the sun all day long.'
      },
      features: [
        { ar: 'ألوان أعمق بحرارة أقل', en: 'Deeper colors, less heat' },
        { ar: 'مقاوم للغبار والبهتان', en: 'Dust- and fade-resistant' },
        { ar: 'يحسّن الراحة داخل المبنى', en: 'Improves indoor comfort' }
      ],
      finish: { ar: 'شبه مطفي', en: 'Low sheen' },
      coverage: 10,
      dry: { ar: 'ساعة واحدة', en: '1 hour' },
      recoat: { ar: '4 ساعات', en: '4 hours' },
      coats: 2,
      sizes: [18, 3.6],
      prices: { '18': 629, '3.6': 155 },
      surfaces: {
        ar: 'اللياسة الإسمنتية، الخرسانة، البلوك، الألواح الإسمنتية',
        en: 'Cement plaster, concrete, blockwork, fiber-cement boards'
      }
    },
    {
      id: 'pureguard',
      cats: ['interior', 'specialty'],
      color: '#5B5BD6',
      badges: ['health'],
      name: { ar: 'PureGuard', en: 'PureGuard' },
      type: { ar: 'دهان داخلي مضاد للبكتيريا', en: 'Anti-bacterial interior paint' },
      short: {
        ar: 'تقنية الفضة النانوية للمستشفيات والمدارس وغرف الأطفال.',
        en: 'Nano-silver protection for hospitals, schools and nurseries.'
      },
      desc: {
        ar: 'دهان داخلي بتقنية أيونات الفضة النانوية التي تحدّ من نمو البكتيريا على سطح الطلاء، مع مقاومة عالية للغسيل المتكرّر والمطهّرات الشائعة. الخيار المفضّل للمستشفيات والعيادات والمدارس ودور الحضانة.',
        en: 'An interior paint with nano-silver ion technology that inhibits bacterial growth on the paint film and stands up to frequent washing and common disinfectants. The go-to choice for hospitals, clinics, schools and nurseries.'
      },
      features: [
        { ar: 'يحدّ من نمو البكتيريا على السطح', en: 'Inhibits bacterial growth on the surface' },
        { ar: 'يتحمّل الغسيل والمطهّرات', en: 'Withstands scrubbing and disinfectants' },
        { ar: 'منخفض الرائحة والمركّبات العضوية', en: 'Low odor, low VOC' }
      ],
      finish: { ar: 'مطفي قابل للغسيل', en: 'Washable matte' },
      coverage: 12,
      dry: { ar: '30 دقيقة', en: '30 minutes' },
      recoat: { ar: 'ساعتان', en: '2 hours' },
      coats: 2,
      sizes: [18, 3.6, 1],
      prices: { '18': 579, '3.6': 139, '1': 49 },
      surfaces: {
        ar: 'الجبس، اللياسة الإسمنتية، ألواح الجبس، الدهانات القديمة',
        en: 'Gypsum, cement plaster, drywall, existing paint'
      }
    },
    {
      id: 'aquablock',
      cats: ['interior', 'specialty'],
      color: '#3B82C4',
      badges: [],
      name: { ar: 'AquaBlock', en: 'AquaBlock' },
      type: { ar: 'دهان مقاوم للرطوبة والعفن', en: 'Anti-mold, moisture-resistant paint' },
      short: {
        ar: 'حماية طويلة الأمد من الرطوبة والعفن في الحمّامات والمطابخ.',
        en: 'Lasting protection from damp and mold in bathrooms and kitchens.'
      },
      desc: {
        ar: 'دهان مقاوم للرطوبة بتركيبة نانوية كارهة للماء ومضادّات فطرية تحمي الجدران والأسقف من العفن والتقشّر في البيئات الرطبة، مع سطح نصف لامع يسهل تنظيفه.',
        en: 'A moisture-resistant paint with a water-repellent nano formula and anti-fungal agents that protect walls and ceilings from mold and peeling in humid spaces — in an easy-clean semi-gloss finish.'
      },
      features: [
        { ar: 'يقاوم العفن والفطريات', en: 'Resists mold and mildew' },
        { ar: 'لا يتقشّر مع البخار', en: 'Won’t peel in steamy rooms' },
        { ar: 'سطح سهل التنظيف', en: 'Wipe-clean surface' }
      ],
      finish: { ar: 'نصف لامع', en: 'Semi-gloss' },
      coverage: 11,
      dry: { ar: 'ساعة واحدة', en: '1 hour' },
      recoat: { ar: '3 ساعات', en: '3 hours' },
      coats: 2,
      sizes: [18, 3.6, 1],
      prices: { '18': 549, '3.6': 132, '1': 45 },
      surfaces: {
        ar: 'جدران وأسقف الحمّامات والمطابخ وغرف الغسيل',
        en: 'Bathroom, kitchen and laundry walls and ceilings'
      }
    },
    {
      id: 'ecopure',
      cats: ['interior'],
      color: '#5E9E6E',
      badges: ['eco'],
      name: { ar: 'EcoPure', en: 'EcoPure' },
      type: { ar: 'دهان داخلي صديق للبيئة', en: 'Low-VOC eco interior paint' },
      short: {
        ar: 'تركيبة مائية برائحة خفيفة — عُد إلى غرفتك في اليوم نفسه.',
        en: 'Water-based and low-odor — move back in the same day.'
      },
      desc: {
        ar: 'دهان داخلي مائي بتركيبة منخفضة جدًا من المركّبات العضوية المتطايرة، يمنح لمسة مخملية ناعمة ورائحة خفيفة بالكاد تُلاحظ. مثالي لغرف النوم وغرف الأطفال والمساحات المغلقة.',
        en: 'A water-based interior paint with ultra-low VOC content, a soft velvet finish and a barely-there odor. Perfect for bedrooms, nurseries and enclosed spaces.'
      },
      features: [
        { ar: 'أقل من 50 غ/لتر مركّبات عضوية متطايرة', en: 'Under 50 g/L VOC' },
        { ar: 'رائحة خفيفة وجفاف سريع', en: 'Low odor, fast drying' },
        { ar: 'تغطية ممتازة من طبقتين', en: 'Excellent two-coat hiding' }
      ],
      finish: { ar: 'مطفي مخملي', en: 'Velvet matte' },
      coverage: 12,
      dry: { ar: '30 دقيقة', en: '30 minutes' },
      recoat: { ar: 'ساعتان', en: '2 hours' },
      coats: 2,
      sizes: [18, 3.6, 1],
      prices: { '18': 499, '3.6': 119, '1': 39 },
      surfaces: {
        ar: 'الجبس، ألواح الجبس، اللياسة الإسمنتية، الدهانات القديمة',
        en: 'Gypsum, drywall, cement plaster, existing paint'
      }
    },
    {
      id: 'silkluxe',
      cats: ['interior'],
      color: '#A0527A',
      badges: ['new'],
      name: { ar: 'Silk Luxe', en: 'Silk Luxe' },
      type: { ar: 'دهان داخلي فاخر بلمسة حريرية', en: 'Premium silk-finish interior paint' },
      short: {
        ar: 'لمعة حريرية راقية وسطح نانوي يقاوم البقع ويُمسح بسهولة.',
        en: 'A refined silk sheen with a stain-resistant, wipe-clean nano film.'
      },
      desc: {
        ar: 'دهان داخلي فاخر بلمعة حريرية تعكس الضوء بنعومة، مع طبقة نانوية تقاوم البقع وتسمح بمسح القهوة والأحبار بسهولة. صُمّم للمجالس وصالات الاستقبال والمساحات الراقية.',
        en: 'A premium interior paint with a soft, light-catching silk sheen and a nano film that shrugs off stains — coffee and ink wipe away easily. Made for majlis rooms, lobbies and statement spaces.'
      },
      features: [
        { ar: 'لمعة حريرية متجانسة', en: 'Even, luxurious silk sheen' },
        { ar: 'طبقة نانوية مقاومة للبقع', en: 'Stain-resistant nano film' },
        { ar: 'ألوان غنية وعميقة', en: 'Rich, deep color payoff' }
      ],
      finish: { ar: 'حريري', en: 'Silk' },
      coverage: 13,
      dry: { ar: 'ساعة واحدة', en: '1 hour' },
      recoat: { ar: '3 ساعات', en: '3 hours' },
      coats: 2,
      sizes: [18, 3.6, 1],
      prices: { '18': 649, '3.6': 159, '1': 55 },
      surfaces: {
        ar: 'الجبس، ألواح الجبس، اللياسة الناعمة',
        en: 'Gypsum, drywall, smooth plaster'
      }
    },
    {
      id: 'hydroseal',
      cats: ['specialty', 'roof'],
      color: '#334E86',
      badges: ['pro'],
      name: { ar: 'HydroSeal', en: 'HydroSeal' },
      type: { ar: 'عازل مائي نانوي شفاف', en: 'Clear nano waterproofing sealer' },
      short: {
        ar: 'يتغلغل في المسام ليمنع تسرّب الماء دون أن يغيّر مظهر السطح.',
        en: 'Penetrates pores to stop water ingress without changing the look.'
      },
      desc: {
        ar: 'عازل مائي شفاف بجسيمات نانو تتغلغل في مسام الحجر والخرسانة لتمنع تسرّب الماء والأملاح، مع الحفاظ على تنفّس السطح ومظهره الطبيعي دون أي لمعة.',
        en: 'A clear sealer whose nano-particles penetrate stone and concrete pores to block water and salts, while keeping the surface breathable and its natural look unchanged.'
      },
      features: [
        { ar: 'شفاف تمامًا بعد الجفاف', en: 'Fully invisible when dry' },
        { ar: 'حماية تسمح بتنفّس السطح', en: 'Breathable protection' },
        { ar: 'يحمي من الأملاح والتزهّر', en: 'Guards against salts and efflorescence' }
      ],
      finish: { ar: 'شفاف غير لامع', en: 'Invisible, non-glossy' },
      coverage: 6,
      dry: { ar: 'ساعتان', en: '2 hours' },
      recoat: { ar: '30 دقيقة (رطب على رطب)', en: '30 min (wet-on-wet)' },
      coats: 2,
      sizes: [18, 3.6, 1],
      prices: { '18': 819, '3.6': 199, '1': 69 },
      surfaces: {
        ar: 'الحجر الطبيعي، الطوب، الخرسانة، البلاط الإسمنتي، الأسطح',
        en: 'Natural stone, brick, concrete, cement tiles, roofs'
      }
    }
  ];

  /* ------------------------------------------------------------------------
     COLOR STUDIO — 24 curated colors in 6 families
     ------------------------------------------------------------------------ */
  var colorFamilies = ['whites', 'neutrals', 'earth', 'greens', 'blues', 'bold'];

  var colors = [
    /* Whites */
    { code: 'NV-1001', hex: '#F4F1EA', family: 'whites', name: { ar: 'ضباب اللؤلؤ', en: 'Pearl Mist' } },
    { code: 'NV-1004', hex: '#EEE8DC', family: 'whites', name: { ar: 'طباشير نجدي', en: 'Najdi Chalk' } },
    { code: 'NV-1007', hex: '#F7F6F2', family: 'whites', name: { ar: 'غيمة قطنية', en: 'Cotton Cloud' } },
    { code: 'NV-1010', hex: '#F1E6D2', family: 'whites', name: { ar: 'عاج الكثبان', en: 'Ivory Dune' } },
    /* Neutrals */
    { code: 'NV-2012', hex: '#D9D2C5', family: 'neutrals', name: { ar: 'ضباب الصحراء', en: 'Desert Fog' } },
    { code: 'NV-2015', hex: '#C4BAAB', family: 'neutrals', name: { ar: 'رمادي دافئ', en: 'Warm Greige' } },
    { code: 'NV-2018', hex: '#A39B8F', family: 'neutrals', name: { ar: 'حجر الواحة', en: 'Oasis Stone' } },
    { code: 'NV-2021', hex: '#5F6368', family: 'neutrals', name: { ar: 'غسق الجرافيت', en: 'Graphite Dusk' } },
    /* Earth tones */
    { code: 'NV-3024', hex: '#D8B98C', family: 'earth', name: { ar: 'رمال الصحراء', en: 'Desert Sand' } },
    { code: 'NV-3027', hex: '#C06A4A', family: 'earth', name: { ar: 'طين التيراكوتا', en: 'Terracotta Clay' } },
    { code: 'NV-3030', hex: '#8A5A3C', family: 'earth', name: { ar: 'نخلة التمر', en: 'Date Palm' } },
    { code: 'NV-3033', hex: '#C99A45', family: 'earth', name: { ar: 'أرض الزعفران', en: 'Saffron Earth' } },
    /* Greens */
    { code: 'NV-4036', hex: '#A7B39A', family: 'greens', name: { ar: 'ورق المريمية', en: 'Sage Leaf' } },
    { code: 'NV-4039', hex: '#7C8566', family: 'greens', name: { ar: 'بستان الزيتون', en: 'Olive Grove' } },
    { code: 'NV-4042', hex: '#4F6F5A', family: 'greens', name: { ar: 'أخضر الواحة', en: 'Oasis Green' } },
    { code: 'NV-4045', hex: '#CFE3D6', family: 'greens', name: { ar: 'نسمة النعناع', en: 'Mint Breeze' } },
    /* Blues */
    { code: 'NV-5048', hex: '#9CC3CF', family: 'blues', name: { ar: 'شاطئ الخليج', en: 'Gulf Shore' } },
    { code: 'NV-5051', hex: '#2F7C83', family: 'blues', name: { ar: 'فيروز البحر الأحمر', en: 'Red Sea Teal' } },
    { code: 'NV-5054', hex: '#6C86A6', family: 'blues', name: { ar: 'أزرق الغسق', en: 'Dusk Blue' } },
    { code: 'NV-5057', hex: '#1F2E4A', family: 'blues', name: { ar: 'حبر منتصف الليل', en: 'Midnight Ink' } },
    /* Bold */
    { code: 'NV-6060', hex: '#D48A86', family: 'bold', name: { ar: 'وردة المجلس', en: 'Majlis Rose' } },
    { code: 'NV-6063', hex: '#E0714F', family: 'bold', name: { ar: 'مرجان الغروب', en: 'Sunset Coral' } },
    { code: 'NV-6066', hex: '#6A3E5C', family: 'bold', name: { ar: 'برقوق ملكي', en: 'Royal Plum' } },
    { code: 'NV-6069', hex: '#D6A331', family: 'bold', name: { ar: 'خردل السوق', en: 'Souq Mustard' } }
  ];

  /* ------------------------------------------------------------------------
     CITIES (shared by dealer finder and contact form)
     ------------------------------------------------------------------------ */
  var cities = [
    { id: 'riyadh', name: { ar: 'الرياض', en: 'Riyadh' } },
    { id: 'jeddah', name: { ar: 'جدة', en: 'Jeddah' } },
    { id: 'dammam', name: { ar: 'الدمام', en: 'Dammam' } },
    { id: 'khobar', name: { ar: 'الخبر', en: 'Al Khobar' } },
    { id: 'makkah', name: { ar: 'مكة المكرمة', en: 'Makkah' } },
    { id: 'madinah', name: { ar: 'المدينة المنورة', en: 'Madinah' } },
    { id: 'abha', name: { ar: 'أبها', en: 'Abha' } }
  ];

  /* ------------------------------------------------------------------------
     DEALERS (fictional names & phone numbers)
     ------------------------------------------------------------------------ */
  var H_STD = { ar: 'السبت – الخميس، 9 ص – 10 م', en: 'Sat – Thu, 9 AM – 10 PM' };
  var H_LONG = { ar: 'يوميًا، 9 ص – 11 م', en: 'Daily, 9 AM – 11 PM' };
  var H_EARLY = { ar: 'السبت – الخميس، 7 ص – 9 م', en: 'Sat – Thu, 7 AM – 9 PM' };

  var dealers = {
    riyadh: [
      { flagship: true, name: { ar: 'صالة Nanova الرئيسية', en: 'Nanova Flagship Showroom' }, district: { ar: 'حي العليا، طريق الملك فهد', en: 'Al Olaya, King Fahd Road' }, phone: '0500000011', hours: H_LONG },
      { name: { ar: 'مؤسسة الألوان الحديثة', en: 'Modern Colors Est.' }, district: { ar: 'حي الملقا', en: 'Al Malqa' }, phone: '0500000012', hours: H_STD },
      { name: { ar: 'مركز البناء المتكامل', en: 'Integrated Build Center' }, district: { ar: 'حي السلي', en: 'Al Sulay' }, phone: '0500000013', hours: H_EARLY }
    ],
    jeddah: [
      { flagship: true, name: { ar: 'صالة Nanova – جدة', en: 'Nanova Showroom Jeddah' }, district: { ar: 'حي الروضة، شارع التحلية', en: 'Al Rawdah, Tahlia Street' }, phone: '0500000021', hours: H_LONG },
      { name: { ar: 'دهانات البحر الأحمر', en: 'Red Sea Paints' }, district: { ar: 'حي الصفا', en: 'Al Safa' }, phone: '0500000022', hours: H_STD },
      { name: { ar: 'مؤسسة واجهات جدة', en: 'Jeddah Facades Est.' }, district: { ar: 'حي الحمدانية', en: 'Al Hamdaniyah' }, phone: '0500000023', hours: H_EARLY }
    ],
    dammam: [
      { flagship: true, name: { ar: 'صالة Nanova – الشرقية', en: 'Nanova Showroom Eastern Province' }, district: { ar: 'حي الشاطئ', en: 'Al Shati' }, phone: '0500000031', hours: H_LONG },
      { name: { ar: 'مركز الخليج للدهانات', en: 'Gulf Paint Center' }, district: { ar: 'حي الفيصلية', en: 'Al Faisaliyah' }, phone: '0500000032', hours: H_STD }
    ],
    khobar: [
      { name: { ar: 'ألوان الساحل', en: 'Coastline Colors' }, district: { ar: 'حي العقربية', en: 'Al Aqrabiyah' }, phone: '0500000041', hours: H_STD },
      { name: { ar: 'مؤسسة الواجهة البحرية', en: 'Waterfront Supplies Est.' }, district: { ar: 'حي اليرموك', en: 'Al Yarmouk' }, phone: '0500000042', hours: H_EARLY }
    ],
    makkah: [
      { name: { ar: 'مؤسسة أم القرى للدهانات', en: 'Umm Al-Qura Paints Est.' }, district: { ar: 'حي العزيزية', en: 'Al Aziziyah' }, phone: '0500000051', hours: H_STD },
      { name: { ar: 'مركز الشرائع للبناء', en: 'Al Sharaie Build Center' }, district: { ar: 'حي الشرائع', en: 'Al Sharaie' }, phone: '0500000052', hours: H_EARLY }
    ],
    madinah: [
      { name: { ar: 'دهانات طيبة', en: 'Taibah Paints' }, district: { ar: 'حي قباء', en: 'Quba' }, phone: '0500000061', hours: H_STD },
      { name: { ar: 'مركز العيون للمواد', en: 'Al Uyun Materials Center' }, district: { ar: 'حي العيون', en: 'Al Uyun' }, phone: '0500000062', hours: H_LONG }
    ],
    abha: [
      { name: { ar: 'ألوان الجنوب', en: 'Southern Colors' }, district: { ar: 'حي المنسك', en: 'Al Mansak' }, phone: '0500000071', hours: H_STD },
      { name: { ar: 'مركز السودة للبناء', en: 'Al Soudah Build Center' }, district: { ar: 'حي الخالدية', en: 'Al Khalidiyah' }, phone: '0500000072', hours: H_EARLY }
    ]
  };

  /* ------------------------------------------------------------------------
     PROJECTS (fictional case studies)
     cat: residential | public | commercial
     ------------------------------------------------------------------------ */
  var projects = [
    {
      id: 'villa',
      cat: 'residential',
      img: '1745761320791-5ae142edee8c',
      tint: '#C9B79C',
      title: { ar: 'فيلا النخيل', en: 'Al Nakheel Villa' },
      city: { ar: 'الرياض — حي الملقا', en: 'Riyadh — Al Malqa' },
      products: { ar: 'NanoShield + ThermoCool Roof', en: 'NanoShield + ThermoCool Roof' },
      area: 1250,
      year: 2025,
      alt: { ar: 'فيلا عصرية فاخرة بين أشجار النخيل', en: 'A modern luxury villa surrounded by palm trees' },
      desc: {
        ar: 'فيلا عصرية بواجهات بيضاء نقية وسطح معرّض للشمس طوال اليوم. حافظت الواجهات على بياضها رغم موسمين من العواصف الترابية، وانخفضت حرارة السطح بشكل ملحوظ خلال الصيف.',
        en: 'A contemporary villa with crisp white facades and a roof exposed to full sun. The walls stayed bright white through two dust-storm seasons, and roof temperatures dropped noticeably over the summer.'
      }
    },
    {
      id: 'hospital',
      cat: 'public',
      img: '1777269749032-d8d458ae594d',
      tint: '#BFCAD3',
      title: { ar: 'مركز الشفاء الطبي', en: 'Al Shifa Medical Center' },
      city: { ar: 'الدمام', en: 'Dammam' },
      products: { ar: 'PureGuard', en: 'PureGuard' },
      area: 8400,
      year: 2024,
      alt: { ar: 'ممر مستشفى نظيف بمقاعد وأبواب', en: 'A clean hospital corridor with benches and doors' },
      desc: {
        ar: 'طُليت الممرات وغرف المرضى والعيادات الخارجية بدهان مضاد للبكتيريا يتحمّل التطهير اليومي، مع تنفيذ على مراحل دون إيقاف الخدمة.',
        en: 'Corridors, patient rooms and outpatient clinics finished in an anti-bacterial paint that withstands daily disinfection — delivered in phases without interrupting care.'
      }
    },
    {
      id: 'school',
      cat: 'public',
      img: '1580582932707-520aed937b7b',
      tint: '#C8BBA6',
      title: { ar: 'مدارس الروابي العالمية', en: 'Rawabi International School' },
      city: { ar: 'المدينة المنورة', en: 'Madinah' },
      products: { ar: 'EcoPure + PureGuard', en: 'EcoPure + PureGuard' },
      area: 5600,
      year: 2025,
      alt: { ar: 'فصل دراسي بمقاعد وسبورة', en: 'An empty classroom with desks and a chalkboard' },
      desc: {
        ar: 'فصول دراسية وممرات بدهانات منخفضة الرائحة أُنجزت خلال عطلة الصيف، ليعود الطلاب إلى بيئة صحية بألوان هادئة تساعد على التركيز.',
        en: 'Classrooms and corridors repainted over the summer break with low-odor coatings, so students returned to a healthier space in calm, focus-friendly colors.'
      }
    },
    {
      id: 'tower',
      cat: 'residential',
      img: '1775144463375-bc6b2913fd54',
      tint: '#A9C2D6',
      title: { ar: 'أبراج الكورنيش السكنية', en: 'Corniche Residences' },
      city: { ar: 'جدة — الكورنيش', en: 'Jeddah — Corniche' },
      products: { ar: 'NanoShield + HydroSeal', en: 'NanoShield + HydroSeal' },
      area: 14200,
      year: 2024,
      alt: { ar: 'برجان سكنيان حديثان بشرفات تحت سماء زرقاء', en: 'Modern twin residential towers with balconies against a blue sky' },
      desc: {
        ar: 'برجان سكنيان على الواجهة البحرية يواجهان الرطوبة والأملاح. جمع الحل بين عازل نانوي شفاف ودهان ذاتي التنظيف لتقليل دورات الصيانة المكلفة.',
        en: 'Twin waterfront towers battling humidity and sea salt. A clear nano sealer paired with self-cleaning paint cut down on costly maintenance cycles.'
      }
    },
    {
      id: 'warehouse',
      cat: 'commercial',
      img: '1786913508314-fac8555d5fe9',
      tint: '#B7BEC4',
      title: { ar: 'سطح المركز اللوجستي', en: 'Logistics Hub Roof' },
      city: { ar: 'الرياض — المدينة الصناعية الثانية', en: 'Riyadh — 2nd Industrial City' },
      products: { ar: 'ThermoCool Roof', en: 'ThermoCool Roof' },
      area: 22000,
      year: 2025,
      alt: { ar: 'منظر جوي لمستودع كبير على سطحه ألواح شمسية', en: 'Aerial view of a large warehouse with solar panels on the roof' },
      desc: {
        ar: '22 ألف متر مربع من الأسطح المعدنية طُليت بنظام عاكس للحرارة لخفض درجات الحرارة داخل المستودعات وتخفيف الحمل على أنظمة التبريد.',
        en: '22,000 m² of metal roofing coated with a heat-reflective system to bring down warehouse temperatures and ease the load on cooling.'
      }
    },
    {
      id: 'restaurant',
      cat: 'commercial',
      img: '1544031064-9de80864ade5',
      tint: '#D4C4AE',
      title: { ar: 'مطعم سنابل', en: 'Sanabel Restaurant' },
      city: { ar: 'الخبر', en: 'Al Khobar' },
      products: { ar: 'AquaBlock + Silk Luxe', en: 'AquaBlock + Silk Luxe' },
      area: 900,
      year: 2026,
      alt: { ar: 'صالة مطعم بطاولات وكراسٍ خشبية وجدران بيضاء', en: 'A restaurant dining room with wooden tables and white walls' },
      desc: {
        ar: 'صالة طعام بلمسة حريرية دافئة ومطبخ مركزي محمي من البخار والعفن، بألوان نُسّقت مع هوية المطعم.',
        en: 'A dining hall in a warm silk finish and a central kitchen protected against steam and mold, in colors matched to the restaurant’s identity.'
      }
    }
  ];

  window.NANOVA_DATA = {
    img: img,
    products: products,
    colorFamilies: colorFamilies,
    colors: colors,
    cities: cities,
    dealers: dealers,
    projects: projects
  };
})();
