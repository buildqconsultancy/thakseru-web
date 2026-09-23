"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"concrete" | "brick" | "tile">("concrete");

  // Concrete state
  const [concreteLength, setConcreteLength] = useState("");
  const [concreteWidth, setConcreteWidth] = useState("");
  const [concreteThickness, setConcreteThickness] = useState("4");
  const [concreteRatio, setConcreteRatio] = useState("1:2:4");

  // Brick state
  const [wallLength, setWallLength] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [wallType, setWallType] = useState<"brick" | "block">("brick");

  // Tile state
  const [roomLength, setRoomLength] = useState("");
  const [roomWidth, setRoomWidth] = useState("");
  const [tileSize, setTileSize] = useState("2x2");

  // Concrete calculation (Standard dry volume factor: 1.54)
  const calcConcrete = () => {
    const l = parseFloat(concreteLength) || 0;
    const w = parseFloat(concreteWidth) || 0;
    const t = (parseFloat(concreteThickness) || 0) / 12; // inches to feet
    const wetVol = l * w * t;
    const dryVol = wetVol * 1.54;

    if (concreteRatio === "1:2:4") {
      const cementBags = ((dryVol * 1) / 7) / 1.25;
      const sandCubes = ((dryVol * 2) / 7) / 100;
      const metalCubes = ((dryVol * 4) / 7) / 100;
      return { cement: Math.ceil(cementBags), sand: sandCubes.toFixed(2), metal: metalCubes.toFixed(2) };
    } else {
      // 1:3:6
      const cementBags = ((dryVol * 1) / 10) / 1.25;
      const sandCubes = ((dryVol * 3) / 10) / 100;
      const metalCubes = ((dryVol * 6) / 10) / 100;
      return { cement: Math.ceil(cementBags), sand: sandCubes.toFixed(2), metal: metalCubes.toFixed(2) };
    }
  };

  // Brick/Block calculation
  const calcWall = () => {
    const l = parseFloat(wallLength) || 0;
    const h = parseFloat(wallHeight) || 0;
    const area = l * h;

    if (wallType === "brick") {
      const bricks = area * 10.5; // Average 9" brick wall count per sq.ft
      const cementBags = area * 0.045;
      return { units: Math.ceil(bricks), cement: Math.ceil(cementBags), type: "ගඩොල් කැට" };
    } else {
      const blocks = area * 1.12; // 4" cement blocks per sq.ft
      const cementBags = area * 0.025;
      return { units: Math.ceil(blocks), cement: Math.ceil(cementBags), type: "බ්ලොක් ගල්" };
    }
  };

  // Tile calculation (Including 10% wastage)
  const calcTile = () => {
    const l = parseFloat(roomLength) || 0;
    const w = parseFloat(roomWidth) || 0;
    const area = l * w;
    const totalAreaWithWastage = area * 1.1;

    let tileSqft = 4; // 2x2
    if (tileSize === "1x1") tileSqft = 1;
    if (tileSize === "2x1") tileSqft = 2;

    const tilesNeeded = totalAreaWithWastage / tileSqft;
    const paintLiters = area / 120; // 2 coats approximation

    return { tiles: Math.ceil(tilesNeeded), area: area.toFixed(0), paint: Math.ceil(paintLiters) };
  };

  const concreteResult = calcConcrete();
  const wallResult = calcWall();
  const tileResult = calcTile();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tight text-slate-900">
            thakseru<span className="text-amber-500">.lk</span>
          </div>
          <a
            href="https://wa.me/94712689098?text=Bank%20BOQ%20ekak%20hadaganna%20uwamanawei"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
          >
            Bank BOQ Service
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-10 text-center">
        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-5">
          Digital Cost Estimating & BOQ
        </span>
        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-5">
          ගෙදර හදන්න කලින්, <br />
          වියදම සහ <span className="text-blue-600">BOQ එක හරියටම</span> තක්සේරු කරගන්න.
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
          නොමිලේ Material Calculators වලින් අවශ්‍ය ප්‍රමාණ ගණනය කරන්න. බැංකු ණය සඳහා QS-Certified BOQ එකක් පැය 48න් ලබාගන්න.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://wa.me/94712689098?text=Bank%20BOQ%20ekak%20hadaganna%20uwamanawei"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition"
          >
            BOQ එකක් සාදාගන්න (පැය 48න්)
          </a>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">නොමිලේ ගණනය කිරීම් මෙවලම්</h2>
          <p className="text-slate-500 text-sm mt-1">ඔබට අවශ්‍ය අංශය තෝරා මිනුම් ඇතුළත් කරන්න</p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 bg-slate-200 p-1.5 rounded-2xl max-w-md mx-auto mb-8">
          <button
            onClick={() => setActiveTab("concrete")}
            className={`py-2 text-xs md:text-sm font-bold rounded-xl transition ${
              activeTab === "concrete" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            කොන්ක්‍රීට් සහ බදාම
          </button>
          <button
            onClick={() => setActiveTab("brick")}
            className={`py-2 text-xs md:text-sm font-bold rounded-xl transition ${
              activeTab === "brick" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ගඩොල් සහ බ්ලොක්
          </button>
          <button
            onClick={() => setActiveTab("tile")}
            className={`py-2 text-xs md:text-sm font-bold rounded-xl transition ${
              activeTab === "tile" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ටයිල් සහ තීන්ත
          </button>
        </div>

        {/* Concrete Calculator Card */}
        {activeTab === "concrete" && (
          <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-800">කොන්ක්‍රීට් සහ බදාම ගණකය</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">දිග (අඩි - Feet)</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={concreteLength}
                  onChange={(e) => setConcreteLength(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">පළල (අඩි - Feet)</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={concreteWidth}
                  onChange={(e) => setConcreteWidth(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ඝනකම (අඟල් - Inches)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={concreteThickness}
                  onChange={(e) => setConcreteThickness(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">මිශ්‍රණ අනුපාතය</label>
                <select
                  value={concreteRatio}
                  onChange={(e) => setConcreteRatio(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                >
                  <option value="1:2:4">1:2:4 (Slab / Column)</option>
                  <option value="1:3:6">1:3:6 (Mass / Foundation)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">අවශ්‍ය ද්‍රව්‍ය ප්‍රමාණය:</span>
              <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{concreteResult.cement}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">සිමෙන්ති (Bags)</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{concreteResult.sand}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">වැලි (Cubes)</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{concreteResult.metal}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">මෙටල් 3/4" (Cubes)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brick Calculator Card */}
        {activeTab === "brick" && (
          <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-800">ගඩොල් සහ සිමෙන්ති බ්ලොක් ගණකය</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">බිත්තියේ දිග (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={wallLength}
                  onChange={(e) => setWallLength(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">බිත්තියේ උස (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">බිත්ති වර්ගය</label>
                <select
                  value={wallType}
                  onChange={(e) => setWallType(e.target.value as "brick" | "block")}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                >
                  <option value="brick">රතු ගඩොල් (9" Brick Wall)</option>
                  <option value="block">සිමෙන්ති බ්ලොක් (4" Block)</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">අවශ්‍ය ප්‍රමාණය:</span>
              <div className="grid grid-cols-2 gap-4 mt-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-amber-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{wallResult.units}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">{wallResult.type}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{wallResult.cement}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">බඳින්න සිමෙන්ති (Bags)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tile & Paint Calculator Card */}
        {activeTab === "tile" && (
          <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-800">ටයිල් සහ තීන්ත ගණකය</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">කාමරයේ දිග (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={roomLength}
                  onChange={(e) => setRoomLength(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">කාමරයේ පළල (අඩි)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ටයිල් ප්‍රමාණය</label>
                <select
                  value={tileSize}
                  onChange={(e) => setTileSize(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-blue-500"
                >
                  <option value="2x2">2ft x 2ft (Standard)</option>
                  <option value="2x1">2ft x 1ft</option>
                  <option value="1x1">1ft x 1ft</option>
                </select>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">අවශ්‍ය ප්‍රමාණය (10% අපතේ යාම් සහිතව):</span>
              <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{tileResult.area}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">වර්ග අඩි (Sq.Ft)</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{tileResult.tiles}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">ටයිල් කැට (Pcs)</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="text-xl md:text-2xl font-black text-slate-900">{tileResult.paint}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">තීන්ත (Liters)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}