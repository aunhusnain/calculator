// Data configuration for categories
const ADMIN_ENDPOINT = ""; // Set to your secure admin API endpoint (HTTPS)
const START_KEY = "hs_price_calc_started";
const WHATSAPP_NUMBER = "923127231875"; // international format without +
const STEP_KEY = "hs_price_calc_step";
// determine initial step from localStorage (defaults to 1)
const savedStepStr =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem(STEP_KEY)
    : null;
const INITIAL_STEP = (() => {
  const n = Number(savedStepStr || 1);
  return n >= 1 && n <= 4 ? n : 1;
})();
const hasStartedBefore =
  typeof window !== "undefined" &&
  window.localStorage &&
  window.localStorage.getItem(START_KEY) === "1";
if (hasStartedBefore) {
  document.body.classList.add("started");
}
const CATEGORIES = {
  Clinic: {
    free: ["Help & Support"],
    upgradeFree: ["Business profile", "Social Media Creation"],
    essentialPack: {
      price: 50000,
      includes: [
        "Finance Management",
        "Patient profile",
        "EMR System",
        "Expense Management",
        "Token generation",
        "Prescription Management",
        "Doctor Commission",
        "Multiple Portals",
      ],
    },
    paid: [
      { id: "networking", name: "Networking", price: 40000 },
      { id: "cloud", name: "Cloud", price: 45000 },
    ],
    extras: [],
  },
  Hospital: {
    free: ["Help & Support"],
    upgradeFree: [
      "Patient Profile",
      "EMR System",
      "Backup",
      "Branding Custom",
      "Customized Dashboard",
      "Multiple Layout Mode",
      "Social Media Creation",
    ],
    essentialPack: null,
    paid: [
      { id: "opd", name: "OPD", price: 50000 },
      { id: "ipd", name: "IPD", price: 50000 },
      { id: "ot", name: "OT", price: 50000 },
      { id: "emergency", name: "Emergency", price: 50000 },
      { id: "icu", name: "ICU", price: 50000 },
      { id: "networking", name: "Networking", price: 100000 },
      { id: "doctor-portal", name: "Doctor Portal", price: 50000 },
      { id: "corporate", name: "Corporate", price: 300000 },
      // Finance listed as "Already"; treat as included/free not paid
      {
        id: "online-rx-chat",
        name: "Online Prescription + Chat App",
        price: 50000,
      },
      { id: "mobile-app", name: "App (Mobile)", price: 50000 },
      { id: "erp", name: "ERP", price: 100000 },
      { id: "pharmacy", name: "Pharmacy", price: 50000 },
      { id: "laboratory", name: "Laboratory", price: 50000 },
      { id: "diagnostics", name: "Diagnostics", price: 50000 },
      {
        id: "indoor-outdoor-pharmacy",
        name: "Indoor & Outdoor Pharmacy",
        price: 40000,
      },
      { id: "tax-fbr", name: "Tax Modules (FBR)", price: 30000 },
      { id: "staff-mgmt", name: "Staff Management", price: 50000 },
      { id: "equipment-mgmt", name: "Equipment Management", price: 20000 },
      { id: "nursery", name: "Nursery", price: 50000 },
    ],
    extras: [],
  },
  Lab: {
    free: ["Help & Support"],
    essentialPack: {
      price: 20000,
      includes: [
        "Sample Intake",
        "Test Catalog",
        "Sample Processing",
        "Report Generation",
        "Finance Management",
      ],
    },
    paid: [
      { id: "equipment-mgmt", name: "Equipment Management", price: 10000 },
      { id: "inventory", name: "Inventory Control", price: 5000 },
      { id: "expense", name: "Expense Management", price: 5000 },
      {
        id: "doctor-referral",
        name: "Doctor Referral & Commission",
        price: 20000,
      },
      { id: "hardware", name: "Machine Connection (Hardware)", price: 30000 },
      { id: "staff-mgmt", name: "Staff Management", price: 30000 },
      { id: "barcode", name: "Scan Hand Wrist & Sample Barcode", price: 30000 },
      {
        id: "analyzer-ai",
        name: "Test Analyzer & AI Integration",
        price: 100000,
      },
      { id: "fbr-tax", name: "Fbr Tax Modules", price: 30000 },
      { id: "networking", name: "Networking", price: 30000 },
      {
        id: "suppliers-ledger",
        name: "Suppliers Management & Ledger",
        price: 10000,
      },
      { id: "cloud", name: "Cloud", price: 100000 },
    ],
    extras: [],
  },
  Pharmacy: {
    free: ["Help & Support"],
    upgradeFree: [
      "Customized Settings",
      "Automatic Backup",
      "Audit Log",
      "Social Media",
    ],
    essentialPack: {
      price: 25000,
      includes: [
        // Pharmacy Module
        "Dashboard",
        "Urdu / English Dashboard",
        "Role based Dashboard",
        "Medicines Database",
        // Inventory Control
        "Low Stock",
        "Out of Stock",
        "Expiring Soon",
        "Add Invoice",
        "Add Inventory",
        "Update Stock",
        // Settings
        "Backup",
      ],
    },
    paid: [
      {
        id: "suppliers-ledger",
        name: "Suppliers Management & Ledger",
        price: 10000,
      },
      { id: "custom-module", name: "Custom Module", price: 10000 },
      { id: "doctor-referral", name: "Doctor Referral", price: 10000 },
      { id: "networking", name: "Networking", price: 20000 },
      { id: "cloud", name: "Cloud", price: 50000 },
      { id: "staff-mgmt", name: "Staff Management", price: 10000 },
    ],
    extras: [],
  },
};

// Helpers
const fmt = (n) => `${n.toLocaleString()} PKR`;

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k === "for") e.htmlFor = v;
    else if (k.startsWith("on") && typeof v === "function")
      e.addEventListener(k.substring(2).toLowerCase(), v);
    else if (k === "text") e.textContent = v;
    else e.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

// Render category cards on Step 2
function renderCategoryIcons() {
  if (!categoryIcons) return;
  categoryIcons.innerHTML = "";
  categoryIcons.setAttribute("role", "group");
  const DESCRIPTIONS = {
    Clinic: "Best for individual doctors and small clinics",
    Hospital: "For multi-department and large setups",
    Pharmacy: "Retail pharmacy and POS flows",
    Lab: "Diagnostics, test processing and reports",
  };
  Object.keys(CATEGORIES).forEach((name) => {
    const card = el(
      "button",
      {
        class: "icon-card package",
        type: "button",
        role: "checkbox",
        "aria-checked": String(state.categories.has(name)),
        onClick: () => {
          if (state.categories.has(name)) {
            state.categories.delete(name);
          } else {
            state.categories.add(name);
            // initialize maps for this category
            if (!state.selectedByCat.has(name))
              state.selectedByCat.set(name, new Set());
            const cfg = CATEGORIES[name];
            if (cfg && cfg.essentialPack && !state.essentialByCat.has(name)) {
              state.essentialByCat.set(name, true); // auto-include essentials
            }
          }
          // Update visual state without re-rendering all cards
          const checked = state.categories.has(name);
          card.classList.toggle("selected", checked);
          card.setAttribute("aria-checked", String(checked));
        },
      },
      [
        el("div", { class: "pkg-left" }, [
          (() => {
            const wrap = el("div", { class: "icon" });
            try {
              const kind = name.toLowerCase();
              const map = {
                clinic: "clinic",
                hospital: "hospital",
                pharmacy: "pharmacy",
                lab: "lab",
              };
              const icon = svgIcon(map[kind] || "upgrade");
              if (icon) wrap.appendChild(icon);
              else wrap.appendChild(document.createTextNode(name[0]));
            } catch (e) {
              wrap.appendChild(document.createTextNode(name[0]));
            }
            return wrap;
          })(),
          el("div", { class: "label", text: name }),
          el("div", { class: "desc", text: DESCRIPTIONS[name] || "" }),
        ]),
        el("div", { class: "pkg-right" }, [
          el("span", { class: "pkg-check", "aria-hidden": "true" }),
        ]),
      ]
    );
    if (state.categories.has(name)) card.classList.add("selected");
    categoryIcons.appendChild(card);
  });

  if (categoryIcons.childElementCount === 0) {
    console.warn("Category cards failed to render; using fallback.");
    Object.keys(CATEGORIES).forEach((name) => {
      const btn = el(
        "button",
        {
          class: "secondary",
          type: "button",
          onClick: () => {
            state.category = name;
            [...categoryIcons.children].forEach((c) =>
              c.classList.remove("selected")
            );
            btn.classList.add("selected");
          },
        },
        name
      );
      categoryIcons.appendChild(btn);
    });
  }
}

// Render modules (Step 3) with cards
function renderModules() {
  const cats = [...state.categories];
  const hasAny = cats.length > 0;
  modulesSection.hidden = !hasAny;
  if (!hasAny) return;

  modulesSection.innerHTML = "";

  function renderAddonCards(container, modulesArr, tagText, catName) {
    container.innerHTML = "";
    container.classList.add("card-grid");
    modulesArr.forEach((m) => {
      const set = state.selectedByCat.get(catName) || new Set();
      const added = set.has(m.id);
      const card = el(
        "button",
        {
          class: "mod-card pill" + (added ? " selected" : ""),
          type: "button",
          role: "checkbox",
          "aria-checked": String(added),
          onClick: () => {
            const s = state.selectedByCat.get(catName) || new Set();
            const isSelected = s.has(m.id);
            if (isSelected) s.delete(m.id);
            else s.add(m.id);
            state.selectedByCat.set(catName, s);
            // Update just this card to avoid page blink
            card.classList.toggle("selected", !isSelected);
            card.setAttribute("aria-checked", String(!isSelected));
          },
        },
        [
          el("div", { class: "title", role: "text" }, m.name),
          el("div", { class: "right" }, [
            el("span", { class: "meta" }, tagText),
            el("span", { class: "checkmark", "aria-hidden": "true" }),
          ]),
        ]
      );
      container.appendChild(card);
    });
  }

  function renderUpgradeFree(container, items) {
    if (!items || !items.length) return;
    const wrap = el("div", { class: "card-grid" });
    items.forEach((name) => {
      const card = el(
        "div",
        {
          class: "mod-card pill free",
          role: "note",
          "aria-disabled": "true",
        },
        [
          el("div", { class: "title", role: "text" }, name),
          el("div", { class: "right" }, [
            el("span", { class: "meta" }, "Free"),
          ]),
        ]
      );
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
  }

  cats.forEach((catName) => {
    const cfg = CATEGORIES[catName];
    const section = el("div", { class: "module-block" }, [
      el("h3", {}, `${catName} – Included (Free)`),
      el("div", { class: "info-list" }),
    ]);
    // Free list
    cfg.free.forEach((n) => {
      section.children[1].appendChild(
        el("div", { class: "info-pill" }, [
          el("span", {}, n),
          el("span", { class: "price" }, "0 PKR"),
        ])
      );
    });

    // Essential (auto-included if present)
    if (cfg.essentialPack) {
      if (!state.essentialByCat.has(catName))
        state.essentialByCat.set(catName, true);
      const essCard = el("div", { class: "mod-card selected" }, [
        el("div", { class: "title" }, ["Essential Pack"]),
        el("div", { class: "meta" }, "Includes:"),
        el(
          "div",
          { class: "badges" },
          cfg.essentialPack.includes.map((inc) =>
            el("span", { class: "badge" }, inc)
          )
        ),
        el("div", { class: "meta" }, `Price: ${fmt(cfg.essentialPack.price)}`),
        el("div", { class: "actions" }, [
          el("span", { class: "tag essential" }, "Included"),
        ]),
      ]);
      section.appendChild(essCard);
    }

    // Paid
    if (cfg.paid && cfg.paid.length) {
      const paidWrap = el("div", { class: "module-block" }, [
        el("h3", {}, "Optional Add-ons"),
        el("div", { class: "upgrade-free" }),
        el("div", { class: "checklist" }),
      ]);
      // Show upgrade-free items inside upgrade block
      if (cfg.upgradeFree && cfg.upgradeFree.length) {
        renderUpgradeFree(paidWrap.children[1], cfg.upgradeFree);
      }
      // Paid selectable add-ons
      renderAddonCards(
        paidWrap.children[2],
        cfg.paid,
        "Optional add-on",
        catName
      );
      section.appendChild(paidWrap);
    }

    // Extras
    if (cfg.extras && cfg.extras.length) {
      const extraWrap = el("div", { class: "module-block" }, [
        el("h3", {}, "Extra Modules"),
        el("div", { class: "checklist" }),
      ]);
      renderAddonCards(
        extraWrap.children[1],
        cfg.extras,
        "Extra add-on",
        catName
      );
      section.appendChild(extraWrap);
    }

    modulesSection.appendChild(section);
  });
}

// Simple SVG icon helper
function svgIcon(kind) {
  const ns = "http://www.w3.org/2000/svg";
  const s = document.createElementNS(ns, "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("aria-hidden", "true");
  s.classList.add("svg");
  // Use outline style for a clean, professional look
  s.setAttribute("fill", "none");
  s.setAttribute("stroke", "currentColor");
  s.setAttribute("stroke-width", "2");
  s.setAttribute("stroke-linecap", "round");
  s.setAttribute("stroke-linejoin", "round");

  function path(d) {
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    return p;
  }
  function rect(x, y, w, h, rx = 0) {
    const r = document.createElementNS(ns, "rect");
    r.setAttribute("x", String(x));
    r.setAttribute("y", String(y));
    r.setAttribute("width", String(w));
    r.setAttribute("height", String(h));
    if (rx) r.setAttribute("rx", String(rx));
    return r;
  }
  function circle(cx, cy, r) {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", String(cx));
    c.setAttribute("cy", String(cy));
    c.setAttribute("r", String(r));
    return c;
  }

  switch (kind) {
    case "clinic": {
      // Medical cross inside a circle
      s.appendChild(circle(12, 12, 8));
      s.appendChild(path("M12 8v8M8 12h8"));
      break;
    }
    case "hospital": {
      // Simple office/building with a medical cross
      s.appendChild(rect(5, 3, 14, 18, 2));
      s.appendChild(path("M9 7h6M9 11h6"));
      s.appendChild(path("M12 9v4M10 11h4"));
      s.appendChild(path("M12 17v4"));
      break;
    }
    case "pharmacy": {
      // Capsule / pill at a slight angle
      s.appendChild(path("M15.5 8.5l-7 7a3 3 0 1 0 4.24 4.24l7-7a3 3 0 1 0-4.24-4.24z"));
      s.appendChild(path("M11 13l2 2"));
      break;
    }
    case "lab": {
      // Laboratory flask
      s.appendChild(path("M10 2h4"));
      s.appendChild(path("M10 2v6l-4 8a3 3 0 0 0 2.7 4h6.6a3 3 0 0 0 2.7-4l-4-8V2"));
      s.appendChild(path("M8 14h8"));
      break;
    }
    case "essential": {
      // Star-like badge
      s.appendChild(path("M12 4l2.4 4.8 5.3.8-3.8 3.6.9 5.3L12 16.8 7.2 18.5l.9-5.3-3.8-3.6 5.3-.8L12 4z"));
      break;
    }
    case "upgrade": {
      // Arrow diamond
      s.appendChild(path("M12 3l7 7-7 7-7-7 7-7m0 4v6"));
      break;
    }
    default: {
      s.appendChild(rect(4, 4, 16, 16, 2));
    }
  }
  return s;
}

function renderFinalReview() {
  if (!finalReview) return;
  const name = document.getElementById("clientName").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const total = computeTotal();

  const list = el("div", { class: "summary-list" });
  // Group by category
  [...state.categories].forEach((cat) => {
    const cfg = CATEGORIES[cat];
    if (!cfg) return;
    list.appendChild(
      el("div", { class: "summary-item" }, [
        el("strong", {}, cat),
        el("span", {}, " "),
      ])
    );
    // essential
    if (cfg.essentialPack && state.essentialByCat.get(cat)) {
      list.appendChild(
        el("div", { class: "summary-item" }, [
          el("span", {}, `${cat} – Essential Pack`),
          el("span", {}, fmt(cfg.essentialPack.price)),
        ])
      );
    }
    // upgrade-free items
    if (cfg.upgradeFree && cfg.upgradeFree.length) {
      cfg.upgradeFree.forEach((n) => {
        list.appendChild(
          el("div", { class: "summary-item" }, [
            el("span", {}, `${cat} – ${n}`),
            el("span", {}, "0 PKR"),
          ])
        );
      });
    }
    const map = new Map();
    [...cfg.paid, ...cfg.extras].forEach((m) => map.set(m.id, m));
    const s = state.selectedByCat.get(cat) || new Set();
    s.forEach((id) => {
      const m = map.get(id);
      if (!m) return;
      list.appendChild(
        el("div", { class: "summary-item" }, [
          el("span", {}, `${cat} – ${m.name}`),
          el("span", {}, fmt(m.price)),
        ])
      );
    });
  });

  finalReview.innerHTML = "";
  finalReview.appendChild(
    el("div", { class: "review-header" }, [
      el("div", { class: "review-row" }, `Name: ${name}`),
      el("div", { class: "review-row" }, `Email: ${email || "-"}`),
      el("div", { class: "review-row" }, `Mobile: ${mobile}`),
      el(
        "div",
        { class: "review-row" },
        `Categories: ${[...state.categories].join(", ") || "-"}`
      ),
    ])
  );
  finalReview.appendChild(list);
  finalReview.appendChild(
    el(
      "button",
      {
        class: "review-total",
        type: "button",
        title: "Send quotation on WhatsApp",
        onClick: () => sendWhatsAppQuote(),
      },
      `Total: ${fmt(total)}`
    )
  );
}

function composeWhatsAppMessage() {
  const name = document.getElementById("clientName").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const date = new Date().toLocaleDateString();
  const lines = [];
  lines.push("Software Sales Quotation");
  lines.push("Health Spire Pvt Ltd");
  lines.push(`Date: ${date}`);
  lines.push("");
  lines.push(`Client: ${name || "-"}`);
  if (email) lines.push(`Email: ${email}`);
  if (mobile) lines.push(`Mobile: ${mobile}`);
  lines.push("");
  const cats = [...state.categories];
  if (cats.length) lines.push(`Categories: ${cats.join(", ")}`);
  lines.push("");
  // Table-like items
  lines.push("S/No | Description | Qty | Unit Price | Total");
  lines.push("-----|------------|-----|------------|------");
  let row = 1;
  const addRow = (desc, price) => {
    lines.push(
      `${String(row).padStart(2, "0")} | ${desc} | 01 | ${fmt(price)} | ${fmt(
        price
      )}`
    );
    row += 1;
  };
  cats.forEach((cat) => {
    const cfg = CATEGORIES[cat];
    if (!cfg) return;
    if (cfg.essentialPack && state.essentialByCat.get(cat)) {
      addRow(`${cat} – Essential Pack`, cfg.essentialPack.price);
    }
    const map = new Map();
    [...(cfg.paid || []), ...(cfg.extras || [])].forEach((m) => map.set(m.id, m));
    const s = state.selectedByCat.get(cat) || new Set();
    s.forEach((id) => {
      const m = map.get(id);
      if (m) addRow(`${cat} – ${m.name}`, m.price);
    });
  });
  lines.push("");
  const total = computeTotal();
  lines.push(`Total Amount Payable: ${fmt(total)}`);
  lines.push("");
  lines.push("Sent from Healthspire Price Calculator");
  return lines.join("\n");
}

function sendWhatsAppQuote() {
  const text = composeWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// State
const state = {
  step: 1,
  categories: new Set(), // selected category names
  selectedByCat: new Map(), // name -> Set(moduleIds)
  essentialByCat: new Map(), // name -> boolean
};

// DOM refs
const modulesSection = document.getElementById("modulesSection");
const freeModulesList = document.getElementById("freeModulesList");
const paidModules = document.getElementById("paidModules");
const paidModulesList = document.getElementById("paidModulesList");
const extraModules = document.getElementById("extraModules");
const extraModulesList = document.getElementById("extraModulesList");
const essentialPack = document.getElementById("essentialPack");
const essentialToggle = document.getElementById("essentialToggle");
const essentialPrice = document.getElementById("essentialPrice");
const essentialIncludes = document.getElementById("essentialIncludes");
const essentialLabel = document.getElementById("essentialLabel");
const summaryList = document.getElementById("summaryList");
const totalPriceEl = document.getElementById("totalPrice");
const totalContainer = document.querySelector(".total");
const form = document.getElementById("priceForm");
const stepper = document.getElementById("stepper");
const stepScreens = [
  document.getElementById("step-1"),
  document.getElementById("step-2"),
  document.getElementById("step-3"),
  document.getElementById("step-4"),
];
const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipBtn");
// no submit button anymore
const summaryPanel = document.getElementById("summaryPanel");
const categoryIcons = document.getElementById("categoryIcons");
const finalReview = document.getElementById("finalReview");
const topBackBtn = document.getElementById("topBackBtn");
const splash = document.getElementById("splash");
const startBtn = document.getElementById("startBtn");

// Make stepper steps clickable to navigate directly
if (stepper) {
  stepper.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".step");
    if (!btn) return;
    const to = Number(btn.getAttribute("data-step"));
    if (to >= 1 && to <= 4) showStep(to);
  });
}

if (essentialToggle) {
  essentialToggle.addEventListener("change", () => {
    state.essential = essentialToggle.checked;
    if (state.essential) {
      essentialPack.classList.add("highlight");
    } else {
      essentialPack.classList.remove("highlight");
    }
    if (state.step === 4) renderSummary();
  });
}

// Step navigation
function updateStepper() {
  if (!stepper) return;
  const nodes = stepper.querySelectorAll(".step");
  nodes.forEach((n) => {
    const s = Number(n.getAttribute("data-step"));
    n.classList.toggle("active", s === state.step);
    n.classList.toggle("done", s < state.step);
  });
}

function showStep(n) {
  state.step = n;
  // persist step so refresh returns to the same page
  try {
    if (window.localStorage) window.localStorage.setItem(STEP_KEY, String(n));
  } catch (e) {}
  stepScreens.forEach((el, idx) => {
    if (!el) return;
    const isTarget = idx === n - 1;
    el.hidden = !isTarget;
    if (isTarget) {
      el.classList.remove("fade-in");
      // force reflow for restart animation
      void el.offsetWidth;
      el.classList.add("fade-in");
    }
  });
  // Buttons visibility
  if (topBackBtn) topBackBtn.disabled = n === 1;
  // Only show Skip on step 3
  skipBtn.hidden = n !== 3;
  // Hide Next on review (step 4)
  nextBtn.hidden = n === 4;
  // Summary panel only on step 4
  if (summaryPanel) summaryPanel.hidden = n !== 4;
  updateStepper();
  if (n === 2) renderCategoryIcons();
  if (n === 3) renderModules();
  if (n === 4) {
    renderSummary();
    renderFinalReview();
  }
}

// bottom Back button removed

if (topBackBtn) {
  topBackBtn.addEventListener("click", () => {
    if (state.step > 1) showStep(state.step - 1);
  });
}

// Splash start handler: reveal app when user clicks the circular button
if (startBtn) {
  startBtn.addEventListener("click", () => {
    document.body.classList.add("started");
    try {
      if (window.localStorage) {
        window.localStorage.setItem(START_KEY, "1");
      }
    } catch (e) {}
    const nameInput = document.getElementById("clientName");
    if (nameInput) nameInput.focus();
  });
} else {
  // If splash is not present, ensure the app is visible
  document.body.classList.add("started");
}

nextBtn.addEventListener("click", () => {
  if (state.step === 1) {
    // validate basic info
    const name = document.getElementById("clientName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    if (!name || !mobile) {
      alert("Please fill in required info.");
      return;
    }
    showStep(2);
  } else if (state.step === 2) {
    if (state.categories.size === 0) {
      alert("Please select at least one category.");
      return;
    }
    showStep(3);
  } else if (state.step === 3) {
    showStep(4);
  }
});

skipBtn.addEventListener("click", () => {
  // allow skipping add-ons step, go to review
  showStep(4);
});

function onToggle(id, checked, cat) {
  const s = state.selectedByCat.get(cat) || new Set();
  if (checked) s.add(id);
  else s.delete(id);
  state.selectedByCat.set(cat, s);
  renderSummary();
}

function computeTotal() {
  let total = 0;
  [...state.categories].forEach((cat) => {
    const cfg = CATEGORIES[cat];
    if (!cfg) return;
    if (cfg.essentialPack && state.essentialByCat.get(cat))
      total += cfg.essentialPack.price;
    const map = new Map();
    [...cfg.paid, ...cfg.extras].forEach((m) => map.set(m.id, m.price));
    const s = state.selectedByCat.get(cat) || new Set();
    s.forEach((id) => (total += map.get(id) || 0));
  });
  return total;
}

function renderSummary() {
  if (state.categories.size === 0) {
    summaryList.innerHTML = "";
    totalPriceEl.textContent = "0 PKR";
    return;
  }
  summaryList.innerHTML = "";

  [...state.categories].forEach((cat) => {
    const cfg = CATEGORIES[cat];
    if (!cfg) return;
    summaryList.appendChild(
      el("div", { class: "summary-item" }, [
        el("strong", {}, cat),
        el("span", {}, " "),
      ])
    );
    if (cfg.essentialPack && state.essentialByCat.get(cat)) {
      summaryList.appendChild(
        el("div", { class: "summary-item" }, [
          el("span", {}, `Essential Pack`),
          el("span", {}, "Added"),
        ])
      );
    }
    // upgrade-free items in summary
    if (cfg.upgradeFree && cfg.upgradeFree.length) {
      cfg.upgradeFree.forEach((n) => {
        summaryList.appendChild(
          el("div", { class: "summary-item" }, [
            el("span", {}, n),
            el("span", {}, "Free"),
          ])
        );
      });
    }
    const map = new Map();
    [...cfg.paid, ...cfg.extras].forEach((m) => map.set(m.id, m));
    const s = state.selectedByCat.get(cat) || new Set();
    s.forEach((id) => {
      const m = map.get(id);
      if (!m) return;
      const item = el("div", { class: "summary-item" }, [
        el("span", {}, m.name),
        el("span", {}, fmt(m.price)),
      ]);
      summaryList.appendChild(item);
    });
  });

  // Total and color
  const total = computeTotal();
  totalPriceEl.textContent = fmt(total);
  totalContainer.classList.remove("low", "mid", "high");
  if (total < 20000) totalContainer.classList.add("low");
  else if (total < 60000) totalContainer.classList.add("mid");
  else totalContainer.classList.add("high");
}

// Submit handling
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (state.step !== 4) return;
  if (state.categories.size === 0) {
    alert("Please select a category.");
    return;
  }
  const name = document.getElementById("clientName").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const total = computeTotal();
  const selections = [];
  [...state.categories].forEach((cat) => {
    const cfg = CATEGORIES[cat];
    if (cfg.essentialPack && state.essentialByCat.get(cat)) {
      selections.push({
        category: cat,
        name: "Essential Pack",
        price: cfg.essentialPack.price,
      });
    }
    const map = new Map();
    [...cfg.paid, ...cfg.extras].forEach((m) => map.set(m.id, m));
    const s = state.selectedByCat.get(cat) || new Set();
    s.forEach((id) => {
      const m = map.get(id);
      if (m) selections.push({ category: cat, name: m.name, price: m.price });
    });
  });

  const payload = {
    timestamp: new Date().toISOString(),
    name,
    email,
    mobile,
    categories: [...state.categories],
    modules: selections,
    total,
  };

  // Backend disabled for now; just show a confirmation so frontend logic can be tested
  console.log("Submission payload (backend disabled):", payload);
  alert("Submission noted. Backend is temporarily disabled.");
});

// Initialize
showStep(INITIAL_STEP);
