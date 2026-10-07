/* Training Shipping — clickable terms: bilingual dictionary + popup card + auto-linking of terms in text.
 * Any element with data-term="key" opens the card. TS.decorate(root) links known terms inside lessons, emails and documents. */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const T = (en, ar, cat, den, dar, aliases) => ({ en, ar, cat, d: L(den, dar), a: aliases || [] });

  TS.TERM_CATS = {
    party: L('Party', 'طرف'), doc: L('Document', 'مستند'), field: L('Document field', 'خانة في مستند'), route: L('Routing & time', 'المسار والوقت'),
    charge: L('Charge', 'رسم / كلفة'), equip: L('Equipment', 'معدّات'), inco: L('Incoterm', 'شرط تسليم'), customs: L('Customs', 'جمارك'),
    acc: L('Accounting', 'محاسبة'), pay: L('Payment', 'دفع'), safety: L('Safety & rules', 'سلامة وأنظمة'),
  };

  TS.TERMS = {
    /* ---------- parties ---------- */
    shipper: T('Shipper', 'الشاحن', 'party', 'The exporter who hands the goods to the carrier and is named as shipper on the B/L. Also called consignor.', 'المصدّر الذي يسلّم البضاعة للناقل ويُذكر كشاحن على بوليصة الشحن. يُسمّى أيضًا المرسِل.', ['Shipper', 'Consignor', 'الشاحن']),
    consignee: T('Consignee', 'المرسل إليه', 'party', 'The party entitled to receive the goods at destination, named on the B/L. “To order” means the goods go to whoever holds the endorsed original.', 'الطرف الذي يحقّ له استلام البضاعة في الوجهة، ويُذكر على البوليصة. «لأمر» تعني أن البضاعة تُسلَّم لحامل الأصل المظهَّر.', ['Consignee', 'المرسل إليه']),
    notify: T('Notify party', 'الطرف المُخطَر', 'party', 'The party the carrier informs when the vessel arrives — usually the buyer or its customs broker. It has no right to the goods by itself.', 'الطرف الذي يبلغه الناقل بوصول الباخرة — غالبًا المشتري أو مخلّصه. لا يملك بحدّ ذاته حقًّا في البضاعة.', ['Notify party', 'Notify Party', 'Also notify', 'الطرف المُخطَر']),
    carrier: T('Carrier (shipping line)', 'الناقل (الخط الملاحي)', 'party', 'The company that operates the vessel and issues the master B/L: e.g. CMA CGM, MSC, Maersk.', 'الشركة التي تشغّل الباخرة وتصدر البوليصة الرئيسية: مثل CMA CGM وMSC وميرسك.', ['Carrier', 'shipping line', 'الخط الملاحي', 'الناقل']),
    forwarder: T('Freight forwarder', 'وكيل الشحن', 'party', 'Organises transport for the client: buys space from lines, trucks, customs, documents, insurance, and resells them as a service.', 'ينظّم النقل لصالح الزبون: يشتري المساحة من الخطوط والنقل البري والجمارك والمستندات والتأمين ويعيد بيعها كخدمة.', ['Freight forwarder', 'forwarder', 'Forwarding agent', 'وكيل الشحن']),
    nvocc: T('NVOCC', 'ناقل لا يملك سفنًا (NVOCC)', 'party', 'Non-Vessel Operating Common Carrier: a forwarder that issues its own house B/L and acts as carrier to the shipper without owning ships.', 'ناقل عام لا يشغّل سفنًا: وكيل شحن يصدر بوليصته الخاصة (HBL) ويعمل كناقل تجاه الشاحن بدون امتلاك سفن.', ['NVOCC']),
    agent: T('Overseas agent', 'الوكيل في الخارج', 'party', 'Your partner forwarder at the other end (origin agent or destination agent). Handles the local side and the release of your house B/Ls.', 'شريكك وكيل الشحن في الطرف الآخر (وكيل المنشأ أو الوجهة). يتولّى العمل المحلي والإفراج عن بوالصك.', ['origin agent', 'destination agent', 'Delivery agent']),
    broker: T('Customs broker', 'المخلّص الجمركي', 'party', 'Licensed agent who lodges customs declarations on behalf of importers/exporters and is responsible for their accuracy.', 'وكيل مرخّص يقدّم البيانات الجمركية نيابةً عن المستوردين/المصدّرين ويتحمّل مسؤولية صحتها.', ['Customs broker', 'customs broker', 'licensed broker', 'Declarant', 'المخلّص الجمركي', 'مخلّص جمركي']),
    terminal: T('Container terminal', 'محطة الحاويات', 'party', 'The port facility that loads/discharges vessels and stores full containers (gate-in, gate-out, EIR).', 'المرفق المرفئي الذي يحمّل/يفرّغ البواخر ويخزّن الحاويات المعبّأة (دخول، خروج، EIR).', ['terminal', 'Terminal', 'Container Terminal']),
    depot: T('Empty depot', 'مستودع الحاويات الفارغة', 'party', 'Yard where empty containers are stored, released for stuffing and returned after unloading.', 'ساحة تُخزَّن فيها الحاويات الفارغة وتُسحب منها للتعبئة وتُرجع إليها بعد التفريغ.', ['depot', 'Depot', 'empty depot']),
    chamber: T('Chamber of Commerce', 'غرفة التجارة', 'party', 'Issues and certifies certificates of origin (and EUR.1 processing) for exporters.', 'تصدر وتصادق على شهادات المنشأ (ومعاملة EUR.1) للمصدّرين.', ['Chamber of Commerce', 'غرفة التجارة']),

    /* ---------- documents ---------- */
    bl: T('Bill of Lading (B/L)', 'بوليصة الشحن', 'doc', 'The key sea document: receipt for the goods, evidence of the contract of carriage and document of title. Whoever holds an original controls the cargo.', 'المستند البحري الأساسي: إيصال باستلام البضاعة، ودليل على عقد النقل، وسند ملكية. من يحمل الأصل يتحكّم بالبضاعة.', ['Bill of Lading', 'BILL OF LADING', 'B/L', 'B/Ls', 'بوليصة الشحن', 'البوليصة']),
    mbl: T('Master B/L (MBL)', 'البوليصة الرئيسية (MBL)', 'doc', 'B/L issued by the shipping line to the forwarder. Shipper and consignee are usually the two forwarders/agents.', 'بوليصة يصدرها الخط الملاحي لوكيل الشحن. الشاحن والمرسل إليه فيها عادة هما الوكيلان.', ['MBL', 'Master B/L', 'master B/L']),
    hbl: T('House B/L (HBL)', 'بوليصة الوكيل (HBL)', 'doc', 'B/L issued by the forwarder (as NVOCC) to the real shipper. Shows the real seller and buyer.', 'بوليصة يصدرها وكيل الشحن (كناقل NVOCC) للشاحن الفعلي. تُظهر البائع والمشتري الحقيقيين.', ['HBL', 'House B/L', 'HOUSE BILL OF LADING', 'house B/L']),
    obl: T('Original B/L (OBL)', 'البوليصة الأصلية', 'doc', 'Usually a set of 3 originals. One original must be surrendered to release the cargo; the others become void.', 'عادة مجموعة من 3 أصول. يجب تسليم أصل واحد للإفراج عن البضاعة؛ فتصبح البقية لاغية.', ['OBL', 'original B/L', 'ORIGINAL']),
    seaway: T('Sea waybill / express release', 'Seaway bill / إفراج سريع', 'doc', 'Non-negotiable transport document: no originals; the cargo is released to the named consignee on identification.', 'مستند نقل غير قابل للتداول: بدون أصول؛ تُسلَّم البضاعة للمرسل إليه المسمّى بعد التعريف عنه.', ['Seaway bill', 'seaway bill', 'SEAWAY BILL', 'Sea waybill', 'express release']),
    telex: T('Telex release', 'تلكس ريليز', 'doc', 'Originals are surrendered at origin and the destination office is told electronically to release the cargo without paper.', 'تُسلَّم الأصول في المنشأ ويُبلَّغ مكتب الوجهة إلكترونيًا بالإفراج دون أوراق.', ['Telex release', 'telex release', 'تلكس ريليز']),
    switchbl: T('Switch B/L', 'Switch B/L', 'doc', 'A second set of B/Ls issued elsewhere replacing the first, usually to hide the original supplier. High fraud risk — handle with care.', 'مجموعة ثانية من البوالص تصدر في مكان آخر بدل الأولى، غالبًا لإخفاء المورّد الأصلي. خطر احتيال مرتفع.', ['Switch B/L']),
    so: T('Booking confirmation / Shipping Order (SO)', 'تأكيد الحجز / أمر الشحن', 'doc', 'The line’s confirmation of your booking: booking number, vessel, cutoffs, empty pickup authorisation and free time.', 'تأكيد الخط لحجزك: رقم الحجز، الباخرة، المواعيد النهائية، الإذن بسحب الحاوية الفارغة وفترة السماح.', ['Booking confirmation', 'BOOKING CONFIRMATION', 'Shipping Order', 'SO']),
    si: T('Shipping Instructions (SI)', 'تعليمات الشحن', 'doc', 'Your instructions to the line on exactly how to print the B/L: parties, description, weights, marks, freight terms.', 'تعليماتك للخط حول طريقة طباعة البوليصة بالضبط: الأطراف، الوصف، الأوزان، العلامات، شروط الدفع.', ['Shipping Instructions', 'SHIPPING INSTRUCTIONS', 'SI']),
    vgm: T('Verified Gross Mass (VGM)', 'الوزن الإجمالي المُتحقَّق (VGM)', 'doc', 'Certified total weight of the packed container required by SOLAS before loading. Method 1: weigh; Method 2: sum of cargo, packing and tare.', 'الوزن الإجمالي المصدَّق للحاوية المعبّأة، مطلوب وفق SOLAS قبل التحميل. الطريقة 1: الوزن؛ الطريقة 2: مجموع البضاعة والتغليف ووزن الحاوية.', ['VGM', 'Verified Gross Mass', 'VERIFIED GROSS MASS']),
    do: T('Delivery Order (D/O)', 'إذن التسليم', 'doc', 'Release document issued at destination by the line’s agent once charges are paid and the B/L released; needed by customs and the terminal.', 'مستند إفراج يصدره وكيل الخط في الوجهة بعد دفع الرسوم والإفراج عن البوليصة؛ تحتاجه الجمارك والمحطة.', ['Delivery order', 'DELIVERY ORDER', 'D/O', 'إذن التسليم']),
    an: T('Arrival notice', 'إشعار الوصول', 'doc', 'Notice to the consignee before arrival: vessel, ETA, containers and the charges to pay before release.', 'إشعار للمرسل إليه قبل الوصول: الباخرة، موعد الوصول، الحاويات والرسوم الواجب دفعها قبل الإفراج.', ['Arrival notice', 'ARRIVAL NOTICE', 'إشعار الوصول']),
    prealert: T('Pre-alert', 'الإشعار المسبق', 'doc', 'Pack sent by origin to destination right after sailing: B/L copies, invoice, packing list, certificates, container and vessel details.', 'حزمة يرسلها المنشأ إلى الوجهة فور الإبحار: نسخ البوالص، الفاتورة، قائمة التعبئة، الشهادات، تفاصيل الحاوية والباخرة.', ['Pre-alert', 'pre-alert', 'PRE-ALERT']),
    ci: T('Commercial invoice', 'الفاتورة التجارية', 'doc', 'Seller’s invoice to the buyer: goods, quantities, prices, Incoterm, currency. Basis of customs value and duties.', 'فاتورة البائع للمشتري: البضائع والكميات والأسعار وشرط التسليم والعملة. أساس القيمة الجمركية والرسوم.', ['Commercial invoice', 'COMMERCIAL INVOICE', 'الفاتورة التجارية']),
    pl: T('Packing list', 'قائمة التعبئة', 'doc', 'Detail of every package: contents, quantities, net/gross weights, dimensions. Used by customs, warehouse and insurer.', 'تفاصيل كل طرد: المحتوى والكميات والأوزان الصافية/القائمة والمقاسات. تستعملها الجمارك والمستودع وشركة التأمين.', ['Packing list', 'PACKING LIST', 'قائمة التعبئة']),
    coo: T('Certificate of origin (COO)', 'شهادة المنشأ', 'doc', 'Certifies where the goods were made. Issued by a chamber of commerce; a preferential COO (e.g. Arab COO) can reduce import duty.', 'تثبت بلد صنع البضاعة. تصدرها غرفة التجارة؛ وشهادة المنشأ التفضيلية (كالشهادة العربية) قد تخفّض الرسم الجمركي.', ['Certificate of origin', 'CERTIFICATE OF ORIGIN', 'COO', 'شهادة المنشأ']),
    eur1: T('EUR.1 movement certificate', 'شهادة الحركة EUR.1', 'doc', 'Proof of preferential origin under EU agreements (e.g. EU–Lebanon). Lets the EU buyer pay reduced or zero duty.', 'إثبات المنشأ التفضيلي بموجب اتفاقيات الاتحاد الأوروبي (مثل اتفاقية لبنان). يسمح للمشتري الأوروبي بدفع رسم مخفّض أو صفر.', ['EUR.1', 'MOVEMENT CERTIFICATE']),
    healthcert: T('Health certificate', 'الشهادة الصحية', 'doc', 'Official certificate (Ministry of Agriculture in Lebanon) that a food product is fit for consumption — required by many importing countries.', 'شهادة رسمية (وزارة الزراعة في لبنان) بأن المنتج الغذائي صالح للاستهلاك — تطلبها دول مستوردة كثيرة.', ['Health certificate', 'health certificate', 'الشهادة الصحية']),
    manifest: T('Cargo manifest', 'المانيفست', 'doc', 'List of all cargo on a vessel, filed with customs before arrival by the carrier’s agent. The declaration must match it.', 'قائمة بكل البضائع على الباخرة، يقدّمها وكيل الخط للجمارك قبل الوصول. يجب أن يطابقها البيان.', ['manifest', 'Manifest', 'المانيفست']),
    eir: T('Equipment Interchange Receipt (EIR)', 'إيصال تبادل المعدّات (EIR)', 'doc', 'Receipt signed when a container changes hands at a depot or terminal gate, recording date/time, seal and condition (damages).', 'إيصال يوقَّع عند تسليم/استلام الحاوية على بوابة المستودع أو المحطة، يسجّل التاريخ والوقت والختم والحالة (الأضرار).', ['EIR', 'Equipment Interchange Receipt', 'EQUIPMENT INTERCHANGE RECEIPT']),
    pod_proof: T('Proof of delivery (POD)', 'إثبات التسليم', 'doc', 'Document signed by the receiver confirming the goods were delivered (careful: POD also means port of discharge).', 'مستند يوقّعه المستلم يؤكّد تسليم البضاعة (انتبه: POD تعني أيضًا مرفأ التفريغ).', ['proof of delivery', 'Proof of delivery']),
    quotation: T('Quotation', 'عرض السعر', 'doc', 'Your priced offer to the client: route, service, charges line by line, validity and conditions.', 'عرضك المسعّر للزبون: المسار، الخدمة، الرسوم بندًا بندًا، الصلاحية والشروط.', ['Quotation', 'QUOTATION', 'عرض السعر']),
    taxinv: T('Tax invoice', 'الفاتورة الضريبية', 'doc', 'Legal VAT invoice: seller and buyer VAT numbers, sequential number, date, amounts before VAT, VAT rate/amount, total, VAT in LBP.', 'فاتورة قانونية للضريبة: الأرقام الضريبية للبائع والمشتري، رقم متسلسل، تاريخ، المبالغ قبل الضريبة، نسبة وقيمة الضريبة، المجموع، الضريبة بالليرة.', ['Tax invoice', 'TAX INVOICE', 'الفاتورة الضريبية', 'فاتورة ضريبية']),
    creditnote: T('Credit note', 'إشعار دائن', 'doc', 'Document from a supplier reducing an invoice already issued (error, discount, overcharge).', 'مستند من المورّد يخفّض فاتورة سبق إصدارها (خطأ، حسم، زيادة في الفوترة).', ['credit note', 'Credit note', 'إشعار دائن']),
    trkorder: T('Trucking order', 'أمر النقل البري', 'doc', 'Instruction to the trucker: container, pickup, delivery address and time, empty return depot, documents to carry.', 'تعليمات لشركة النقل: الحاوية، مكان الاستلام، عنوان ووقت التسليم، مستودع إرجاع الفارغ، المستندات المطلوبة.', ['Trucking order', 'TRUCKING ORDER']),
    declaration: T('Customs declaration', 'البيان الجمركي', 'doc', 'Formal statement to customs of the goods, their value, origin, classification and the regime requested. Lodged in NAJM by the broker.', 'تصريح رسمي للجمارك عن البضاعة وقيمتها ومنشئها وتصنيفها والنظام المطلوب. يقدّمه المخلّص على نظام نجم.', ['Customs declaration', 'CUSTOMS DECLARATION', 'declaration', 'البيان الجمركي']),
    sad: T('Single Administrative Document layout', 'النموذج الإداري الموحّد', 'doc', 'Standard boxed layout of a customs declaration (numbered boxes 1–54) used by many customs systems. Box numbers help everybody find the same data.', 'التصميم الموحّد للبيان الجمركي (خانات مرقّمة 1–54) المستعمل في أنظمة جمركية كثيرة. أرقام الخانات تساعد الجميع على إيجاد المعلومة نفسها.', ['SAD']),
    assessment: T('Assessment notice', 'إشعار التصفية', 'doc', 'Customs calculation of duties and taxes due on a declaration; paid at the bank before release.', 'احتساب الجمارك للرسوم والضرائب المستحقة على البيان؛ يُدفع في المصرف قبل الإفراج.', ['ASSESSMENT', 'Assessment', 'التصفية']),
    release: T('Customs release', 'الإفراج الجمركي', 'doc', 'Customs authorisation for the goods to leave customs control (import) or be loaded (export).', 'إذن الجمارك بخروج البضاعة من الرقابة الجمركية (استيراد) أو بتحميلها (تصدير).', ['Customs release', 'RELEASED', 'الإفراج الجمركي']),
    jv: T('Journal voucher', 'سند القيد', 'doc', 'Accounting document listing the debit and credit lines of an entry, with reference and approval.', 'مستند محاسبي يعدّد سطور المدين والدائن لقيد ما، مع المرجع والموافقة.', ['Journal voucher', 'JOURNAL VOUCHER']),
    statement: T('Statement of account', 'كشف حساب', 'doc', 'List of a customer’s invoices, payments and balance.', 'لائحة بفواتير الزبون ومدفوعاته ورصيده.', ['Statement of account', 'STATEMENT OF ACCOUNT', 'كشف حساب']),

    /* ---------- B/L & document fields ---------- */
    por: T('Place of receipt', 'مكان الاستلام', 'field', 'Where the carrier takes the cargo into its custody when the transport starts inland (carrier haulage).', 'المكان الذي يستلم فيه الناقل البضاعة عندما يبدأ النقل من الداخل.', ['Place of receipt', 'POR']),
    pol: T('Port of loading (POL)', 'مرفأ التحميل', 'field', 'Port where the cargo is loaded onto the ocean vessel.', 'المرفأ الذي تُحمَّل فيه البضاعة على الباخرة.', ['Port of loading', 'PORT OF LOADING', 'POL', 'مرفأ التحميل']),
    pod: T('Port of discharge (POD)', 'مرفأ التفريغ', 'field', 'Port where the cargo is discharged from the vessel. (POD can also mean proof of delivery — read from context.)', 'المرفأ الذي تُفرَّغ فيه البضاعة من الباخرة. (قد تعني POD أيضًا إثبات التسليم — افهمها من السياق.)', ['Port of discharge', 'PORT OF DISCHARGE', 'POD', 'مرفأ التفريغ']),
    fpod: T('Place of delivery', 'مكان التسليم', 'field', 'Final point where the carrier’s responsibility ends, if beyond the port of discharge.', 'النقطة النهائية التي تنتهي عندها مسؤولية الناقل، إذا كانت أبعد من مرفأ التفريغ.', ['Place of delivery', 'FPOD', 'Final destination']),
    precarriage: T('Pre-carriage by', 'النقل المسبق بواسطة', 'field', 'Transport (truck, barge, feeder) bringing the goods to the port of loading before the main vessel.', 'النقل (شاحنة، قارب، باخرة رديفة) الذي يوصل البضاعة إلى مرفأ التحميل قبل الباخرة الرئيسية.', ['Pre-carriage by']),
    vessel: T('Ocean vessel / voyage', 'الباخرة / الرحلة', 'field', 'Name of the ship and the voyage number of that sailing.', 'اسم السفينة ورقم رحلة ذلك الإبحار.', ['Ocean vessel', 'Vessel / voyage', 'Voyage']),
    marks: T('Marks & numbers', 'العلامات والأرقام', 'field', 'Shipping marks painted/printed on the packages so they can be identified; also container and seal numbers.', 'علامات الشحن المطبوعة على الطرود لتمييزها؛ وأيضًا أرقام الحاويات والأختام.', ['Marks & numbers', 'Marks and numbers', 'MARKS']),
    pkgs: T('Number & kind of packages', 'عدد ونوع الطرود', 'field', 'How many packages and of what type (cartons, pallets, drums). The carrier’s liability limit is often per package.', 'كم طردًا ومن أي نوع (كراتين، طبليات، براميل). حدّ مسؤولية الناقل غالبًا بحسب الطرد.', ['No. of packages', 'Number of packages', 'Kind of packages']),
    desc: T('Description of goods', 'وصف البضاعة', 'field', 'Plain description matching invoice and customs. Vague descriptions (“general cargo”) are refused by many customs.', 'وصف واضح يطابق الفاتورة والجمارك. ترفض جمارك كثيرة الأوصاف الغامضة («بضائع عامة»).', ['Description of goods', 'DESCRIPTION OF GOODS', 'وصف البضاعة']),
    gross: T('Gross weight', 'الوزن القائم', 'field', 'Weight of the goods including packing (not including the container tare).', 'وزن البضاعة مع التغليف (دون وزن الحاوية فارغة).', ['Gross weight', 'GROSS WEIGHT', 'Gross kg', 'Gross mass', 'الوزن القائم']),
    net: T('Net weight', 'الوزن الصافي', 'field', 'Weight of the goods without any packing. Used for customs statistics and some duties.', 'وزن البضاعة بدون أي تغليف. يُستعمل للإحصاءات الجمركية وبعض الرسوم.', ['Net weight', 'Net mass', 'Net kg', 'الوزن الصافي']),
    measurement: T('Measurement (CBM)', 'الحجم (متر مكعّب)', 'field', 'Volume of the cargo in cubic metres.', 'حجم البضاعة بالمتر المكعّب.', ['Measurement', 'MEASUREMENT']),
    prepaid: T('Freight prepaid', 'الشحن مدفوع مسبقًا', 'field', 'Freight paid at origin; the line releases the B/L only after payment.', 'أجرة الشحن تُدفع في المنشأ؛ ولا يُفرج الخط عن البوليصة إلا بعد الدفع.', ['Prepaid', 'PREPAID', 'FREIGHT PREPAID']),
    collect: T('Freight collect', 'الشحن يُدفع عند الوصول', 'field', 'Freight payable at destination; the D/O is released only after payment.', 'أجرة الشحن تُدفع في الوجهة؛ ولا يصدر إذن التسليم إلا بعد الدفع.', ['Collect', 'COLLECT', 'FREIGHT COLLECT']),
    payableat: T('Freight payable at', 'الشحن مستحق الدفع في', 'field', 'Place where the freight must be paid (origin for prepaid, destination for collect).', 'المكان الذي يجب أن يُدفع فيه الشحن (المنشأ للمسبق، الوجهة للمستحق عند الوصول).', ['Freight payable at']),
    originals: T('Number of original B/Ls', 'عدد البوالص الأصلية', 'field', 'Usually THREE (3). Any one original surrendered makes the others void. “0” or “Seaway” means no originals.', 'عادة ثلاثة (3). تسليم أي أصل يجعل البقية لاغية. «0» أو «Seaway» تعني بدون أصول.', ['Number of original B/Ls', 'No. of original B(s)/L', 'Number of originals']),
    issueplace: T('Place and date of issue', 'مكان وتاريخ الإصدار', 'field', 'Where and when the B/L was signed. For letters of credit it must match the credit’s requirements.', 'مكان وتاريخ توقيع البوليصة. في الاعتمادات المستندية يجب أن يطابق شروط الاعتماد.', ['Place and date of issue']),
    onboard: T('Shipped on board date', 'تاريخ الشحن على متن الباخرة', 'field', 'Date the goods were actually loaded — the date banks and buyers check against the contract’s latest shipment date.', 'تاريخ تحميل البضاعة فعليًا — التاريخ الذي يقارنه المصرف والمشتري بآخر موعد شحن في العقد.', ['Shipped on board', 'SHIPPED ON BOARD', 'Laden on board', 'LADEN ON BOARD']),
    slsc: T('Shipper’s load, stow & count', 'تحميل وتستيف وعدّ الشاحن', 'field', 'Clause on FCL B/Ls: the carrier did not see the packing, so it does not guarantee the contents or count.', 'عبارة على بوالص FCL: الناقل لم يشاهد التعبئة، فلا يضمن المحتوى أو العدد.', ["SHIPPER'S LOAD, STOW & COUNT", 'SHIPPER’S LOAD, STOW & COUNT', 'Shipper’s load, stow and count']),
    stc: T('Said to contain (STC)', 'يقال إنها تحتوي', 'field', 'Clause meaning the description is the shipper’s statement, not verified by the carrier.', 'عبارة تعني أن الوصف هو تصريح الشاحن ولم يتحقّق منه الناقل.', ['SAID TO CONTAIN', 'said to contain', 'STC']),
    toorder: T('To order', 'لأمر', 'field', 'Consignee “to order” (or to order of a bank): the B/L is negotiable and the goods go to the holder of the endorsed original.', 'المرسل إليه «لأمر» (أو لأمر مصرف): البوليصة قابلة للتداول وتُسلَّم البضاعة لحامل الأصل المظهَّر.', ['TO ORDER', 'To order', 'to order', 'لأمر']),
    clean: T('Clean B/L', 'بوليصة نظيفة', 'field', 'B/L without remarks about damaged goods or packing. Banks normally require clean B/Ls.', 'بوليصة بدون ملاحظات عن تلف البضاعة أو التغليف. تطلب المصارف عادة بوالص نظيفة.', ['clean B/L', 'Clean B/L', 'apparent good order']),
    bookingno: T('Booking number', 'رقم الحجز', 'field', 'Reference given by the line to your booking: used for empty release, gate-in, SI and VGM.', 'المرجع الذي يعطيه الخط لحجزك: يُستعمل لسحب الفارغ والدخول وSI وVGM.', ['Booking no.', 'Booking number', 'Booking No.', 'رقم الحجز']),
    blno: T('B/L number', 'رقم البوليصة', 'field', 'Unique number of the bill of lading, quoted on every document and payment.', 'الرقم الفريد للبوليصة، يُذكر في كل مستند ودفعة.', ['B/L No.', 'B/L no.', 'B/L number']),
    cntrno: T('Container number', 'رقم الحاوية', 'field', 'ISO 6346: 3-letter owner code + U + 6 digits + check digit (e.g. CMAU 123456 7).', 'ISO 6346: رمز المالك من 3 أحرف + U + 6 أرقام + رقم تحقّق (مثل CMAU 123456 7).', ['Container no.', 'Container No.', 'Container number', 'رقم الحاوية']),
    seal: T('Seal number', 'رقم الختم', 'field', 'Number of the high-security bolt seal fixed on the container doors after stuffing (ISO 17712).', 'رقم الختم عالي الأمان المثبّت على أبواب الحاوية بعد التعبئة (ISO 17712).', ['Seal no.', 'Seal No.', 'Seal number', 'seal', 'رقم الختم']),
    tare: T('Tare weight', 'الوزن الفارغ للحاوية', 'field', 'Weight of the empty container, written on its doors and CSC plate.', 'وزن الحاوية فارغة، مكتوب على أبوابها ولوحة CSC.', ['Tare', 'tare', 'TARE']),
    payload: T('Max payload', 'الحمولة القصوى', 'field', 'Maximum weight of cargo the container is built to carry.', 'أقصى وزن للبضاعة صُممت الحاوية لتحمله.', ['payload', 'Payload', 'Max payload']),
    csc: T('CSC plate', 'لوحة CSC', 'field', 'Safety approval plate (Convention for Safe Containers) showing max gross, tare and inspection validity.', 'لوحة الموافقة على السلامة (اتفاقية الحاويات الآمنة) تُظهر الوزن الأقصى والفارغ وصلاحية الفحص.', ['CSC plate', 'CSC']),
    hscode: T('HS code', 'رمز النظام المنسّق (HS)', 'customs', 'Harmonized System tariff code: 6 digits used worldwide + national digits. Decides duty, licences and statistics.', 'رمز التعرفة في النظام المنسّق: 6 أرقام عالمية + أرقام وطنية. يحدّد الرسم والتراخيص والإحصاءات.', ['HS code', 'HS', 'Commodity code', 'رمز HS']),
    incoterm: T('Incoterms 2020', 'إنكوترمز 2020', 'inco', 'ICC rules (11 terms) deciding who pays which leg and where risk passes from seller to buyer.', 'قواعد غرفة التجارة الدولية (11 شرطًا) تحدّد من يدفع كل مرحلة وأين تنتقل المخاطر من البائع إلى المشتري.', ['Incoterms', 'Incoterm', 'Delivery terms', 'شرط التسليم']),

    /* ---------- routing & time ---------- */
    ts: T('Transshipment (T/S)', 'المسافنة (T/S)', 'route', 'Cargo changes vessel at a hub port (Port Said, Piraeus, Malta…). Delays, congestion and sanctions risk often happen there.', 'نقل البضاعة من باخرة إلى أخرى في مرفأ محوري (بورسعيد، بيرايوس، مالطا…). التأخير والازدحام ومخاطر العقوبات غالبًا هناك.', ['T/S', 'Transshipment', 'transshipment', 'المسافنة']),
    feeder: T('Feeder vessel', 'الباخرة الرديفة', 'route', 'Small ship connecting a local port with a transshipment hub.', 'سفينة صغيرة تربط مرفأ محليًا بمرفأ مسافنة محوري.', ['feeder', 'Feeder', 'connecting vessel']),
    etd: T('ETD', 'الموعد المقدّر للمغادرة', 'route', 'Estimated time of departure. It moves — never promise it as a fact.', 'الموعد المقدّر لمغادرة الباخرة. يتغيّر — لا تعِد به كحقيقة.', ['ETD']),
    eta: T('ETA', 'الموعد المقدّر للوصول', 'route', 'Estimated time of arrival. Always say “estimated”.', 'الموعد المقدّر لوصول الباخرة. قل دائمًا «تقديري».', ['ETA']),
    atd: T('ATD / ATA', 'المغادرة / الوصول الفعلي', 'route', 'Actual time of departure / arrival — the confirmed facts.', 'الموعد الفعلي للمغادرة / الوصول — الوقائع المؤكدة.', ['ATD', 'ATA']),
    erd: T('ERD — earliest receiving date', 'أبكر تاريخ استلام (ERD)', 'route', 'First day the terminal accepts your full container for a given vessel.', 'أول يوم تقبل فيه المحطة حاويتك المعبّأة لباخرة معيّنة.', ['ERD']),
    cutoff: T('Cutoff', 'الموعد النهائي', 'route', 'Hard deadline: SI cutoff, VGM cutoff, CY (port) cutoff, documentation cutoff. Miss it and the container is rolled.', 'موعد حاسم: موعد SI، موعد VGM، موعد CY (المرفأ)، موعد المستندات. إذا فاتك تُنقل الحاوية إلى باخرة لاحقة.', ['cutoff', 'Cutoff', 'CUTOFF', 'cut-off', 'SI cutoff', 'VGM cutoff', 'CY cutoff', 'CY cut', 'Doc cutoff', 'الموعد النهائي']),
    cy: T('CY — container yard', 'ساحة الحاويات (CY)', 'route', 'Terminal yard. CY cutoff = last moment the full box must be inside the terminal.', 'ساحة المحطة. موعد CY = آخر لحظة يجب أن تكون فيها الحاوية المعبّأة داخل المحطة.', ['CY']),
    transit: T('Transit time', 'مدة النقل', 'route', 'Port-to-port sailing time, usually excluding inland legs and clearance.', 'مدة الإبحار من مرفأ إلى مرفأ، عادة دون النقل الداخلي والتخليص.', ['Transit time', 'transit time', 'مدة النقل']),
    rolled: T('Rolled / roll-over', 'التأجيل إلى باخرة لاحقة', 'route', 'Container not loaded on the booked vessel and moved to a later one (missed cutoff, overbooking).', 'حاوية لم تُحمَّل على الباخرة المحجوزة ونُقلت إلى باخرة لاحقة (فوات موعد، حجز زائد).', ['rolled', 'Rolled']),
    gatein: T('Gate-in / gate-out', 'الدخول / الخروج من البوابة', 'route', 'Moment a container enters or leaves the terminal/depot, recorded on the EIR.', 'لحظة دخول الحاوية إلى المحطة/المستودع أو خروجها منها، وتُسجَّل على EIR.', ['Gate-in', 'gate-in', 'GATE IN', 'Gate-out', 'gate-out']),
    freetime: T('Free time', 'فترة السماح', 'route', 'Days allowed before demurrage/detention start. Negotiate it at booking, never after arrival.', 'الأيام المسموحة قبل بدء غرامات التأخير/الاحتجاز. فاوض عليها عند الحجز لا بعد الوصول.', ['Free time', 'free time', 'free days', 'Free days', 'فترة السماح', 'أيام السماح']),
    demurrage: T('Demurrage', 'غرامة التأخير (داخل المرفأ)', 'charge', 'Daily charge when a full container stays inside the terminal beyond free time.', 'رسم يومي عندما تبقى الحاوية المعبّأة داخل المحطة بعد فترة السماح.', ['Demurrage', 'demurrage', 'DEM']),
    detention: T('Detention', 'غرامة الاحتجاز (خارج المرفأ)', 'charge', 'Daily charge when a container is kept outside the terminal beyond free time and not yet returned empty.', 'رسم يومي عندما تبقى الحاوية خارج المحطة بعد فترة السماح ولم تُرجع فارغة.', ['Detention', 'detention', 'DET', 'D&D']),
    storage: T('Port storage', 'رسوم التخزين في المرفأ', 'charge', 'Separate charge by the port/terminal for cargo staying in the port after its own free period.', 'رسم منفصل يفرضه المرفأ/المحطة على البضاعة الباقية بعد فترة سماحه.', ['Port storage', 'port storage']),

    /* ---------- charges ---------- */
    of: T('Ocean freight', 'أجرة الشحن البحري', 'charge', 'Base rate of the line for moving the container port to port.', 'السعر الأساسي للخط لنقل الحاوية من مرفأ إلى مرفأ.', ['Ocean freight', 'OCEAN FREIGHT', 'Ocean Freight', 'الشحن البحري']),
    baf: T('BAF — bunker adjustment factor', 'رسم تعديل الوقود (BAF)', 'charge', 'Fuel surcharge that moves with oil prices.', 'رسم إضافي للوقود يتغيّر مع أسعار النفط.', ['BAF']),
    lss: T('LSS — low sulphur surcharge', 'رسم الوقود منخفض الكبريت (LSS)', 'charge', 'Surcharge for IMO 2020 compliant low-sulphur fuel.', 'رسم إضافي للوقود منخفض الكبريت المتوافق مع IMO 2020.', ['LSS']),
    caf: T('CAF — currency adjustment factor', 'رسم تعديل العملة (CAF)', 'charge', 'Protects the line against exchange rate movements on the trade lane.', 'يحمي الخط من تقلّبات سعر الصرف على خط التجارة.', ['CAF']),
    thc: T('THC — terminal handling charge', 'رسم مناولة المحطة (THC)', 'charge', 'Charge for handling the box at the terminal: OTHC at origin, DTHC at destination.', 'رسم مناولة الحاوية في المحطة: OTHC في المنشأ، DTHC في الوجهة.', ['THC', 'OTHC', 'DTHC']),
    isps: T('ISPS charge', 'رسم ISPS الأمني', 'charge', 'Security charge under the International Ship and Port Facility Security code.', 'رسم أمني بموجب المدوّنة الدولية لأمن السفن والمرافق المينائية.', ['ISPS']),
    gri: T('GRI / PSS', 'زيادة عامة / رسم الذروة', 'charge', 'General rate increase and peak season surcharge announced by the lines.', 'زيادة عامة في الأسعار ورسم موسم الذروة يعلنهما الخطوط.', ['GRI', 'PSS']),
    csf: T('Contingency / route surcharge', 'رسم الطوارئ / المسار', 'charge', 'Extra charge for diversions, war risk or congestion on a route (e.g. Red Sea).', 'رسم إضافي لتحويل المسار أو مخاطر الحرب أو الازدحام على خط (مثل البحر الأحمر).', ['CSF', 'EBS', 'Contingency']),
    ens: T('ENS / ICS2 filing', 'تقديم ENS / ICS2', 'customs', 'EU advance cargo declaration filed before loading/arrival; the line charges a filing fee.', 'التصريح المسبق عن البضاعة للاتحاد الأوروبي قبل التحميل/الوصول؛ ويفرض الخط رسمًا عليه.', ['ENS', 'ICS2']),
    dofee: T('D/O fee', 'رسم إذن التسليم', 'charge', 'Fee charged by the line’s agent for issuing the delivery order.', 'رسم يفرضه وكيل الخط لإصدار إذن التسليم.', ['D/O fee', 'DOF']),
    deposit: T('Container deposit', 'تأمين الحاوية', 'charge', 'Refundable guarantee (cash/cheque/bank guarantee) the line’s agent in Lebanon asks before releasing a full container. Not revenue.', 'كفالة مستردة (نقدًا/شيك/كفالة مصرفية) يطلبها وكيل الخط في لبنان قبل الإفراج عن الحاوية. ليست إيرادًا.', ['Container deposit', 'container deposit', 'deposit', 'تأمين الحاوية']),
    vat: T('VAT (11%)', 'الضريبة على القيمة المضافة (11%)', 'acc', 'Lebanese value added tax, standard rate 11%: on local services and on imports (CIF + duty).', 'الضريبة على القيمة المضافة في لبنان، النسبة العامة 11%: على الخدمات المحلية وعلى الاستيراد (CIF + الرسم).', ['VAT', 'الضريبة على القيمة المضافة']),
    margin: T('Margin', 'الهامش', 'acc', 'Profit ÷ selling price. (Markup = profit ÷ cost.)', 'الربح ÷ سعر البيع. (الزيادة = الربح ÷ الكلفة.)', ['Margin', 'margin', 'الهامش']),
    validity: T('Validity', 'الصلاحية', 'charge', 'Last date (usually sailing date) the price applies. Never longer than your supplier’s validity.', 'آخر تاريخ (عادة تاريخ الإبحار) يسري فيه السعر. لا يتجاوز أبدًا صلاحية مورّدك.', ['Valid until', 'Validity', 'validity']),
    allin: T('All-in rate', 'السعر الشامل', 'charge', 'Ocean freight with all surcharges included.', 'أجرة الشحن البحري مع كل الرسوم الإضافية.', ['All-in', 'all-in']),

    /* ---------- equipment ---------- */
    teu: T('TEU / FEU', 'TEU / FEU', 'equip', 'Twenty / forty-foot equivalent unit. A 40′ container = 2 TEU.', 'وحدة مكافئة لعشرين / أربعين قدمًا. الحاوية 40 قدمًا = 2 TEU.', ['TEU', 'FEU']),
    fcl: T('FCL / LCL', 'حاوية كاملة / شحنة جزئية', 'equip', 'Full container load (one shipper) / less than container load (shared, consolidated).', 'حاوية كاملة (شاحن واحد) / شحنة جزئية (مشتركة، مجمّعة).', ['FCL', 'LCL']),
    cbm: T('CBM', 'المتر المكعّب', 'equip', 'Cubic metre = L × W × H in metres. 40′ HC ≈ 76 CBM, 20′ ≈ 33 CBM.', 'متر مكعّب = الطول × العرض × الارتفاع بالمتر. 40 قدم عالية ≈ 76 م³، 20 قدم ≈ 33 م³.', ['CBM']),
    hc: T('40′ High Cube (40HC)', 'حاوية 40 قدم عالية', 'equip', 'One foot taller than a standard 40′: about 76 CBM, the default for light bulky cargo.', 'أعلى بقدم من الـ40 العادية: نحو 76 م³، الخيار الافتراضي للبضائع الخفيفة الكبيرة الحجم.', ['40HC', '40′ HC', "40' HC", '40 HC']),
    dv20: T('20′ Dry Van (20DV)', 'حاوية 20 قدم عادية', 'equip', 'About 33 CBM, up to ~28 t payload: for dense cargo.', 'نحو 33 م³، حمولة حتى ~28 طنًا: للبضائع الثقيلة.', ['20DV', '20′ DV', "20' DV"]),
    reefer: T('Reefer', 'حاوية مبرّدة', 'equip', 'Temperature-controlled container; confirm temperature, ventilation and humidity in writing.', 'حاوية بتحكّم حراري؛ أكّد الحرارة والتهوية والرطوبة كتابيًا.', ['Reefer', 'reefer']),
    wm: T('W/M — weight or measure', 'الوزن أو الحجم (W/M)', 'equip', 'LCL charging rule: bill the higher of tonnes or CBM (1 CBM = 1,000 kg).', 'قاعدة تسعير LCL: يُحتسب الأعلى بين الطن والمتر المكعّب (1 م³ = 1000 كغ).', ['W/M']),
    lcl: T('LCL — less than container load', 'شحنة جزئية (LCL)', 'equip', 'Small shipment that shares a container with other shippers’ cargo; booked with a consolidator, received and unstuffed at a CFS, billed per W/M.', 'شحنة صغيرة تشارك حاوية مع بضائع شاحنين آخرين؛ تُحجز لدى مجمِّع، تُستلم وتُفرّغ في محطة تجميع، وتُسعَّر بوحدة W/M.', ['groupage', 'Groupage']),
    cfs: T('CFS — container freight station', 'محطة تجميع الحاويات (CFS)', 'equip', 'Warehouse where LCL cargo is received, measured, stuffed into (or unstuffed from) consolidated containers. CFS cutoff = last day to deliver the cargo.', 'مستودع تُستلم فيه بضائع LCL وتُقاس وتُعبّأ في (أو تُفرّغ من) حاويات مجمّعة. موعد CFS = آخر يوم لتسليم البضاعة.', ['CFS', 'CFS cutoff', 'CFS/CFS']),
    consol: T('Consolidator / co-loader', 'المجمِّع (Co-loader)', 'party', 'Company that buys full containers from the lines and sells space per W/M to forwarders (LCL). It issues its own B/L to you.', 'شركة تشتري حاويات كاملة من الخطوط وتبيع المساحة لوكلاء الشحن لكل W/M (LCL). تصدر بوليصتها لك.', ['Consolidator', 'consolidator', 'co-loader']),
    dockrcpt: T('Dock receipt', 'إيصال الاستلام (Dock receipt)', 'doc', 'Receipt issued by the CFS when it receives LCL cargo: packages, condition, measured CBM and weight. Freight is billed on these figures.', 'إيصال تصدره محطة التجميع عند استلام بضاعة LCL: الطرود والحالة والحجم والوزن المقاسان. يُفوتر الشحن على هذه الأرقام.', ['Dock receipt', 'dock receipt', 'DOCK RECEIPT']),
    gafta: T('GAFTA — Greater Arab Free Trade Area', 'منطقة التجارة الحرة العربية الكبرى', 'customs', 'Arab free-trade area (Lebanon is a member): goods of Arab origin with an Arab certificate of origin enter member states free of customs duty.', 'منطقة تجارة حرة عربية (لبنان عضو): البضائع ذات المنشأ العربي مع شهادة منشأ عربية تدخل الدول الأعضاء معفاة من الرسوم الجمركية.', ['GAFTA']),
    amsisf: T('AMS / ISF', 'AMS / ISF', 'customs', 'US advance cargo data: AMS manifest filed by the carrier/NVOCC 24 h before loading; ISF (10+2) filed by the importer.', 'بيانات مسبقة لأميركا: مانيفست AMS يقدّمه الناقل/NVOCC قبل 24 ساعة من التحميل؛ وISF (10+2) يقدّمه المستورد.', ['AMS', 'ISF']),
    storage: T('Storage', 'التخزين', 'charge', 'Daily charge for cargo staying at a CFS or port beyond the free days (LCL: per W/M per day).', 'رسم يومي للبضاعة التي تبقى في المحطة أو المرفأ بعد الأيام المجانية (LCL: لكل W/M يوميًا).', ['storage', 'Storage']),
    coc: T('COC / SOC', 'حاوية الناقل / حاوية الشاحن', 'equip', 'Carrier-owned container / shipper-owned container.', 'حاوية يملكها الناقل / حاوية يملكها الشاحن.', ['COC', 'SOC']),

    /* ---------- incoterms ---------- */
    exw: T('EXW — Ex Works', 'EXW — تسليم في المصنع', 'inco', 'Seller only makes goods available at its premises; buyer does everything, including export clearance.', 'البائع يضع البضاعة فقط في مقرّه؛ والمشتري يقوم بكل شيء بما فيه التخليص الصادر.', ['EXW']),
    fca: T('FCA — Free Carrier', 'FCA — تسليم للناقل', 'inco', 'Seller delivers, export-cleared, to the buyer’s carrier at a named place. Correct term for containers.', 'البائع يسلّم البضاعة مخلّصة للتصدير إلى ناقل المشتري في مكان محدّد. المصطلح الصحيح للحاويات.', ['FCA']),
    fob: T('FOB — Free On Board', 'FOB — التسليم على ظهر الباخرة', 'inco', 'Seller delivers on board at the port of loading; buyer pays ocean freight onwards. Risk passes on board.', 'البائع يسلّم على متن الباخرة في مرفأ التحميل؛ والمشتري يدفع الشحن البحري فما بعد. تنتقل المخاطر على متن الباخرة.', ['FOB']),
    cfr: T('CFR — Cost and Freight', 'CFR — الكلفة والشحن', 'inco', 'Seller pays freight to the destination port, but risk passes when loaded at origin.', 'البائع يدفع الشحن حتى مرفأ الوجهة، لكن المخاطر تنتقل عند التحميل في المنشأ.', ['CFR']),
    cif: T('CIF — Cost, Insurance and Freight', 'CIF — الكلفة والتأمين والشحن', 'inco', 'As CFR plus minimum insurance paid by the seller. Also the basis of Lebanese customs value.', 'مثل CFR مع تأمين بالحدّ الأدنى يدفعه البائع. وهو أيضًا أساس القيمة الجمركية في لبنان.', ['CIF']),
    cpt: T('CPT / CIP', 'CPT / CIP', 'inco', 'Carriage (and insurance) paid to a named destination; risk passes at handover to the first carrier.', 'النقل (والتأمين) مدفوع حتى وجهة محدّدة؛ تنتقل المخاطر عند التسليم لأول ناقل.', ['CPT', 'CIP']),
    dap: T('DAP — Delivered At Place', 'DAP — التسليم في المكان', 'inco', 'Seller delivers to the named destination, not unloaded, import not cleared.', 'البائع يسلّم في الوجهة المحدّدة دون تفريغ ودون تخليص الاستيراد.', ['DAP', 'DPU']),
    ddp: T('DDP — Delivered Duty Paid', 'DDP — التسليم مع دفع الرسوم', 'inco', 'Seller delivers cleared, with duties and import VAT paid. Maximum obligation for the seller.', 'البائع يسلّم البضاعة مخلّصة مع دفع الرسوم وضريبة الاستيراد. أقصى التزام على البائع.', ['DDP']),

    /* ---------- customs ---------- */
    najm: T('NAJM', 'نظام نجم', 'customs', 'Lebanese Customs electronic system: manifests from carriers’ agents and declarations from licensed brokers.', 'النظام الإلكتروني للجمارك اللبنانية: المانيفست من وكلاء الخطوط والبيانات من المخلّصين المرخّصين.', ['NAJM', 'نجم']),
    cifval: T('Customs value (CIF)', 'القيمة الجمركية (CIF)', 'customs', 'Value on which Lebanese duty is calculated: price paid + freight + insurance to the Lebanese port, converted to LBP.', 'القيمة التي يُحتسب عليها الرسم في لبنان: الثمن المدفوع + الشحن + التأمين حتى المرفأ اللبناني، محوّلة إلى الليرة.', ['Customs value', 'CIF value', 'Statistical value', 'القيمة الجمركية']),
    duty: T('Customs duty', 'الرسم الجمركي', 'customs', 'Tax on imported goods = customs value × tariff rate of the HS code (reduced with preferential origin).', 'ضريبة على البضائع المستوردة = القيمة الجمركية × نسبة تعرفة رمز HS (مخفّضة مع المنشأ التفضيلي).', ['Customs duty', 'customs duty', 'Duty', 'duty', 'الرسم الجمركي']),
    excise: T('Excise', 'رسم الاستهلاك', 'customs', 'Extra tax on specific goods (fuel, tobacco, alcohol, vehicles…).', 'ضريبة إضافية على سلع محدّدة (محروقات، تبغ، كحول، سيارات…).', ['Excise', 'excise', 'رسم الاستهلاك']),
    lane: T('Risk lane (green / yellow / red)', 'مسار المخاطر (أخضر / أصفر / أحمر)', 'customs', 'Green: release without control. Yellow: document check. Red: physical inspection (often scanner).', 'الأخضر: إفراج بدون رقابة. الأصفر: تدقيق مستندات. الأحمر: كشف حسّي (غالبًا بالأشعة).', ['lane', 'Lane', 'green lane', 'yellow lane', 'red lane', 'GREEN', 'YELLOW', 'المسار الأخضر', 'المسار الأصفر', 'المسار الأحمر']),
    regime: T('Customs regime / procedure', 'النظام الجمركي', 'customs', 'What happens to the goods: definitive import, export, temporary admission, transit, free zone, re-export.', 'ما يحصل للبضاعة: استيراد نهائي، تصدير، إدخال مؤقت، ترانزيت، منطقة حرة، إعادة تصدير.', ['regime', 'Customs regime', 'Procedure', 'النظام الجمركي']),
    origin: T('Country of origin', 'بلد المنشأ', 'customs', 'Where the goods were made (not where they were shipped from). Decides preferential duty and some restrictions.', 'البلد الذي صُنعت فيه البضاعة (وليس الذي شُحنت منه). يحدّد الرسم التفضيلي وبعض القيود.', ['Country of origin', 'country of origin', 'بلد المنشأ']),
    consigned: T('Country of consignment / dispatch', 'بلد الإرسال', 'customs', 'Country from which the goods were shipped to Lebanon (transshipment ports do not count).', 'البلد الذي شُحنت منه البضاعة إلى لبنان (مرافئ المسافنة لا تُحتسب).', ['Country of consignment', 'Country of dispatch', 'بلد الإرسال']),
    preference: T('Preferential origin', 'المنشأ التفضيلي', 'customs', 'Reduced/zero duty under a trade agreement (GAFTA, EU EUR.1, EFTA) when a valid origin proof is presented.', 'رسم مخفّض/صفر بموجب اتفاقية تجارية (العربية، EUR.1 الأوروبية، EFTA) عند تقديم إثبات منشأ صالح.', ['Preference', 'preference', 'GAFTA', 'EFTA', 'MFN', 'المنشأ التفضيلي']),
    customsrate: T('Customs exchange rate', 'سعر الصرف الجمركي', 'customs', 'Official LBP/USD rate used to convert values for duty. Changed several times since 2022 — always check.', 'السعر الرسمي لليرة مقابل الدولار المستعمل لتحويل القيم لاحتساب الرسوم. تغيّر مرارًا منذ 2022 — تحقّق دائمًا.', ['Exchange rate', 'exchange rate', 'customs rate', 'سعر الصرف']),
    postaudit: T('Post-clearance audit', 'التدقيق اللاحق', 'customs', 'Customs can check a declaration after release; keep all records.', 'يمكن للجمارك تدقيق البيان بعد الإفراج؛ احفظ كل السجلات.', ['post-clearance audit', 'Post-clearance audit']),
    tempadm: T('Temporary admission', 'الإدخال المؤقت', 'customs', 'Goods enter with duties suspended against a guarantee and must leave within a deadline (exhibitions, project equipment).', 'تدخل البضاعة مع تعليق الرسوم مقابل كفالة ويجب أن تخرج ضمن مهلة (معارض، معدّات مشاريع).', ['Temporary admission', 'temporary admission', 'إدخال مؤقت']),
    freezone: T('Free zone', 'المنطقة الحرة', 'customs', 'Area where goods are stored without paying duty until they enter the local market (e.g. Beirut port free zone).', 'منطقة تُخزَّن فيها البضائع بدون رسوم حتى دخولها السوق المحلي (مثل المنطقة الحرة في مرفأ بيروت).', ['Free zone', 'free zone', 'المنطقة الحرة']),
    boycott: T('Boycott law (Lebanon)', 'قانون المقاطعة (لبنان)', 'safety', 'Lebanese law prohibiting dealings with Israel, Israeli entities and goods of Israeli origin.', 'القانون اللبناني الذي يمنع التعامل مع إسرائيل والجهات الإسرائيلية والبضائع ذات المنشأ الإسرائيلي.', ['Boycott law', 'boycott law', 'قانون المقاطعة']),

    /* ---------- payment ---------- */
    cad: T('CAD — cash against documents', 'الدفع مقابل المستندات', 'pay', 'The buyer’s bank hands the original documents (B/L) to the buyer only against payment.', 'يسلّم مصرف المشتري المستندات الأصلية (البوليصة) للمشتري فقط مقابل الدفع.', ['CAD', 'Cash Against Documents', 'cash against documents']),
    lc: T('Letter of credit (L/C)', 'الاعتماد المستندي', 'pay', 'Bank promise to pay the seller if it presents documents exactly as the credit requires.', 'تعهّد مصرفي بالدفع للبائع إذا قدّم المستندات تمامًا كما يشترط الاعتماد.', ['letter of credit', 'L/C', 'الاعتماد المستندي']),
    tt: T('T/T — telegraphic transfer', 'تحويل مصرفي', 'pay', 'Bank transfer; e.g. 30% advance, 70% against copy of B/L.', 'تحويل مصرفي؛ مثلًا 30% مسبقًا و70% مقابل نسخة البوليصة.', ['T/T']),

    /* ---------- accounting ---------- */
    debit: T('Debit / credit', 'المدين / الدائن', 'acc', 'Every entry has equal debits and credits. Assets & expenses increase with a debit; liabilities, capital & revenue with a credit.', 'لكل قيد مدين يساوي دائنه. الأصول والأعباء تزيد بالمدين؛ الالتزامات ورأس المال والإيرادات بالدائن.', ['Debit', 'Credit', 'debit', 'credit', 'مدين', 'دائن']),
    journal: T('Journal', 'دفتر اليومية', 'acc', 'Chronological record of all accounting entries.', 'السجل الزمني لكل القيود المحاسبية.', ['Journal', 'journal', 'دفتر اليومية']),
    ledger: T('Ledger', 'دفتر الأستاذ', 'acc', 'All movements of one account and its running balance.', 'كل حركات حساب واحد ورصيده المتراكم.', ['Ledger', 'ledger', 'دفتر الأستاذ']),
    tb: T('Trial balance', 'ميزان المراجعة', 'acc', 'List of all account balances: total debits must equal total credits.', 'لائحة بأرصدة كل الحسابات: مجموع المدين يجب أن يساوي مجموع الدائن.', ['Trial balance', 'trial balance', 'ميزان المراجعة']),
    ar: T('Accounts receivable (411)', 'الزبائن (411)', 'acc', 'What customers owe the company.', 'ما يدين به الزبائن للشركة.', ['Accounts receivable', 'Customers']),
    ap: T('Accounts payable (401)', 'الموردون (401)', 'acc', 'What the company owes its suppliers.', 'ما تدين به الشركة لمورّديها.', ['Accounts payable', 'Suppliers']),
    outvat: T('Output VAT (4427)', 'الضريبة على المبيعات (4427)', 'acc', 'VAT collected on sales invoices — owed to the State.', 'الضريبة المحصّلة على فواتير المبيعات — مستحقة للدولة.', ['Output VAT', 'output VAT', 'VAT collected']),
    invat: T('Input VAT (4426)', 'الضريبة على المشتريات (4426)', 'acc', 'VAT paid on purchases that a registered company can deduct from its output VAT.', 'الضريبة المدفوعة على المشتريات التي يمكن للشركة المسجّلة حسمها من ضريبة مبيعاتها.', ['Input VAT', 'input VAT', 'VAT recoverable']),
    vatreturn: T('VAT return', 'التصريح الضريبي', 'acc', 'Periodic declaration to the Ministry of Finance: output VAT − input VAT = VAT to pay.', 'تصريح دوري لوزارة المالية: ضريبة المبيعات − ضريبة المشتريات = الضريبة المستحقة.', ['VAT return', 'VAT RETURN', 'التصريح الضريبي']),
    accrual: T('Accrual basis', 'أساس الاستحقاق', 'acc', 'Revenue and costs are recorded when the service is done, not when cash moves.', 'تُسجَّل الإيرادات والكلف عند تنفيذ الخدمة لا عند حركة النقد.', ['Accrual basis', 'accrual basis', 'أساس الاستحقاق']),
    disbursement: T('Disbursement', 'سلفة / بند مارّ', 'acc', 'Amount paid on behalf of a client (duties, deposits) and recharged at cost — not revenue.', 'مبلغ مدفوع نيابةً عن الزبون (رسوم، تأمينات) ويُعاد تحميله بالكلفة — ليس إيرادًا.', ['Disbursement', 'disbursement', 'Disbursements', 'السلف']),
    bankrec: T('Bank reconciliation', 'التسوية المصرفية', 'acc', 'Explains the difference between the bank statement and the bank account in the books.', 'تفسير الفرق بين كشف المصرف وحساب المصرف في الدفاتر.', ['Bank reconciliation', 'BANK RECONCILIATION', 'التسوية المصرفية']),
    jobcost: T('Job costing', 'كلفة العملية', 'acc', 'Revenue minus costs for one shipment: the real profit of the job.', 'الإيرادات ناقص الكلف لشحنة واحدة: الربح الفعلي للعملية.', ['Job costing', 'job costing', 'Job profit', 'كلفة العملية']),

    /* ---------- safety & rules ---------- */
    solas: T('SOLAS', 'اتفاقية SOLAS', 'safety', 'International Convention for the Safety of Life at Sea; requires the VGM before loading.', 'الاتفاقية الدولية لسلامة الأرواح في البحر؛ تشترط VGM قبل التحميل.', ['SOLAS']),
    dg: T('Dangerous goods (DG / IMDG)', 'البضائع الخطرة', 'safety', 'Hazardous cargo classified under the IMDG code: needs UN number, class, packing group, MSDS and DG declaration.', 'بضائع خطرة مصنّفة وفق مدوّنة IMDG: تحتاج رقم UN والفئة ومجموعة التعبئة وMSDS وإقرار بضائع خطرة.', ['IMDG', 'Dangerous goods', 'dangerous goods', 'DG', 'MSDS']),
    ispm15: T('ISPM 15', 'معيار ISPM 15', 'safety', 'International standard requiring wooden pallets/packing to be heat-treated and marked.', 'معيار دولي يشترط معالجة الطبليات/التغليف الخشبي حراريًا ووسمه.', ['ISPM 15']),
  };

  /* ---------------- popup card ---------------- */
  TS.showTerm = (key) => {
    const x = TS.TERMS[key];
    if (!x) return;
    let ov = document.getElementById('ts-term');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'ts-term';
      ov.className = 'term-overlay';
      document.body.appendChild(ov);
      ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) ov.classList.remove('on'); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') ov.classList.remove('on'); });
    }
    const cat = TS.TERM_CATS[x.cat] || L('Term', 'مصطلح');
    const related = Object.entries(TS.TERMS).filter(([k, v]) => k !== key && v.cat === x.cat).slice(0, 6);
    ov.innerHTML = `<div class="term-card" role="dialog" aria-modal="true" aria-label="${esc(x.en)}">
      <div class="term-head"><span class="badge info">${esc(cat.en)} · ${esc(cat.ar)}</span><button class="btn sm ghost" data-close aria-label="close">✕</button></div>
      <div class="term-title"><div class="ltr" dir="ltr"><b>${esc(x.en)}</b></div><div dir="rtl" lang="ar"><b>${esc(x.ar)}</b></div></div>
      <div class="term-body"><div class="term-lang" dir="ltr" lang="en"><span class="term-flag">EN</span><p>${esc(x.d.en)}</p></div>
      <div class="term-lang" dir="rtl" lang="ar"><span class="term-flag">ع</span><p>${esc(x.d.ar)}</p></div></div>
      ${related.length ? `<div class="term-rel"><small>${esc(t(L('Related', 'مصطلحات مرتبطة')))}:</small> ${related.map(([k, v]) => `<button type="button" class="term-chip" data-term="${k}">${esc(TS.lang === 'ar' ? v.ar : v.en)}</button>`).join('')}</div>` : ''}
    </div>`;
    ov.classList.add('on');
    const c = ov.querySelector('[data-close]'); if (c) c.focus();
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-term]');
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    TS.showTerm(el.dataset.term);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('span.term[data-term]')) { e.preventDefault(); TS.showTerm(e.target.dataset.term); }
  });

  /* ---------------- auto-linking ---------------- */
  let RX = null; const AMAP = {};
  function build() {
    const all = [];
    Object.entries(TS.TERMS).forEach(([k, v]) => v.a.forEach((a) => { if (!AMAP[a]) { AMAP[a] = k; all.push(a); } }));
    all.sort((a, b) => b.length - a.length);
    const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    RX = new RegExp('(?<![A-Za-z0-9\\u0600-\\u06FF])(' + all.map(escRx).join('|') + ')(?![A-Za-z0-9\\u0600-\\u06FF])', 'g');
  }
  TS.term = (label, key) => `<span class="term" data-term="${key}" tabindex="0">${label}</span>`;
  /* wrap the first occurrence of each known term inside root (skips inputs, buttons, links and existing terms) */
  TS.decorate = (root) => {
    if (!root) return;
    if (!RX) build();
    const seen = new Set();
    root.querySelectorAll('[data-term]').forEach((e) => seen.add(e.dataset.term));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (!n.nodeValue || n.nodeValue.trim().length < 2) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest('input,textarea,select,option,button,a,script,style,.term,[data-term],.json,.no-term')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const txt = n.nodeValue;
      RX.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = RX.exec(txt))) {
        const k = AMAP[m[1]];
        if (seen.has(k)) continue;
        seen.add(k);
        frag = frag || document.createDocumentFragment();
        frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const s = document.createElement('span');
        s.className = 'term'; s.dataset.term = k; s.tabIndex = 0; s.textContent = m[1];
        frag.appendChild(s);
        last = m.index + m[1].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(txt.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
  };
  TS.decorateAll = (root) => (root || document).querySelectorAll('.lesson, .mail-body, .rd, .doc, .email-preview, .note, .q .qt').forEach((el) => TS.decorate(el));
})();
