/* Curated school supply journeys, NOT additional product/SKU authority. Keep master catalogue identities unchanged. */
window.PS_SCHOOL_BASKETS = {
  "version": "2026-10-19-v1",
  "sourceAuthority": "DHA/HRS/HPSD/ST-22 version 4.1, Appendix 3",
  "scope": "DHA-licensed educational clinics in Dubai; school-specific approval and other emirates require separate authority checks",
  "source": "https://dha.gov.ae/uploads/052025/Standards%20for%20Clinics%20in%20Educational%20and%20Academic%20Settings2025552476.pdf",
  "historicalScope": "First school 17-line quotation is a partial equipment scope only; delivery and payment must not be assumed",
  "opening": [
    {
      "id": "furniture",
      "title": "Clinic rooms & furniture",
      "description": "Examination and observation spaces, safe storage, privacy, hygiene and accessibility.",
      "transactions": [
        "INST-0001",
        "INST-0002",
        "INST-0003",
        "INST-0004",
        "INST-0005",
        "INST-0007",
        "INST-0008",
        "INST-0009",
        "INST-0010",
        "INST-0011",
        "INST-0012",
        "INST-0014",
        "INST-0015",
        "INST-0016",
        "INST-0017",
        "INST-0018",
        "INST-0020",
        "INST-0021",
        "INST-0022",
        "INST-0024"
      ]
    },
    {
      "id": "diagnostics",
      "title": "Diagnostics & clinical assessment",
      "description": "Vitals, assessments and core small equipment; exact device model and compatible accessories are checked at quotation.",
      "transactions": [
        "INST-0025",
        "INST-0028",
        "INST-0029",
        "INST-0031",
        "INST-0032",
        "INST-0033",
        "INST-0035",
        "INST-0036",
        "INST-0037",
        "INST-0038",
        "INST-0041",
        "INST-0042",
        "INST-0043",
        "INST-0045",
        "INST-0046",
        "INST-0047",
        "INST-0048",
        "INST-0049"
      ]
    },
    {
      "id": "emergency",
      "title": "Emergency equipment & first response",
      "description": "AED, oxygen support, stretcher, first aid, nebuliser and sharps safety, subject to competent installation and clinical approval.",
      "transactions": [
        "INST-0008",
        "INST-0027",
        "INST-0034",
        "INST-0039",
        "INST-0040",
        "INST-0044"
      ]
    },
    {
      "id": "opening-stock",
      "title": "First clinical stock",
      "description": "Gloves, plasters, dressings, PPE, syringes, respiratory accessories and disposables; practical packs chosen with the school nurse.",
      "transactions": [
        "INST-0050",
        "INST-0054",
        "INST-0057",
        "INST-0063",
        "INST-0064",
        "INST-0065",
        "INST-0066",
        "INST-0067",
        "INST-0068",
        "INST-0069",
        "INST-0073",
        "INST-0074",
        "INST-0075",
        "INST-0076",
        "INST-0079",
        "INST-0082",
        "INST-0086",
        "INST-0090",
        "INST-0096",
        "INST-0098"
      ]
    },
    {
      "id": "medicines",
      "title": "Medicines & clinical solutions — licensed route",
      "description": "DHA Appendix 3 medicines and solutions are a separate professional approval and licensed procurement schedule, never auto-added to a school supply request.",
      "transactions": [
        "INST-0102",
        "INST-0103",
        "INST-0105",
        "INST-0106",
        "INST-0107",
        "INST-0108",
        "INST-0109",
        "INST-0110",
        "INST-0111",
        "INST-0112",
        "INST-0113"
      ],
      "regulated": true
    }
  ],
  "replenishment": [
    {
      "id": "wound",
      "title": "Wound care & dressings",
      "description": "Small packs for frequent first-aid and wound-care needs.",
      "skus": [
        "PSC-WND-002",
        "PSC-WND-003",
        "PSC-WND-004",
        "PSC-WND-005",
        "PSC-WND-007",
        "PSC-WND-009",
        "PSC-WND-015",
        "PSC-WND-016"
      ]
    },
    {
      "id": "infection",
      "title": "Gloves, hygiene & PPE",
      "description": "Size-specific gloves, masks, couch roll, disposable towels and cleaning consumables.",
      "skus": [
        "PSC-PPE-001",
        "PSC-PPE-003",
        "PSC-PPE-005",
        "PSC-BAS-001",
        "PSC-BAS-002",
        "PSC-BAS-005",
        "PSC-DSP-007"
      ]
    },
    {
      "id": "diagnostic",
      "title": "Testing & device refills",
      "description": "Glucose strips, lancets and thermometer covers; only when compatible with the clinic's actual device.",
      "skus": [
        "PSC-DBT-002",
        "PSC-DBT-004",
        "PSC-DBT-005",
        "PSC-BAS-003",
        "PSC-BAS-004",
        "PSC-DSP-008"
      ]
    },
    {
      "id": "respiratory",
      "title": "Respiratory & general patient care",
      "description": "Nebuliser masks and tubing, oxygen accessories and absorbent patient-care items.",
      "skus": [
        "PSC-RES-003",
        "PSC-RES-004",
        "PSC-RES-005",
        "PSC-RES-007",
        "PSC-DSP-010",
        "PSC-DSP-011"
      ]
    }
  ],
  "kits": [
    {
      "id": "general",
      "title": "General first-aid point",
      "where": "Reception, staff rooms, general corridors",
      "accent": "General campus",
      "details": "Simple minor-injury supplies, with a named school custodian.",
      "contents": [
        [
          "Assorted plasters",
          "PSC-WND-007",
          "1 compact pack"
        ],
        [
          "Sterile gauze",
          "PSC-WND-002",
          "1 small pack"
        ],
        [
          "Conforming bandage",
          "PSC-WND-003",
          "1 pack / roll selection"
        ],
        [
          "Examination gloves",
          "PSC-PPE-001",
          "1 size-confirmed pack"
        ],
        [
          "Alcohol prep pads",
          "PSC-DSP-007",
          "1 small pack"
        ],
        [
          "Bandage scissors",
          "INST-0028",
          "1 piece"
        ],
        [
          "Waste bags",
          "",
          "1 small pack"
        ],
        [
          "Contents card & incident instructions",
          "",
          "1 card"
        ],
        [
          "Wound closure strips",
          "PSC-WND-015",
          "1 small pack"
        ],
        [
          "CPR face shield",
          "",
          "1 piece"
        ]
      ]
    },
    {
      "id": "sports",
      "title": "Sports & gym first-aid kit",
      "where": "Gym, PE office, sports grounds",
      "accent": "Sports / PE",
      "details": "Additional cold packs, support bandages and splint options for trained responders.",
      "contents": [
        [
          "Assorted plasters",
          "PSC-WND-007",
          "1 compact pack"
        ],
        [
          "Sterile gauze",
          "PSC-WND-002",
          "1 small pack"
        ],
        [
          "Conforming bandage",
          "PSC-WND-003",
          "1 pack / roll selection"
        ],
        [
          "Examination gloves",
          "PSC-PPE-001",
          "1 size-confirmed pack"
        ],
        [
          "Alcohol prep pads",
          "PSC-DSP-007",
          "1 small pack"
        ],
        [
          "Bandage scissors",
          "INST-0028",
          "1 piece"
        ],
        [
          "Waste bags",
          "",
          "1 small pack"
        ],
        [
          "Contents card & incident instructions",
          "",
          "1 card"
        ],
        [
          "Instant cold packs",
          "PSC-WND-005",
          "3 pieces"
        ],
        [
          "Crepe bandages",
          "PSC-WND-004",
          "2 rolls"
        ],
        [
          "Cohesive support bandages",
          "PSC-WND-014",
          "2 rolls"
        ],
        [
          "Splint set",
          "INST-0092",
          "1 set"
        ]
      ]
    },
    {
      "id": "lab",
      "title": "Science laboratory first-aid kit",
      "where": "Chemistry / science teaching areas",
      "accent": "Laboratory",
      "details": "Site hazard assessment determines appropriate eye-wash and burn provisions; a portable kit is not a substitute for installed emergency facilities.",
      "contents": [
        [
          "Assorted plasters",
          "PSC-WND-007",
          "1 compact pack"
        ],
        [
          "Sterile gauze",
          "PSC-WND-002",
          "1 small pack"
        ],
        [
          "Conforming bandage",
          "PSC-WND-003",
          "1 pack / roll selection"
        ],
        [
          "Examination gloves",
          "PSC-PPE-001",
          "1 size-confirmed pack"
        ],
        [
          "Alcohol prep pads",
          "PSC-DSP-007",
          "1 small pack"
        ],
        [
          "Bandage scissors",
          "INST-0028",
          "1 piece"
        ],
        [
          "Waste bags",
          "",
          "1 small pack"
        ],
        [
          "Contents card & incident instructions",
          "",
          "1 card"
        ],
        [
          "Saline irrigation, suitable container",
          "INST-0112",
          "1 suitable pack"
        ],
        [
          "Protective goggles",
          "PSC-PPE-005",
          "1 pair"
        ],
        [
          "Sterile burn dressing",
          "",
          "1 small pack"
        ],
        [
          "Laboratory emergency response card",
          "",
          "1 card"
        ]
      ]
    },
    {
      "id": "canteen",
      "title": "Canteen first-aid kit",
      "where": "School canteen / food preparation",
      "accent": "Food services",
      "details": "Practical wound coverage and burn provisions, with workplace food safety review.",
      "contents": [
        [
          "Assorted plasters",
          "PSC-WND-007",
          "1 compact pack"
        ],
        [
          "Sterile gauze",
          "PSC-WND-002",
          "1 small pack"
        ],
        [
          "Conforming bandage",
          "PSC-WND-003",
          "1 pack / roll selection"
        ],
        [
          "Examination gloves",
          "PSC-PPE-001",
          "1 size-confirmed pack"
        ],
        [
          "Alcohol prep pads",
          "PSC-DSP-007",
          "1 small pack"
        ],
        [
          "Bandage scissors",
          "INST-0028",
          "1 piece"
        ],
        [
          "Waste bags",
          "",
          "1 small pack"
        ],
        [
          "Contents card & incident instructions",
          "",
          "1 card"
        ],
        [
          "Sterile non-adherent wound dressings",
          "PSC-WND-016",
          "1 small pack"
        ],
        [
          "Burn-appropriate dressings",
          "",
          "1 small pack"
        ],
        [
          "Finger & knuckle plasters",
          "INST-0051",
          "1 assorted pack"
        ]
      ]
    },
    {
      "id": "mobile",
      "title": "Trip & mobile-response kit",
      "where": "School trips, sports travel, school transport",
      "accent": "Mobile",
      "details": "Portable kit assigned to a named leader and checked before trips.",
      "contents": [
        [
          "Assorted plasters",
          "PSC-WND-007",
          "1 compact pack"
        ],
        [
          "Sterile gauze",
          "PSC-WND-002",
          "1 small pack"
        ],
        [
          "Conforming bandage",
          "PSC-WND-003",
          "1 pack / roll selection"
        ],
        [
          "Examination gloves",
          "PSC-PPE-001",
          "1 size-confirmed pack"
        ],
        [
          "Alcohol prep pads",
          "PSC-DSP-007",
          "1 small pack"
        ],
        [
          "Bandage scissors",
          "INST-0028",
          "1 piece"
        ],
        [
          "Waste bags",
          "",
          "1 small pack"
        ],
        [
          "Contents card & incident instructions",
          "",
          "1 card"
        ],
        [
          "Instant cold packs",
          "PSC-WND-005",
          "2 pieces"
        ],
        [
          "Triangular bandages",
          "",
          "2 pieces"
        ],
        [
          "Portable first-aid bag",
          "PSC-EQP-007",
          "1 bag"
        ]
      ]
    }
  ]
};
