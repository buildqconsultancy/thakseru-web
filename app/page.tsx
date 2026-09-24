"use client";

import { useState } from "react";

interface WallRow {
  id: number;
  length: string;
  height: string;
  isGable: boolean;
}

interface OpeningRow {
  id: number;
  width: string;
  height: string;
  count: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"brick" | "concrete" | "tile">("brick");

  // ----------------- CONCRETE CALCULATOR STATE -----------------
  const [concreteElement, setConcreteElement] = useState<"slab" | "column" | "footing" | "beam">("slab");
  
  // Slab & Beams
  const [slabLength, setSlabLength] = useState("");
  const [slabWidth, setSlabWidth] = useState("");
  const [slabThickness, setSlabThickness] = useState("");
  const [includeBeams, setIncludeBeams] = useState(false);
  const [beamLength, setBeamLength] = useState("");
  const [beamWidth, setBeamWidth] = useState("");
  const [beamDepth, setBeamDepth] = useState("");

  // Column / Footing / Beam
  const [elemLength, setElemLength] = useState("");
  const [elemWidth, setElemWidth] = useState("");
  const [elemDepth, setElemDepth] = useState("");
  const [elemCount, setElemCount] = useState("");

  // Mix & Wastage
  const [concreteRatio, setConcreteRatio] = useState<"1:1.5:3" | "1:2:4" | "1:3:6">("1:2:4");
  const [addWastage, setAddWastage] = useState(false);

  // ----------------- BRICK & BLOCK ESTIMATOR STATE -----------------
  const [wallType, setWallType] = useState<string>("brick_9");
  const [walls, setWalls] = useState<WallRow[]>([
    { id: 1, length: "", height: "", isGable: false },
  ]);
  const [doors, setDoors] = useState<OpeningRow[]>([]);
  const [windows, setWindows] = useState<OpeningRow[]>([]);

  // ----------------- TILE & PAINT STATE -----------------
  const [roomLength, setRoomLength] = useState("");
  const [roomWidth, setRoomWidth] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [tileSize, setTileSize] = useState("2x2");
  
  // Skirting
  const [includeSkirting, setIncludeSkirting] = useState(false);
  const [skirtingHeight, setSkirtingHeight] = useState("4"); // inches

  // Tile/Paint Openings Deduction
  const [tileDoors, setTileDoors] = useState<OpeningRow[]>([]);
  const [tileWindows, setTileWindows] = useState<OpeningRow[]>([]);

  // ================= CALCULATIONS =================

  // Concrete Calculation
  const calcConcrete = () => {
    let totalWetVol = 0;

    if (concreteElement === "slab") {
      const sl = parseFloat(slabLength) || 0;
      const sw = parseFloat(slabWidth) || 0;
      const st = (parseFloat(slabThickness) || 0) / 12;
      totalWetVol = sl * sw * st;

      if (includeBeams) {
        const bl = parseFloat(beamLength) || 0;
        const bw = (parseFloat(beamWidth) || 0) / 12;
        const bd = (parseFloat(beamDepth) || 0) / 12;
        totalWetVol += bl * bw * bd;
      }
    } else {
      // Column, Footing, Beam
      const l = parseFloat(elemLength) || 0;
      const w = (parseFloat(elemWidth) || 0) / 12; // width in inches converted to feet
      const d = (parseFloat(elemDepth) || 0) / 12; // depth in inches converted to feet
      const count = parseFloat(elemCount) || 0;
      totalWetVol = l * w * d * count;
    }

    if (totalWetVol === 0) return { cement: 0, sand: "0.00", metal: "0.00", wetVol: "0.0" };

    const wastageMultiplier = addWastage ? 1.05 : 1.0;
    const dryVol = totalWetVol * 1.54 * wastageMultiplier;

    let cRatio = 1;
    let sRatio = 2;
    let mRatio = 4;

    if (concreteRatio === "1:1.5:3") {
      cRatio = 1;
      sRatio = 1.5;
      mRatio = 3;
    } else if (concreteRatio === "1:3:6") {
      cRatio = 1;
      sRatio = 3;
      mRatio = 6;
    }

    const totalParts = cRatio + sRatio + mRatio;
    const cementBags = ((dryVol * cRatio) / totalParts) / 1.25;
    const sandCubes = ((dryVol * sRatio) / totalParts) / 100;
    const metalCubes = ((dryVol * mRatio) / totalParts) / 100;

    return {
      cement: Math.ceil(cementBags),
      sand: sandCubes.toFixed(2),
      metal: metalCubes.toFixed(2),
      wetVol: totalWetVol.toFixed(1),
    };
  };

  // Brick & Block Calculation
  const materialRates: Record<string, { unitsPerSqr: number; cementBags?: number; sandCubes?: number; zulkaBagsPerSqr?: number; isAdhesive: boolean; unitName: string }> = {
    brick_4_5: { unitsPerSqr: 578, cementBags: 1.3, sandCubes: 0.10, isAdhesive: false, unitName: "ගඩොල් (කැට)" },
    brick_9: { unitsPerSqr: 1155, cementBags: 2.8, sandCubes: 0.22, isAdhesive: false, unitName: "ගඩොල් (කැට)" },
    local_block_4: { unitsPerSqr: 140, cementBags: 1.1, sandCubes: 0.10, isAdhesive: false, unitName: "බ්ලොක් ගල් (ගල්)" },
    sls_block_4: { unitsPerSqr: 122, zulkaBagsPerSqr: 1.36, isAdhesive: true, unitName: "බ්ලොක් ගල් (ගල්)" },
    sls_block_6: { unitsPerSqr: 122, zulkaBagsPerSqr: 2.03, isAdhesive: true, unitName: "බ්ලොක් ගල් (ගල්)" },
    sls_block_8: { unitsPerSqr: 122, zulkaBagsPerSqr: 2.71, isAdhesive: true, unitName: "බ්ලොක් ගල් (ගල්)" }
  };

  const calcBrickBlock = () => {
    let grossArea = 0;
    walls.forEach((w) => {
      const l = parseFloat(w.length) || 0;
      const h = parseFloat(w.height) || 0;
      if (l > 0 && h > 0) {
        grossArea += w.isGable ? 0.5 * l * h : l * h;
      }
    });

    let doorArea = 0;
    doors.forEach((d) => {
      const w = parseFloat(d.width) || 0;
      const h = parseFloat(d.height) || 0;
      const c = parseFloat(d.count) || 0;
      doorArea += w * h * c;
    });

    let winArea = 0;
    windows.forEach((win) => {
      const w = parseFloat(win.width) || 0;
      const h = parseFloat(win.height) || 0;
      const c = parseFloat(win.count) || 0;
      winArea += w * h * c;
    });

    const totalDeductions = doorArea + winArea;
    const netArea = Math.max(0, grossArea - totalDeductions);
    const squares = netArea / 100;

    const rate = materialRates[wallType] || materialRates.brick_9;
    const totalUnits = Math.ceil(squares * rate.unitsPerSqr);

    let cement = "0.0";
    let sand = "0.00";
    let zulka = "0.00";

    if (rate.isAdhesive) {
      zulka = (squares * (rate.zulkaBagsPerSqr || 0)).toFixed(2);
    } else {
      cement = (squares * (rate.cementBags || 0)).toFixed(1);
      sand = (squares * (rate.sandCubes || 0)).toFixed(2);
    }

    return {
      grossArea: grossArea.toFixed(1),
      deductions: totalDeductions.toFixed(1),
      netArea: netArea.toFixed(1),
      totalUnits: totalUnits.toLocaleString(),
      unitName: rate.unitName,
      cement,
      sand,
      zulka,
      isAdhesive: rate.isAdhesive,
    };
  };

  // Tile & Paint Calculation
  const calcTilePaint = () => {
    const l = parseFloat(roomLength) || 0;
    const w = parseFloat(roomWidth) || 0;
    const h = parseFloat(wallHeight) || 0;

    // Floor Area
    const floorArea = l * w;

    // Skirting calculation
    let skirtingSqft = 0;
    let doorWidthTotal = 0;
    tileDoors.forEach((d) => {
      doorWidthTotal += (parseFloat(d.width) || 0) * (parseFloat(d.count) || 0);
    });

    if (includeSkirting && l > 0 && w > 0) {
      const perimeter = Math.max(0, 2 * (l + w) - doorWidthTotal);
      const skH = (parseFloat(skirtingHeight) || 4) / 12; // to feet
      skirtingSqft = perimeter * skH;
    }

    const totalTileArea = (floorArea + skirtingSqft) * 1.1; // 10% wastage

    let tileSqft = 4;
    if (tileSize === "1x1") tileSqft = 1;
    if (tileSize === "2x1") tileSqft = 2;

    const tilesNeeded = totalTileArea > 0 ? Math.ceil(totalTileArea / tileSqft) : 0;

    // Paint Calculation (Internal 4 walls)
    let grossWallArea = 0;
    if (l > 0 && w > 0 && h > 0) {
      grossWallArea = 2 * (l + w) * h;
    }

    let openingsDeduction = 0;
    tileDoors.forEach((d) => {
      openingsDeduction += (parseFloat(d.width) || 0) * (parseFloat(d.height) || 0) * (parseFloat(d.count) || 0);
    });
    tileWindows.forEach((win) => {
      openingsDeduction += (parseFloat(win.width) || 0) * (parseFloat(win.height) || 0) * (parseFloat(win.count) || 0);
    });

    const netWallArea = Math.max(0, grossWallArea - openingsDeduction);
    // Coverage approx 120 sq.ft per liter for 2 coats
    const paintLiters = netWallArea > 0 ? Math.ceil(netWallArea / 120) : 0;

    return {
      floorArea: floorArea.toFixed(1),
      netWallArea: netWallArea.toFixed(1),
      tilesNeeded,
      paintLiters,
    };
  };

  const concreteResult = calcConcrete();
  const brickResult = calcBrickBlock();
  const tileResult = calcTilePaint();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 py-3">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="තක්සේරු.lk"
              className="h-20 sm:h-24 md:h-28 w-auto max-w-[280px] object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.55)]"
            />
          </div>
          <a
            href="#boq-packages"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 transition-all duration-200"
          >
            <span>Certified BOQ Packages</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-12 text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Digital Quantity Estimating & BOQ
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6">
            ගෙදර හදන්න කලින්, <br />
            වියදම සහ{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              BOQ එක හරියටම
            </span>{" "}
            තක්සේරු කරගන්න.
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            අපතේ යාම් අවම කර ඉදිකිරීම් පිරිවැය නිවැරදිව පාලනය කරන්න. ඔබේ නිවසේ අවශ්‍යතාවට ගැළපෙන <strong>Certified BOQ වාර්තාවක්</strong> විශ්වාසනීයව ලබාගන්න.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#boq-packages"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-sky-500/25 transition duration-200"
            >
              Certified BOQ සේවාවන් බලන්න
            </a>
            <a
              href="#calculators"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold px-6 py-3.5 rounded-xl transition duration-200"
            >
              ද්‍රව්‍ය ගණනය කරන්න ↓
            </a>
          </div>
        </div>
      </section>

      {/* BOQ Packages Section */}
      <section id="boq-packages" className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">Professional Packages</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-1">Certified BOQ විසඳුම්</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Package 1 */}
          <div className="bg-slate-900/90 border border-sky-500/40 rounded-3xl p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Fast Track
                </span>
                <span className="text-xs font-mono bg-sky-950 text-sky-300 px-2.5 py-1 rounded-lg border border-sky-800">
                  පැය 48න්
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bank Loan Certified BOQ</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                ශ්‍රී ලංකාවේ සියලුම රාජ්‍ය සහ පෞද්ගලික බැංකු ණය අනුමත කරගැනීම සඳහා විශේෂයෙන් සකස් කළ Certified BOQ වාර්තාව.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><span className="text-sky-400">✓</span> බැංකු ප්‍රමිතීන්ට අනුකූල පිරිවැය වාර්තාව</li>
                <li className="flex items-center gap-2"><span className="text-sky-400">✓</span> පැය 48ක් ඇතුළත සම්පූර්ණ කර දීම</li>
                <li className="flex items-center gap-2"><span className="text-sky-400">✓</span> නිල සහතික කිරීම (Certified) සහිතයි</li>
              </ul>
            </div>
            <a
              href="https://wa.me/94779002574?text=Bank%20Loan%20BOQ%20(48%20Hours)%20ekak%20hadaganna%20uwamanawei"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition duration-200"
            >
              Bank BOQ එකක් ඇණවුම් කරන්න
            </a>
          </div>

          {/* Package 2 */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Full Project
                </span>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  දින 14න්
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comprehensive Detailed BOQ</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                ඉදිකිරීම් කොන්ත්‍රාත්තු, අමුද්‍රව්‍ය ප්‍රමාණ පාලනය, බිල්පත් පරීක්ෂාව සහ සම්පූර්ණ අඩවි කළමනාකරණය සඳහා සවිස්තරාත්මක BOQ වාර්තාව.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Item-by-item සවිස්තරාත්මක Take-off</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Material, Labour & Plant Breakdowns</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> කොන්ත්‍රාත්කරුවන් පාලනයට හා Cashflow සැලසුමට සුදුසුයි</li>
              </ul>
            </div>
            <a
              href="https://wa.me/94779002574?text=Comprehensive%20Detailed%20BOQ%20(14%20Days)%20ekak%20hadaganna%20uwamanawei"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition duration-200"
            >
              Detailed BOQ විස්තර විමසන්න
            </a>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculators" className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Smart Material Estimator</h2>
          <p className="text-slate-400 text-sm mt-1">ඉදිකිරීම් අංශය තෝරා මිනුම් ඇතුළත් කරන්න</p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl max-w-lg mx-auto mb-8">
          <button
            onClick={() => setActiveTab("brick")}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === "brick"
                ? "bg-sky-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ගඩොල් සහ බ්ලොක්
          </button>
          <button
            onClick={() => setActiveTab("concrete")}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === "concrete"
                ? "bg-sky-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Concrete Calculator
          </button>
          <button
            onClick={() => setActiveTab("tile")}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === "tile"
                ? "bg-sky-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ටයිල් සහ තීන්ත
          </button>
        </div>

        {/* ---------------- 1. BRICK & BLOCK ESTIMATOR ---------------- */}
        {activeTab === "brick" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h3 className="font-bold text-xl text-white">Brick & Block Estimator</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                දොර, ජනෙල් අඩු කිරීම් සහ Gable බිත්ති සහිත නිවැරදි ගණනය කිරීම
              </p>
            </div>

            {/* Material & Wall Thickness */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Masonry Material & Wall Thickness (වර්ගය සහ ඝනකම)
              </label>
              <select
                value={wallType}
                onChange={(e) => setWallType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="brick_4_5">4.5" රතු ගඩොල් (Single Brick) — 9" x 4¼" x 2¾" (225x108x70mm)</option>
                <option value="brick_9">9" රතු ගඩොල් (Double Brick) — 9" x 4¼" x 2¾" (225x108x70mm)</option>
                <option value="local_block_4">4" සාමාන්‍ය බ්ලොක් ගල් — 14" x 7" x 4" (350 x 175 x 100 mm)</option>
                <option value="sls_block_4">4" SLS Standard බ්ලොක් ගල් — 390 x 100 x 190 mm</option>
                <option value="sls_block_6">6" SLS Standard බ්ලොක් ගල් — 390 x 150 x 190 mm</option>
                <option value="sls_block_8">8" SLS Standard බ්ලොක් ගල් — 390 x 200 x 190 mm</option>
              </select>
            </div>

            {/* Walls Section */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Walls (බිත්ති මිමි - අඩි වලින්)
                </span>
                <button
                  onClick={() => setWalls([...walls, { id: Date.now(), length: "", height: "", isGable: false }])}
                  className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  + Add Wall
                </button>
              </div>

              <div className="space-y-2.5">
                {walls.map((w, idx) => (
                  <div key={w.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-sm">
                    <span className="text-xs font-bold text-slate-400 w-16">Wall {idx + 1}</span>
                    <input
                      type="number"
                      placeholder="දිග (e.g. 15)"
                      value={w.length}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWalls(walls.map((item) => (item.id === w.id ? { ...item, length: val } : item)));
                      }}
                      className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="number"
                      placeholder="උස (e.g. 10)"
                      value={w.height}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWalls(walls.map((item) => (item.id === w.id ? { ...item, height: val } : item)));
                      }}
                      className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 ml-auto cursor-pointer">
                      <input
                        type="checkbox"
                        checked={w.isGable}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setWalls(walls.map((item) => (item.id === w.id ? { ...item, isGable: checked } : item)));
                        }}
                        className="rounded text-sky-500"
                      />
                      Gable (ත්‍රිකෝණ)
                    </label>
                    {walls.length > 1 && (
                      <button
                        onClick={() => setWalls(walls.filter((item) => item.id !== w.id))}
                        className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded text-xs ml-1 transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doors Section */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Doors (දොරවල් අඩු කිරීම් - ft)
                </span>
                <button
                  onClick={() => setDoors([...doors, { id: Date.now(), width: "", height: "", count: "1" }])}
                  className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  + Add Door
                </button>
              </div>

              {doors.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">අඩු කිරීමට දොරවල් තිබේ නම් + Add Door ක්ලික් කරන්න</p>
              ) : (
                <div className="space-y-2.5">
                  {doors.map((d, idx) => (
                    <div key={d.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-sm">
                      <span className="text-xs font-bold text-slate-400 w-16">Door {idx + 1}</span>
                      <input
                        type="number"
                        placeholder="පළල (e.g. 3)"
                        value={d.width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDoors(doors.map((item) => (item.id === d.id ? { ...item, width: val } : item)));
                        }}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="උස (e.g. 7)"
                        value={d.height}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDoors(doors.map((item) => (item.id === d.id ? { ...item, height: val } : item)));
                        }}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="ගණන"
                        value={d.count}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDoors(doors.map((item) => (item.id === d.id ? { ...item, count: val } : item)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => setDoors(doors.filter((item) => item.id !== d.id))}
                        className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded text-xs ml-auto transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Windows Section */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Windows (ජනෙල් අඩු කිරීම් - ft)
                </span>
                <button
                  onClick={() => setWindows([...windows, { id: Date.now(), width: "", height: "", count: "1" }])}
                  className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  + Add Window
                </button>
              </div>

              {windows.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">අඩු කිරීමට ජනෙල් තිබේ නම් + Add Window ක්ලික් කරන්න</p>
              ) : (
                <div className="space-y-2.5">
                  {windows.map((win, idx) => (
                    <div key={win.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-sm">
                      <span className="text-xs font-bold text-slate-400 w-16">Win {idx + 1}</span>
                      <input
                        type="number"
                        placeholder="පළල (e.g. 4)"
                        value={win.width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWindows(windows.map((item) => (item.id === win.id ? { ...item, width: val } : item)));
                        }}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="උස (e.g. 4)"
                        value={win.height}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWindows(windows.map((item) => (item.id === win.id ? { ...item, height: val } : item)));
                        }}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="ගණන"
                        value={win.count}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWindows(windows.map((item) => (item.id === win.id ? { ...item, count: val } : item)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => setWindows(windows.filter((item) => item.id !== win.id))}
                        className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded text-xs ml-auto transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results Display */}
            <div className="bg-slate-950 border border-sky-500/30 rounded-2xl p-6 shadow-xl space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">මුළු වර්ගඵලය (Gross Area):</span>
                <strong className="text-white font-mono">{brickResult.grossArea} Sq.ft</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">දොර ජනෙල් අඩු කිරීම් (Deductions):</span>
                <strong className="text-red-400 font-mono">-{brickResult.deductions} Sq.ft</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-300 font-bold">ශුද්ධ වර්ගඵලය (Net Area):</span>
                <strong className="text-sky-400 font-mono text-base">{brickResult.netArea} Sq.ft</strong>
              </div>
              <div className="flex justify-between items-center py-2 bg-slate-900/90 px-3.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold">{brickResult.unitName} ප්‍රමාණය:</span>
                <strong className="text-2xl font-black text-white">{brickResult.totalUnits}</strong>
              </div>

              {!brickResult.isAdhesive ? (
                <>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">බඳින්න සිමෙන්ති (50kg Bags):</span>
                    <strong className="text-white font-mono">{brickResult.cement} Bags</strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">බඳින්න වැලි (Sand Cubes):</span>
                    <strong className="text-white font-mono">{brickResult.sand} Cubes</strong>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center py-1">
                  <span className="text-amber-400 font-semibold">Zulka Easy Paste (25kg Bags):</span>
                  <strong className="text-amber-300 font-mono text-base">{brickResult.zulka} Bags</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- 2. CONCRETE MATERIAL CALCULATOR ---------------- */}
        {activeTab === "concrete" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h3 className="font-bold text-xl text-white">Concrete Material Calculator</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                කොන්ක්‍රීට් අංගය සහ මිශ්‍රණ අනුපාතය තෝරා අවශ්‍ය ද්‍රව්‍ය ගණනය කරන්න
              </p>
            </div>

            {/* Element Selector Dropdown */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Concrete Element (කොන්ක්‍රීට් අංගය තෝරන්න)
              </label>
              <select
                value={concreteElement}
                onChange={(e) => setConcreteElement(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="slab">ස්ලැබ් සහ බීම් (Slab & Beams)</option>
                <option value="column">කොලම් (Columns)</option>
                <option value="footing">ෆුටින් / පාදම් (Footings)</option>
                <option value="beam">බීම් / ලින්ටල් (Beams / Lintels)</option>
              </select>
            </div>

            {/* Dynamic Inputs Based on Element */}
            {concreteElement === "slab" ? (
              <div className="mb-6 space-y-4">
                <span className="block text-sm font-bold text-slate-200">ස්ලැබ් එකේ මිනුම් (Slab Dimensions)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">දිග (අඩි - Feet)</label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={slabLength}
                      onChange={(e) => setSlabLength(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">පළල (අඩි - Feet)</label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={slabWidth}
                      onChange={(e) => setSlabWidth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">ඝනකම (අඟල් - Inches)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={slabThickness}
                      onChange={(e) => setSlabThickness(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Beams addition */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeBeams}
                      onChange={(e) => setIncludeBeams(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm font-bold text-slate-200">බීම් (Beams) පරිමාව එකතු කරන්න</span>
                  </label>

                  {includeBeams && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">බීම් වල මුළු දිග (අඩි)</label>
                        <input
                          type="number"
                          placeholder="e.g. 350"
                          value={beamLength}
                          onChange={(e) => setBeamLength(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">බීම් පළල (අඟල්)</label>
                        <input
                          type="number"
                          placeholder="e.g. 9"
                          value={beamWidth}
                          onChange={(e) => setBeamWidth(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">ස්ලැබ් එකෙන් පහළ බීම් උස (අඟල්)</label>
                        <input
                          type="number"
                          placeholder="e.g. 7"
                          value={beamDepth}
                          onChange={(e) => setBeamDepth(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                <span className="block text-sm font-bold text-slate-200">
                  {concreteElement === "column" && "කොලම් වල මිනුම් (Column Dimensions)"}
                  {concreteElement === "footing" && "පාදම් වල මිනුම් (Footing Dimensions)"}
                  {concreteElement === "beam" && "බීම් / ලින්ටල් වල මිනුම් (Beam Dimensions)"}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      {concreteElement === "column" ? "උස (අඩි - Height)" : "දිග (අඩි - Length)"}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={elemLength}
                      onChange={(e) => setElemLength(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">පළල (අඟල් - Width)</label>
                    <input
                      type="number"
                      placeholder="e.g. 9"
                      value={elemWidth}
                      onChange={(e) => setElemWidth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">ඝනකම / ගැඹුර (අඟල් - Depth)</label>
                    <input
                      type="number"
                      placeholder="e.g. 9"
                      value={elemDepth}
                      onChange={(e) => setElemDepth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">ගණන (Quantity / Count)</label>
                    <input
                      type="number"
                      placeholder="e.g. 6"
                      value={elemCount}
                      onChange={(e) => setElemCount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mix Ratio & Wastage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">මිශ්‍රණ අනුපාතය (Mix Ratio)</label>
                <select
                  value={concreteRatio}
                  onChange={(e) => setConcreteRatio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="1:1.5:3">1:1.5:3 (Grade 25)</option>
                  <option value="1:2:4">1:2:4 (Grade 20)</option>
                  <option value="1:3:6">1:3:6 (Grade 15)</option>
                </select>
              </div>

              <div className="bg-slate-950 border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-center">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addWastage}
                    onChange={(e) => setAddWastage(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-sm font-bold text-amber-400">5% Wastage (අපතේ යාම්) එකතු කරන්න</span>
                </label>
              </div>
            </div>

            {/* Results Grid */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">අවශ්‍ය ද්‍රව්‍ය ප්‍රමාණය:</span>
                <span className="text-xs bg-sky-950 border border-sky-800 text-sky-300 px-3 py-1 rounded-full font-mono">
                  Wet Volume: {concreteResult.wetVol} cu.ft
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{concreteResult.cement}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">සිමෙන්ති (Bags)</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{concreteResult.sand}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">වැලි (Cubes)</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{concreteResult.metal}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">3/4" මෙටල් (Cubes)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 3. TILE & PAINT CALCULATOR ---------------- */}
        {activeTab === "tile" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h3 className="font-bold text-xl text-white">ටයිල් සහ තීන්ත</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                කාමරයේ මිනුම්, බිත්ති උස, ස්කර්ටින් සහ දොර ජනෙල් අඩු කිරීම් සහිත නිවැරදි ගණනය කිරීම
              </p>
            </div>

            {/* Room Dimensions */}
            <div className="mb-6">
              <span className="block text-sm font-bold text-slate-200 mb-3">කාමරයේ මිනුම් (Room Dimensions - Feet)</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">දිග (අඩි - Length)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={roomLength}
                    onChange={(e) => setRoomLength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">පළල (අඩි - Width)</label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">බිත්ති උස (අඩි - Wall Height)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ටයිල් ප්‍රමාණය</label>
                  <select
                    value={tileSize}
                    onChange={(e) => setTileSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="2x2">2ft x 2ft (Standard)</option>
                    <option value="2x1">2ft x 1ft</option>
                    <option value="1x1">1ft x 1ft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skirting Option */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSkirting}
                  onChange={(e) => setIncludeSkirting(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
                />
                <span className="text-sm font-bold text-slate-200">ස්කර්ටින් (Skirting) ටයිල් ප්‍රමාණය එකතු කරන්න</span>
              </label>

              {includeSkirting && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-semibold">ස්කර්ටින් උස (Inches):</span>
                  <select
                    value={skirtingHeight}
                    onChange={(e) => setSkirtingHeight(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="3">3 අඟල් (3 Inches)</option>
                    <option value="4">4 අඟල් (4 Inches - Standard)</option>
                    <option value="5">5 අඟල් (5 Inches)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Deductions for Doors/Windows in Room */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  දොර සහ ජනෙල් අඩු කිරීම් (Paint & Skirting Deductions)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTileDoors([...tileDoors, { id: Date.now(), width: "", height: "", count: "1" }])}
                    className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-lg transition"
                  >
                    + Door
                  </button>
                  <button
                    onClick={() => setTileWindows([...tileWindows, { id: Date.now(), width: "", height: "", count: "1" }])}
                    className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-lg transition"
                  >
                    + Window
                  </button>
                </div>
              </div>

              {tileDoors.length === 0 && tileWindows.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">කාමරයේ දොර/ජනෙල් ඇතුළත් කිරීමට ඉහත බොත්තම් භාවිත කරන්න</p>
              ) : (
                <div className="space-y-2">
                  {tileDoors.map((d, idx) => (
                    <div key={d.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 font-bold w-14">Door {idx + 1}</span>
                      <input
                        type="number"
                        placeholder="පළල (ft)"
                        value={d.width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTileDoors(tileDoors.map((item) => (item.id === d.id ? { ...item, width: val } : item)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        placeholder="උස (ft)"
                        value={d.height}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTileDoors(tileDoors.map((item) => (item.id === d.id ? { ...item, height: val } : item)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        placeholder="ගණන"
                        value={d.count}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTileDoors(tileDoors.map((item) => (item.id === d.id ? { ...item, count: val } : item)));
                        }}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <button
                        onClick={() => setTileDoors(tileDoors.filter((item) => item.id !== d.id))}
                        className="text-red-400 hover:text-white px-2 py-1 ml-auto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {tileWindows.map((win, idx) => (
                    <div key={win.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 font-bold w-14">Win {idx + 1}</span>
                      <input
                        type="number"
                        placeholder="පළල (ft)"
                        value={win.width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTileWindows(tileWindows.map((item) => (item.id === win.id ? { ...item, width: val } : item)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        placeholder="උස (ft)"
                        value={win.height}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTileWindows(tileWindows.map((item) => (item.id === win.id ? { ...item, height: val } : item)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        placeholder="ගණන"
                        value={win.count}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTileWindows(tileWindows.map((item) => (item.id === win.id ? { ...item, count: val } : item)));
                        }}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <button
                        onClick={() => setTileWindows(tileWindows.filter((item) => item.id !== win.id))}
                        className="text-red-400 hover:text-white px-2 py-1 ml-auto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                අවශ්‍ය ප්‍රමාණ (10% අපතේ යාම් සහිතව):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{tileResult.floorArea}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">බිම වර්ග අඩි (Floor Sq.Ft)</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{tileResult.tilesNeeded}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">ටයිල් කැට (Pcs)</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{tileResult.paintLiters}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">බිත්ති තීන්ත ලීටර් (Liters)</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                *බිත්ති තීන්ත ප්‍රමාණය ගණනය කර ඇත්තේ දොර/ජනෙල් වර්ගඵලය අඩු කළ ශුද්ධ බිත්ති වර්ගඵලයට ({tileResult.netWallArea} Sq.ft) ආලේපන වට 2ක් (2 coats) සඳහායි.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}