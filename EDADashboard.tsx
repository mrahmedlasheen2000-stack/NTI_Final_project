import { useEffect, useState } from "react";
import { BarChart, Users, Award, Percent, AlertCircle, HelpCircle } from "lucide-react";

interface EDAPayload {
  summary: {
    totalStudents: number;
    passes: number;
    fails: number;
    passRate: number;
  };
  studyTimeDist: Array<{ studytime: number; pass: number; fail: number; total: number }>;
  failuresDist: Array<{ failures: number; pass: number; fail: number; total: number }>;
  absencesDist: Array<{ bin: string; students: number }>;
  correlations: Array<{ feature: string; value: number }>;
  sampleRows: any[];
}

export default function EDADashboard() {
  const [data, setData] = useState<EDAPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dataset")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load dataset details.");
        return res.json();
      })
      .then(payload => {
        setData(payload);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 text-sm">Loading dataset statistics and running exploratory analysis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-xl text-center max-w-lg mx-auto my-12 animate-fade-in">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h3 className="text-rose-800 font-bold mb-1">Failed to Load Exploratory Data</h3>
        <p className="text-rose-600 text-sm mb-4">{error || "Verify backend is running and student-mat.csv is provisioned."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-indigo-600 bg-indigo-50 p-2 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Dataset Size</p>
          <h4 className="text-3xl font-bold font-display text-slate-900 mt-2">{data.summary.totalStudents}</h4>
          <p className="text-xs text-slate-500 mt-1.5">UCI student-mat records loaded</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-emerald-600 bg-emerald-50 p-2 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Passing Students (G3 ≥ 10)</p>
          <h4 className="text-3xl font-bold font-display text-emerald-600 mt-2">{data.summary.passes}</h4>
          <p className="text-xs text-slate-500 mt-1.5">Students satisfying pass threshold</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-rose-600 bg-rose-50 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Failing / At Risk Students</p>
          <h4 className="text-3xl font-bold font-display text-rose-600 mt-2">{data.summary.fails}</h4>
          <p className="text-xs text-slate-500 mt-1.5">Students with G3 score &lt; 10</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 text-blue-600 bg-blue-50 p-2 rounded-lg">
            <Percent className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Pass Rate Percentage</p>
          <h4 className="text-3xl font-bold font-display text-blue-600 mt-2">{data.summary.passRate.toFixed(1)}%</h4>
          <p className="text-xs text-slate-500 mt-1.5">Overall pass-to-fail ratio</p>
        </div>
      </div>

      {/* Grid of Interactive Explanatory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Study Time vs Pass/Fail */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-indigo-500" />
            Weekly Study Time vs. Pass/Fail Outcomes
          </h5>
          <p className="text-xs text-slate-500 mb-6">Categorized as: 1 (&lt;2 hrs), 2 (2-5 hrs), 3 (5-10 hrs), 4 (&gt;10 hrs)</p>
          
          <div className="space-y-4">
            {data.studyTimeDist.map(item => {
              const passPct = (item.pass / item.total) * 100;
              const failPct = (item.fail / item.total) * 100;
              return (
                <div key={item.studytime} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Study Class {item.studytime} ({item.studytime === 1 ? "<2" : item.studytime === 2 ? "2-5" : item.studytime === 3 ? "5-10" : ">10"} hours)
                    </span>
                    <span className="text-slate-500">{item.pass} Pass / {item.fail} Fail ({item.total} total)</span>
                  </div>
                  <div className="h-5 w-full bg-slate-100 rounded overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500" 
                      style={{ width: `${passPct}%` }}
                    >
                      {passPct > 15 && `${passPct.toFixed(0)}%`}
                    </div>
                    <div 
                      className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500" 
                      style={{ width: `${failPct}%` }}
                    >
                      {failPct > 15 && `${failPct.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Pass (Grade G3 ≥ 10)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Fail (Grade G3 &lt; 10)</span>
          </div>
        </div>

        {/* Chart 2: Previous Failures vs Pass/Fail */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-orange-500" />
            Previous Failures vs. Pass/Fail Outcomes
          </h5>
          <p className="text-xs text-slate-500 mb-6">Highlights how past class failure indices heavily correlate with final risk.</p>
          
          <div className="space-y-4">
            {data.failuresDist.map(item => {
              const passPct = item.total > 0 ? (item.pass / item.total) * 100 : 0;
              const failPct = item.total > 0 ? (item.fail / item.total) * 100 : 0;
              return (
                <div key={item.failures} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.failures} Past Failures
                    </span>
                    <span className="text-slate-500">{item.total > 0 ? `${item.pass} Pass / ${item.fail} Fail (${item.total} total)` : "0 students"}</span>
                  </div>
                  {item.total > 0 ? (
                    <div className="h-5 w-full bg-slate-100 rounded overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500" 
                        style={{ width: `${passPct}%` }}
                      >
                        {passPct > 15 && `${passPct.toFixed(0)}%`}
                      </div>
                      <div 
                        className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500" 
                        style={{ width: `${failPct}%` }}
                      >
                        {failPct > 15 && `${failPct.toFixed(0)}%`}
                      </div>
                    </div>
                  ) : (
                    <div className="h-5 w-full bg-slate-50 rounded flex items-center justify-center text-xs text-slate-400 font-mono italic">No data</div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-indigo-600 mt-4 italic">Notice: Having 1 or more past failures decreases pass probability significantly!</p>
        </div>

        {/* Chart 3: Absences Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-blue-500" />
            Distribution of Student Absences
          </h5>
          <p className="text-xs text-slate-500 mb-6">Frequency of student absences grouped into key occurrence bins.</p>
          
          <div className="h-44 flex items-end gap-3 pb-2 pt-4 px-2 border-b border-slate-200">
            {data.absencesDist.map(item => {
              const maxCount = Math.max(...data.absencesDist.map(b => b.students));
              const heightPct = (item.students / maxCount) * 80; // Scale to fit
              return (
                <div key={item.bin} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-slate-800 pointer-events-none shadow-md">
                    {item.students} students
                  </div>
                  <div 
                    className="w-full bg-indigo-500/80 group-hover:bg-indigo-600 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">{item.bin}</span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-3 font-mono">Absence Range (Occurrences)</div>
        </div>

        {/* Chart 4: Correlation Grid with Final Grade */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Correlation Heatmap with G3 Outcome
          </h5>
          <p className="text-xs text-slate-500 mb-6">Correlation coefficient value relative to final grade. Hover or click attributes for details.</p>
          
          <div className="space-y-3">
            {data.correlations.map(item => {
              const isPositive = item.value >= 0;
              const absVal = Math.abs(item.value);
              const fillPct = absVal * 100;
              return (
                <div 
                  key={item.feature} 
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    activeFeature === item.feature 
                      ? "bg-slate-50 border-indigo-500 shadow-sm" 
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200/80"
                  }`}
                  onClick={() => setActiveFeature(item.feature === activeFeature ? null : item.feature)}
                >
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{item.feature}</span>
                    <span className={`font-mono font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      {isPositive ? "+" : ""}{item.value.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200/60 rounded overflow-hidden relative">
                    <div 
                      className={`h-full rounded transition-all duration-500 ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: `${fillPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Interactive Feature Deep Dive Drawer */}
      {activeFeature && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 animate-slide-up shadow-sm text-left">
          <h6 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Exploratory Insight: {activeFeature} Impact
          </h6>
          <p className="text-xs text-indigo-950 mt-2 leading-relaxed">
            {activeFeature === "First Period G1" || activeFeature === "Second Period G2" ? (
              "First and Second period grades possess extremely strong positive correlations (+0.80 and +0.90) with final G3 results. This validates Option A: including them ensures models achieve accuracy scores above 90%, but turns the task into grade continuation tracking rather than predictive early-intervention."
            ) : activeFeature === "Past Failures" ? (
              "Past class failures is the single strongest negative predictor (-0.36) in the demographic/personal attributes category. Students with even one prior failure show a dramatically lower probability of passing, making this a vital early-warning trigger parameter for advisors."
            ) : activeFeature === "Study Time" ? (
              "Weekly study time exhibits a steady positive correlation (+0.13) with passing. Moving a student from study class 1 (<2 hours) to class 3 (5-10 hours) reduces overall failure rates by over 40% in historical data observations."
            ) : (
              `The statistical analysis highlights that ${activeFeature} is highly predictive. In standard Capstone regression/classification workflows, optimizing parameters related to this attribute provides the greatest leverage for raising overall pass rates.`
            )}
          </p>
        </div>
      )}

      {/* Dataset Sample Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h5 className="text-sm font-semibold text-slate-900">Dataset Sample Viewer</h5>
          <p className="text-xs text-slate-500 mt-1">Sample raw data rows parsed from UCI repository (Math Course).</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-mono uppercase">
                <th className="p-4">School</th>
                <th className="p-4">Sex</th>
                <th className="p-4">Age</th>
                <th className="p-4">Study Time</th>
                <th className="p-4">Failures</th>
                <th className="p-4">School Sup</th>
                <th className="p-4">Absences</th>
                <th className="p-4">G1</th>
                <th className="p-4">G2</th>
                <th className="p-4">G3 (Final)</th>
                <th className="p-4 text-right">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {data.sampleRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">{row.school}</td>
                  <td className="p-4">{row.sex}</td>
                  <td className="p-4">{row.age}</td>
                  <td className="p-4 font-mono text-slate-500">{row.studytime} ({row.studytime === 1 ? "<2h" : row.studytime === 2 ? "2-5h" : "5h+"})</td>
                  <td className="p-4 font-mono text-orange-500 font-medium">{row.failures}</td>
                  <td className="p-4">{row.schoolsup}</td>
                  <td className="p-4 font-mono">{row.absences}</td>
                  <td className="p-4 font-mono text-blue-600">{row.G1}</td>
                  <td className="p-4 font-mono text-blue-600">{row.G2}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">{row.G3}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold font-mono ${
                      row.pass_fail === 1 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {row.pass_fail === 1 ? "PASS" : "FAIL"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
