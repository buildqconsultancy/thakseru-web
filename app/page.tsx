export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white py-4 px-6 sticky top-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black text-slate-900">
            thakseru<span className="text-amber-500">.lk</span>
          </span>
          <span className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg">
            Bank BOQ Service
          </span>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
          Digital Cost Estimating & BOQ
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold mt-6 text-slate-900 leading-tight">
          ගෙදර හදන්න කලින්, <br />
          <span className="text-blue-600">වියදම සහ BOQ එක හරියටම</span> තක්සේරු කරගන්න.
        </h1>
        <p className="mt-4 text-slate-600 text-lg max-w-xl mx-auto">
          නොමිලේ Material Calculators වලින් අවශ්‍ය ප්‍රමාණ ගණනය කරන්න. බැංකු ණය සඳහා QS-Certified BOQ එකක් පැය 48න් ලබාගන්න.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-700">
            BOQ එකක් සාදාගන්න (පැය 48න්)
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-200">
        <h2 className="text-xl font-bold text-center mb-8">නොමිලේ ගණනය කිරීම් මෙවලම්</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <h3 className="font-bold text-lg">කොන්ක්‍රීට් සහ බදාම</h3>
            <p className="text-sm text-slate-500 mt-2">සිමෙන්ති, වැලි සහ මෙටල් ප්‍රමාණ ගණනය.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <h3 className="font-bold text-lg">ගඩොල් සහ බ්ලොක්</h3>
            <p className="text-sm text-slate-500 mt-2">බිත්ති වර්ග ඵලයට අවශ්‍ය ගඩොල් ගණන.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <h3 className="font-bold text-lg">ටයිල් සහ තීන්ත</h3>
            <p className="text-sm text-slate-500 mt-2">කාමර වර්ග අඩියට අවශ්‍ය ටයිල් සහ තීන්ත ලීටර්.</p>
          </div>
        </div>
      </section>
    </main>
  );
}