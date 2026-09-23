"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"concrete" | "brick" | "tile">("concrete");

  // Concrete state
  const [slabLength, setSlabLength] = useState("");
  const [slabWidth, setSlabWidth] = useState("");
  const [slabThickness, setSlabThickness] = useState("5"); // in inches

  // Beam state (optional)
  const [includeBeams, setIncludeBeams] = useState(false);
  const [beamLength, setBeamLength] = useState(""); // total length in feet
  const [beamWidth, setBeamWidth] = useState("9"); // inches
  const [beamDepth, setBeamDepth] = useState("7"); // inches (below slab)

  // Mix Ratio & Wastage
  const [concreteRatio, setConcreteRatio] = useState<"1:1.5:3" | "1:2:4" | "1:3:6">("1:2:4");
  const [addWastage, setAddWastage] = useState(false);

  // Brick state
  const [wallLength, setWallLength] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [wallType, setWallType] = useState<"brick" | "block">("brick");

  // Tile state
  const [roomLength, setRoomLength] = useState("");
  const [roomWidth, setRoomWidth] = useState("");
  const [tileSize, setTileSize] = useState("2x2");

  // Concrete calculation (Standard dry volume factor: 1.54, 1 Bag Cement = 1.25 cu.ft, 1 Cube = 100 cu.ft)
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

  // Brick calculation
  const calcWall = () => {
    const l = parseFloat(wallLength) || 0;
    const h = parseFloat(wallHeight) || 0;
    const area = l * h;

    if (wallType === "brick") {
      const bricks = area * 10.5;
      const cementBags = area * 0.045;
      return { units: Math.ceil(bricks), cement: Math.ceil(cementBags), type: "ගඩොල් කැට" };
    } else {
      const blocks = area * 1.12;
      const cementBags = area * 0.025;
      return { units: Math.ceil(blocks), cement: Math.ceil(cementBags), type: "බ්ලොක් ගල්" };
    }
  };

  // Tile calculation
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
  const wallResult = calcWall();
  const tileResult = calcTile();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <img
              src="/logo.png"
              alt="thakseru.lk logo"
              className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]"
            />
          </div>
          <a
            href="https://wa.me/94712689098?text=Bank%20BOQ%20ekak%20hadaganna%20uwamanawei"
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
      <section className="relative overflow-hidden pt-16 pb-12 text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Digital Cost Estimating & BOQ
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6">
            ගෙදර හදන්න කලින්, <br />
            වියදම සහ{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              BOQ එක හරියටම
            </span>{" "}
            තක්සේරු කරගන්න.
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            නොමිලේ Material Calculators භාවිතයෙන් අවශ්‍ය ප්‍රමාණ ගණනය කරගන්න.
            බැංකු ණය අනුමත කරගැනීම සඳහා QS-Certified BOQ එකක් පැය 48න් ලබාගන්න.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/94712689098?text=Bank%20BOQ%20ekak%20hadaganna%20uwamanawei"
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
      <section id="calculators" className="max-w-4xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">නොමිලේ ගණනය කිරීම් මෙවලම්</h2>
          <p className="text-slate-400 text-sm mt-1">ඔබට අවශ්‍ය අංශය තෝරා මිනුම් ඇතුළත් කරන්න</p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl max-w-lg mx-auto mb-8">
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

        {/* Concrete Calculator Card */}
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
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      *මුළු බීම් උසින් ස්ලැබ් ඝනකම අඩු කළ අගය දෙන්න
                    </span>
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
                  <option value="1:1.5:3">1:1.5:3 (Grade 25) - Columns, Retaining, Heavy RCC</option>
                  <option value="1:2:4">1:2:4 (Grade 20) - Slabs, Beams, Footings, Standard RCC</option>
                  <option value="1:3:6">1:3:6 (Grade 15) - Foundation Bedding, Mass Concrete</option>
                </select>
                <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {concreteRatio === "1:1.5:3" && "භාවිතය: කොලම්, ස්ලැබ්, වෝටර් ටෑන්ක් ආදී ඉහළ ශක්තියක් අවශ්‍ය තැන් වලට."}
                  {concreteRatio === "1:2:4" && "භාවිතය: සාමාන්‍ය ස්ලැබ්, බීම්, ලින්ටල්, ෆූටින් ආදී බහුලව භාවිත වන කොන්ක්‍රීට් වැඩ වලට."}
                  {concreteRatio === "1:3:6" && "භාවිතය: අත්තිවාරම් යට බ්ලයින්ඩින් (Blinding / Lean concrete), පඩි පෙළ පිරවුම් ආදියට."}
                </div>
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
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  සයිට් එකේදී හැලෙන ප්‍රමාණයන් සහ මිශ්‍ර කිරීමේදී සිදුවන වෙනස්කම් සඳහා නිර්දේශ කෙරේ.
                </p>
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

        {/* Brick Calculator Card */}
        {activeTab === "brick" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="font-bold text-xl text-white mb-4">ගඩොල් සහ සිමෙන්ති බ්ලොක් ගණකය</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">බිත්තියේ දිග (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={wallLength}
                  onChange={(e) => setWallLength(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">බිත්තියේ උස (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">බිත්ති වර්ගය</label>
                <select
                  value={wallType}
                  onChange={(e) => setWallType(e.target.value as "brick" | "block")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="brick">රතු ගඩොල් (9" Brick Wall)</option>
                  <option value="block">සිමෙන්ති බ්ලොක් (4" Block)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">අවශ්‍ය ප්‍රමාණය:</span>
              <div className="grid grid-cols-2 gap-4 mt-3 text-center">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{wallResult.units}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">{wallResult.type}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-black text-sky-400">{wallResult.cement}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">බඳින්න සිමෙන්ති (Bags)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tile & Paint Calculator Card */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
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