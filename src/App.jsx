import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useSearchParams,
  Link
} from 'react-router-dom';


const regionLoader = async ({ request }) => {
  const url = new URL(request.url);
  const selectedProvinceId = url.searchParams.get("province") || "";
  const selectedRegencyId = url.searchParams.get("regency") || "";
  const selectedDistrictId = url.searchParams.get("district") || "";

  try {
    const response = await fetch('/data/indonesia_regions.json');
    if (!response.ok) throw new Error("Gagal load JSON");
    const allData = await response.json();

    const provinces = allData.provinces || [];

    const regencies = selectedProvinceId
      ? allData.regencies.filter(r => String(r.province_id) === selectedProvinceId)
      : [];

    const districts = selectedRegencyId
      ? allData.districts.filter(d => String(d.regency_id) === selectedRegencyId)
      : [];

    return {
      selectedProvinceId, selectedRegencyId, selectedDistrictId,
      provinces, regencies, districts
    };
  } catch (error) {
    console.error(error);
    return { provinces: [], regencies: [], districts: [] };
  }
};

const AssessmentPage = () => {
  const {
    selectedProvinceId, selectedRegencyId, selectedDistrictId,
    provinces, regencies, districts
  } = useLoaderData();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleProvinceChange = (e) => {
    setSearchParams({ province: e.target.value });
  };

  const handleRegencyChange = (e) => {
    setSearchParams({
      province: selectedProvinceId,
      regency: e.target.value
    });
  };

  const handleDistrictChange = (e) => {
    setSearchParams({
      province: selectedProvinceId,
      regency: selectedRegencyId,
      district: e.target.value
    });
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const provinceName = provinces.find(p => String(p.id) === selectedProvinceId)?.name;
  const regencyName = regencies.find(r => String(r.id) === selectedRegencyId)?.name;
  const districtName = districts.find(d => String(d.id) === selectedDistrictId)?.name;

  return (
    <div className="flex min-h-screen font-sans text-slate-800">

      <aside className="w-80 border-r border-slate-200 p-6 bg-slate-50 flex flex-col gap-6">
        <h1 className="font-bold text-lg flex items-center gap-2">
          Frontend Assessment
        </h1>

        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-400 tracking-wider">FILTER WILAYAH</h2>

          {/* Combobox Provinsi */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">PROVINSI</label>
            <select
              name="province"
              value={selectedProvinceId}
              onChange={handleProvinceChange}
              className="p-2 border rounded-md bg-white text-sm"
            >
              <option value="">Pilih Provinsi</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Combobox Kota/Kabupaten */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">KOTA/KABUPATEN</label>
            <select
              name="regency"
              value={selectedRegencyId}
              onChange={handleRegencyChange}
              disabled={!selectedProvinceId}
              className="p-2 border rounded-md bg-white text-sm disabled:bg-slate-100"
            >
              <option value="">Pilih Kota/Kabupaten</option>
              {regencies.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Combobox Kecamatan */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">KECAMATAN</label>
            <select
              name="district"
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              disabled={!selectedRegencyId}
              className="p-2 border rounded-md bg-white text-sm disabled:bg-slate-100"
            >
              <option value="">Pilih Kecamatan</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 py-2 border border-blue-600 text-blue-800 rounded-md text-sm font-semibold hover:bg-blue-50"
          >
            RESET
          </button>
        </div>
      </aside>

      {/* Komponen Utama */}
      <main className="flex-1 flex flex-col bg-white">

        <div className="breadcrumb p-6 border-b border-slate-100 text-sm text-slate-500 font-medium">
          Indonesia
          {provinceName && <span> &gt; {provinceName}</span>}
          {regencyName && <span> &gt; {regencyName}</span>}
          {districtName && <span className="text-blue-600"> &gt; {districtName}</span>}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-10">

          {selectedProvinceId && (
            <div className="text-center">
              <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">Provinsi</p>
              <h2 className="text-5xl font-extrabold text-slate-900 mt-2">{provinceName}</h2>
            </div>
          )}

          {selectedRegencyId && (
            <>
              <div className="text-slate-300">↓</div>
              <div className="text-center">
                <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">Kota / Kabupaten</p>
                <h2 className="text-4xl font-extrabold text-slate-800 mt-2">{regencyName}</h2>
              </div>
            </>
          )}

          {selectedDistrictId && (
            <>
              <div className="text-slate-300">↓</div>
              <div className="text-center">
                <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">Kecamatan</p>
                <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{districtName}</h2>
              </div>
            </>
          )}

          {!selectedProvinceId && (
            <p className="text-slate-400">Silakan pilih wilayah pada filter di samping.</p>
          )}

        </div>
      </main>
    </div>
  );
};


const router = createBrowserRouter([
  {
    path: "/",
    element: <AssessmentPage />,
    loader: regionLoader,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}