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
  const [slabLength, setSlabLength] = useState("");
  const [slabWidth, setSlabWidth] = useState("");
  const [slabThickness, setSlabThickness] = useState("5");

  const [includeBeams, setIncludeBeams] = useState(false);
  const [beamLength, setBeamLength] = useState("");
  const [beamWidth, setBeamWidth] = useState("9");
  const [beamDepth, setBeamDepth] = useState("7");

  const [concreteRatio, setConcreteRatio] = useState<"1:1.5:3" | "1:2:4" | "1:3:6">("1:2:4");
  const [addWastage, setAddWastage] = useState(false);

  // ----------------- BRICK & BLOCK PRO STATE -----------------
  const [wallType, setWallType] = useState<string>("brick_9");
  const [walls, setWalls] = useState<WallRow[]>([
    { id: 1, length: "10", height: "10", isGable: false },
  ]);
  const [doors, setDoors] = useState<OpeningRow[]>([
    { id: 1, width: "3", height: "7", count: "1" },
  ]);
  const [windows, setWindows] = useState<OpeningRow[]>([
    { id: 1, width: "4", height: "4", count: "1" },
  ]);

  // ----------------- TILE & PAINT STATE -----------------
  const [roomLength, setRoomLength] = useState("");
  const [roomWidth, setRoomWidth] = useState("");
  const [tileSize, setTileSize] = useState("2x2");

  // Concrete Calculation Logic
  const calcConcrete = () => {
    const sl = parseFloat(slabLength) || 0;
    const sw = parseFloat(slabWidth) || 0;
    const st = (parseFloat(slabThickness) || 0) / 12;
    let totalWetVol = sl * sw * st;

    if (includeBeams) {
      const bl = parseFloat(beamLength) || 0;
      const bw = (parseFloat(beamWidth) || 0) / 12;
      const bd = (parseFloat(beamDepth) || 0) / 12;
      totalWetVol += bl * bw * bd;
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
    const cementVol = (dryVol * cRatio) / totalParts;
    const cementBags = cementVol / 1.25;

    const sandVol = (dryVol * sRatio) / totalParts;
    const sandCubes = sandVol / 100;

    const metalVol = (dryVol * mRatio) / totalParts;
    const metalCubes = metalVol / 100;

    return {
      cement: Math.ceil(cementBags),
      sand: sandCubes.toFixed(2),
      metal: metalCubes.toFixed(2),
      wetVol: totalWetVol.toFixed(1),
    };
  };

  // Brick & Block Pro Calculation Logic (Build with Nuwan V3)
  const materialRates: Record<string, { unitsPerSqr: number; cementBags?: number; sandCubes?: number; zulkaBagsPerSqr?: number; isAdhesive: boolean; unitName: string }> = {
    brick_4_5: { unitsPerSqr: 578, cementBags: 1.3, sandCubes: 0.10, isAdhesive: false, unitName: "ගඩොල් (කැට)" },
    brick_9: { unitsPerSqr: 1155, cementBags: 2.8, sandCubes: 0.22, isAdhesive: false, unitName: "ගඩොල් (කැට)" },
    local_block_4: { unitsPerSqr: 140, cementBags: 1.1, sandCubes: 0.10, isAdhesive: false, unitName: "බ්ලොක් ගල් (ගල්)" },
    sls_block_4: { unitsPerSqr: 122, zulkaBagsPerSqr: 1.36, isAdhesive: true, unitName: "බ්ලොක් ගල් (ගල්)" },
    sls_block_6: { unitsPerSqr: 122, zulkaBagsPerSqr: 2.03, isAdhesive: true, unitName: "බ්ලොක් ගල් (ගල්)" },
    sls_block_8: { unitsPerSqr: 122, zulkaBagsPerSqr: 2.71, isAdhesive: true, unitName: "බ්ලොක් ගල් (ගල්)" }
  };

  const calcBrickBlockPro = () => {
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

  // Dynamic Row Modifiers
  const addWallRow = () => {
    setWalls([...walls, { id: Date.now(), length: "10", height: "10", isGable: false }]);
  };
  const removeWallRow = (id: number) => {
    setWalls(walls.filter((w) => w.id !== id));
  };

  const addDoorRow = () => {
    setDoors([...doors, { id: Date.now(), width: "3", height: "7", count: "1" }]);
  };
  const removeDoorRow = (id: number) => {
    setDoors(doors.filter((d) => d.id !== id));
  };

  const addWinRow = () => {
    setWindows([...windows, { id: Date.now(), width: "4", height: "4", count: "1" }]);
  };
  const removeWinRow = (id: number) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  // Tile Calculation
  const calcTile = () => {
    const l = parseFloat(roomLength) || 0;
    const w = parseFloat(roomWidth) || 0;
    const area = l * w;
    const totalAreaWithWastage = area * 1.1;

    let tileSqft = 4;
    if (tileSize === "1x1") tileSqft = 1;
    if (tileSize === "2x1") tileSqft = 2;

    const tilesNeeded = totalAreaWithWastage / tileSqft;
    const paintLiters = area / 120;

    return { tiles: Math.ceil(tilesNeeded), area: area.toFixed(0), paint: Math.ceil(paintLiters) };
  };

  const concreteResult = calcConcrete();
  const brickResult = calcBrickBlockPro();
  const tileResult = calcTile();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar with Extra Large Prominent Logo */}
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
            href="https://wa.me/94779002574?text=Bank%20BOQ%20ekak%20hadaganna%20uwamanawei"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 transition-all duration-200"
          >
            <span>Bank BOQ Service</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">48 Hours</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-10 text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Digital Cost Estimating & BOQ
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-5">
            ගෙදර හදන්න කලින්, <br />
            වියදම සහ{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              BOQ එක හරියටම
            </span>{" "}
            තක්සේරු කරගන්න.
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-7">
            නොමිලේ Material Calculators භාවිතයෙන් අවශ්‍ය ප්‍රමාණ ගණනය කරගන්න.
            බැංකු ණය අනුමත කරගැනීම සඳහා QS-Certified BOQ එකක් පැය 48න් ලබාගන්න.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/94779002574?text=Bank%20BOQ%20ekak%20hadaganna%20uwamanawei"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-sky-500/25 transition duration-200"
            >
              BOQ එකක් සාදාගන්න (පැය 48න්)
            </a>
            <a
              href="#calculators"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold px-6 py-3.5 rounded-xl transition duration-200"
            >
              Calculators බලන්න ↓
            </a>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculators" className="max-w-4xl mx-auto px-4 pt-4 pb-20">
        <div className="text-center mb-7">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">නොමිලේ ගණනය කිරීම් මෙවලම්</h2>
          <p className="text-slate-400 text-sm mt-1">ඔබට අවශ්‍ය අංශය තෝරා මිනුම් ඇතුළත් කරන්න</p>
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
            ගඩොල් සහ බ්ලොක් (Pro)
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

        {/* ---------------- BRICK & BLOCK PRO ESTIMATOR CARD ---------------- */}
        {activeTab === "brick" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="font-bold text-xl text-white">Brick & Block Estimator Pro</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  දොර, ජනෙල් අඩු කිරීම් සහ Gable බිත්ති සහිත සම්පූර්ණ ගණනය කිරීම
                </p>
              </div>
              <span className="text-xs bg-amber-950/80 border border-amber-800/80 text-amber-400 font-bold px-3 py-1 rounded-full">
                Build with Nuwan Pro Logic
              </span>
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
                  onClick={addWallRow}
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
                      placeholder="දිග (ft)"
                      value={w.length}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWalls(walls.map((item) => (item.id === w.id ? { ...item, length: val } : item)));
                      }}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="number"
                      placeholder="උස (ft)"
                      value={w.height}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWalls(walls.map((item) => (item.id === w.id ? { ...item, height: val } : item)));
                      }}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
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
                        onClick={() => removeWallRow(w.id)}
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
                  onClick={addDoorRow}
                  className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  + Add Door
                </button>
              </div>

              <div className="space-y-2.5">
                {doors.map((d, idx) => (
                  <div key={d.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-sm">
                    <span className="text-xs font-bold text-slate-400 w-16">Door {idx + 1}</span>
                    <input
                      type="number"
                      placeholder="පළල"
                      value={d.width}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDoors(doors.map((item) => (item.id === d.id ? { ...item, width: val } : item)));
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="number"
                      placeholder="උස"
                      value={d.height}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDoors(doors.map((item) => (item.id === d.id ? { ...item, height: val } : item)));
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="number"
                      placeholder="ගණන"
                      value={d.count}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDoors(doors.map((item) => (item.id === d.id ? { ...item, count: val } : item)));
                      }}
                      className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={() => removeDoorRow(d.id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded text-xs ml-auto transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Windows Section */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Windows (ජනෙල් අඩු කිරීම් - ft)
                </span>
                <button
                  onClick={addWinRow}
                  className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  + Add Window
                </button>
              </div>

              <div className="space-y-2.5">
                {windows.map((win, idx) => (
                  <div key={win.id} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-sm">
                    <span className="text-xs font-bold text-slate-400 w-16">Win {idx + 1}</span>
                    <input
                      type="number"
                      placeholder="පළල"
                      value={win.width}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWindows(windows.map((item) => (item.id === win.id ? { ...item, width: val } : item)));
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="number"
                      placeholder="උස"
                      value={win.height}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWindows(windows.map((item) => (item.id === win.id ? { ...item, height: val } : item)));
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="number"
                      placeholder="ගණන"
                      value={win.count}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWindows(windows.map((item) => (item.id === win.id ? { ...item, count: val } : item)));
                      }}
                      className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={() => removeWinRow(win.id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded text-xs ml-auto transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
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

        {/* ---------------- CONCRETE CALCULATOR CARD ---------------- */}
        {activeTab === "concrete" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5 mb-6">
              <div>
                <h3 className="font-bold text-xl text-white">Concrete Material Calculator</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ස්ලැබ්, බීම්, කොලම් හෝ ෆවුන්ඩේෂන් සඳහා කොන්ක්‍රීට් ද්‍රව්‍ය ගණනය කරන්න
                </p>
              </div>
              <span className="text-xs bg-sky-950 border border-sky-800 text-sky-300 font-semibold px-3 py-1 rounded-full">
                Dry Volume Factor: 1.54
              </span>
            </div>

            {/* Slab Input Section */}
            <div className="mb-6">
              <span className="block text-sm font-bold text-slate-200 mb-3">1. ස්ලැබ් එකේ මිනුම් (Slab Dimensions)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">දිග (අඩි - Feet)</label>
                  <input
                    type="number"
                    placeholder="e.g. 35"
                    value={slabLength}
                    onChange={(e) => setSlabLength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">පළල (අඩි - Feet)</label>
                  <input
                    type="number"
                    placeholder="e.g. 40"
                    value={slabWidth}
                    onChange={(e) => setSlabWidth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ඝනකම (අඟල් - Inches)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={slabThickness}
                    onChange={(e) => setSlabThickness(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Beam Input Section */}
            <div className="mb-6 bg-slate-950 border border-slate-800/80 p-4 rounded-2xl">
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      ස්ලැබ් එකෙන් පහළ බීම් උස (අඟල්)
                    </label>
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

            {/* Mix Ratio & Wastage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">මිශ්‍රණ අනුපාතය (Mix Ratio)</label>
                <select
                  value={concreteRatio}
                  onChange={(e) => setConcreteRatio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="1:1.5:3">1:1.5:3 (Grade 25) - කොලම්, ස්ලැබ්, වෝටර් ටෑන්ක්</option>
                  <option value="1:2:4">1:2:4 (Grade 20) - සාමාන්‍ය ස්ලැබ්, බීම්, ෆූටින්</option>
                  <option value="1:3:6">1:3:6 (Grade 15) - අත්තිවාරම් යට බ්ලයින්ඩින් (Mass Concrete)</option>
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

        {/* ---------------- TILE & PAINT CARD ---------------- */}
        {activeTab === "tile" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="font-bold text-xl text-white mb-4">ටයිල් සහ තීන්ත ගණකය</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">කාමරයේ දිග (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={roomLength}
                  onChange={(e) => setRoomLength(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">කාමරයේ පළල (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ටයිල් ප්‍රමාණය</label>
                <select
                  value={tileSize}
                  onChange={(e) => setTileSize(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500 bg-slate-950 border-slate-800 text-white"
                >
                  <option value="2x2">2ft x 2ft (Standard)</option>
                  <option value="2x1">2ft x 1ft</option>
                  <option value="1x1">1ft x 1ft</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                අවශ්‍ය ප්‍රමාණය (10% අපතේ යාම් සහිතව):
              </span>
              <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{tileResult.area}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">වර්ග අඩි (Sq.Ft)</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{tileResult.tiles}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">ටයිල් කැට (Pcs)</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{tileResult.paint}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">තීන්ත (Liters)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}