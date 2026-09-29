import { useState, useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { Cpu, Upload, Image, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import { aiApi, binsApi } from "../services/api";

const WASTE_TYPE_COLORS = {
  organic: "badge-success",
  recyclable: "badge-info",
  hazardous: "badge-error",
  sanitary: "badge-warning",
  mixed: "badge-neutral",
};

const WASTE_TYPE_ICONS = {
  organic: "eco",
  recyclable: "recycling",
  hazardous: "warning",
  sanitary: "wash",
  mixed: "category",
};

export function AISegregationHub() {
  const [classifications, setClassifications] = useState([]);
  const [bins, setBins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedBinId, setSelectedBinId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [classificationsRes, binsRes] = await Promise.all([
        aiApi.getHistory({ limit: 50 }),
        binsApi.list({ active_only: true }),
      ]);
      setClassifications(classificationsRes.data);
      setBins(binsRes.data);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadResult({ preview: e.target.result, file });
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedBinId) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("bin_id", selectedBinId);
      const res = await aiApi.classify({ bin_id: parseInt(selectedBinId), image_url: URL.createObjectURL(selectedFile), model_version: "EcoYOLO-v9-Edge" });
      setUploadResult({ ...res.data, preview: URL.createObjectURL(selectedFile) });
      fetchData();
    } catch (err) {
      setError(err.message || "Classification failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSimulate = async (binId) => {
    setUploading(true);
    setError(null);
    try {
      const res = await aiApi.simulate(binId);
      setUploadResult(res.data);
      fetchData();
    } catch (err) {
      setError(err.message || "Simulation failed");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading && classifications.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">AI Segregation Hub</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Computer vision waste classification, conveyor monitoring, and AI model management
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-card animate-pulse">
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-label">Loading...</p>
                  <p className="kpi-value tabular-nums">—</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && classifications.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">AI Segregation Hub</h1>
          </div>
          <button className="btn-primary btn-sm" onClick={fetchData}>
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Retry
          </button>
        </div>
        <div className="card">
          <div className="card-body text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-error">error_outline</span>
            <p className="font-body-md text-on-surface mt-4">Failed to load data</p>
            <p className="font-body-sm text-on-surface-variant mt-2">{error}</p>
            <button className="btn-primary mt-6" onClick={fetchData}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const todayClassifications = classifications.filter(c => {
    const today = new Date().toDateString();
    return new Date(c.timestamp).toDateString() === today;
  });

  const totalToday = todayClassifications.length;
  const avgConfidence = totalToday > 0
    ? (todayClassifications.reduce((sum, c) => sum + c.confidence, 0) / totalToday * 100).toFixed(1)
    : "—";
  const hazardousCount = todayClassifications.filter(c => c.waste_type === "hazardous").length;
  const verifiedCount = classifications.filter(c => c.verified_category).length;
  const accuracy = verifiedCount > 0
    ? ((classifications.filter(c => c.verified_category && c.waste_type === c.verified_category).length / verifiedCount) * 100).toFixed(1)
    : "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">AI Segregation Hub</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Computer vision waste classification, conveyor monitoring, and AI model management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={fetchData} disabled={isLoading}>
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Live
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Today's Classifications</p>
              <p className="kpi-value tabular-nums">{totalToday}</p>
              <span className="kpi-trend-up">↑ {classifications.length} total</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Overall Accuracy</p>
              <p className="kpi-value tabular-nums">{accuracy}%</p>
              <span className={cn("kpi-trend", accuracy !== "—" && accuracy >= 90 ? "kpi-trend-up" : "kpi-trend-down")}>
                {verifiedCount > 0 ? `↑ ${verifiedCount} verified` : "↓ No verified data"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-success">psychology</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Avg Confidence</p>
              <p className="kpi-value tabular-nums">{avgConfidence}%</p>
              <span className="kpi-trend-up">↑ EcoYOLO-v9-Edge</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">analytics</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Hazardous Detected</p>
              <p className="kpi-value tabular-nums">{hazardousCount}</p>
              <span className={cn("kpi-trend", hazardousCount > 0 ? "kpi-trend-up" : "kpi-trend-down")}>
                {hazardousCount > 0 ? "↑ Immediate action" : "↓ None today"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-error-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-error">warning</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Conveyor Vision</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Streaming
              </span>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="aspect-video rounded-xl bg-inverse-surface flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6bd8cb_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10 text-center">
                <span className="material-symbols-outlined text-[48px] text-inverse-on-surface/30">videocam</span>
                <p className="font-body-md text-inverse-on-surface/60 mt-4">Conveyor Camera Feed</p>
                <p className="font-body-sm text-inverse-on-surface/40 mt-2">CAM-04 Industrial RGB+NIR · 2560×1440 @ 120 FPS</p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    Belt Speed: 1.8 m/s
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                    Pneumatic Jets: ARMED
                  </span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                  <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">Wet Organics</span>
                  <span className="font-headline-sm font-bold text-primary-fixed tabular-nums">
                    {todayClassifications.filter(c => c.waste_type === "organic").length}
                  </span>
                </div>
                <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                  <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">PET Recovered</span>
                  <span className="font-headline-sm font-bold text-tertiary-fixed tabular-nums">
                    {todayClassifications.filter(c => c.waste_type === "recyclable").length}
                  </span>
                </div>
                <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                  <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">Contaminants</span>
                  <span className="font-headline-sm font-bold text-error-container tabular-nums">
                    {todayClassifications.filter(c => c.waste_type === "hazardous").length}
                  </span>
                </div>
                <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                  <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">Efficiency</span>
                  <span className="font-headline-sm font-bold text-secondary-fixed tabular-nums">
                    {accuracy !== "—" ? accuracy : "—"}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Classify Waste</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="space-y-3">
              <label className="label">Select Bin</label>
              <select
                className="input"
                value={selectedBinId}
                onChange={(e) => setSelectedBinId(e.target.value)}
              >
                <option value="">Choose a bin...</option>
                {bins.map((bin) => (
                  <option key={bin.id} value={bin.id}>
                    {bin.bin_code} ({bin.waste_type}) - {bin.fill_pct}%
                  </option>
                ))}
              </select>
            </div>

            <label className="label">Upload Image</label>
            <div className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {uploadResult?.preview ? (
                <div className="space-y-3">
                  <img src={uploadResult.preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <div className="flex items-center justify-center gap-2">
                    <button className="btn-secondary btn-sm" onClick={() => setUploadResult(null)}>
                      <RotateCcw className="w-4 h-4" /> Change
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="btn-primary btn-sm cursor-pointer">
                      <Upload className="w-4 h-4" /> Upload & Classify
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-outline-variant" />
                    <p className="font-body-md text-on-surface-variant mt-2">Click or drag to upload</p>
                    <p className="font-body-sm text-on-surface-variant mt-1">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              )}
            </div>

            {uploadResult && uploadResult.waste_type && (
              <div className={cn("p-4 rounded-lg border", WASTE_TYPE_COLORS[uploadResult.waste_type], "bg-surface-container-low")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[32px] text-primary">
                      {WASTE_TYPE_ICONS[uploadResult.waste_type]}
                    </span>
                    <div>
                      <p className="font-headline-sm text-on-surface capitalize">{uploadResult.waste_type}</p>
                      <p className="font-body-sm text-on-surface-variant">
                        Confidence: {(uploadResult.confidence * 100).toFixed(1)}% · Weight: {uploadResult.weight_kg} kg
                      </p>
                    </div>
                  </div>
                  <span className={cn("badge", WASTE_TYPE_COLORS[uploadResult.waste_type])}>
                    AI Classified
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                className="btn-primary flex-1"
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !selectedBinId}
              >
                {uploading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Classifying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    Classify
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleSimulate(selectedBinId)}
                disabled={uploading || !selectedBinId}
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                Simulate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="section-title">Recent Classifications</h2>
          <span className="font-body-sm text-on-surface-variant">{classifications.length} total</span>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Bin</th>
                  <th>Waste Type</th>
                  <th>Confidence</th>
                  <th>Weight (kg)</th>
                  <th>Model</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {classifications.slice(0, 20).map((c) => (
                  <tr key={c.id}>
                    <td className="font-body-sm text-on-surface-variant font-mono">
                      {new Date(c.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="font-mono font-medium">{c.bin?.bin_code}</td>
                    <td>
                      <span className={cn("badge", WASTE_TYPE_COLORS[c.waste_type])}>
                        <span className="material-symbols-outlined text-[14px] mr-1">
                          {WASTE_TYPE_ICONS[c.waste_type]}
                        </span>
                        {c.waste_type}
                      </span>
                    </td>
                    <td className="font-mono tabular-nums">{(c.confidence * 100).toFixed(1)}%</td>
                    <td className="font-mono tabular-nums">{c.weight_kg}</td>
                    <td className="font-body-sm text-on-surface-variant">{c.model_version}</td>
                    <td>
                      {c.verified_category ? (
                        <span className={cn("badge", c.verified_category === c.waste_type ? "badge-success" : "badge-error")}>
                          {c.verified_category === c.waste_type ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Verified
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Mismatch
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant font-body-sm">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}