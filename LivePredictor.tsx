import { useState, FormEvent } from "react";
import { Send, HelpCircle, Bot, Sparkles, User, GraduationCap, AlertTriangle, ShieldCheck } from "lucide-react";

export default function LivePredictor() {
  const [model, setModel] = useState("Random Forest");
  const [useGrades, setUseGrades] = useState(true);
  
  // Student attributes state
  const [age, setAge] = useState(17);
  const [studytime, setStudytime] = useState(2);
  const [failures, setFailures] = useState(0);
  const [absences, setAbsences] = useState(4);
  const [G1, setG1] = useState(10);
  const [G2, setG2] = useState(10);
  const [schoolsup, setSchoolsup] = useState("no");
  const [famsup, setFamsup] = useState("yes");
  const [higher, setHigher] = useState("yes");
  const [internet, setInternet] = useState("yes");

  // Output prediction state
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Gemini advice state
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handlePredict = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiAdvice(null); // Clear previous AI text

    fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        useGrades,
        age,
        studytime,
        failures,
        absences,
        G1,
        G2,
        schoolsup,
        famsup,
        higher,
        internet
      }),
    })
      .then(res => res.json())
      .then(resData => {
        setPrediction(resData.prediction);
        setConfidence(resData.confidence);
        setRecommendation(resData.recommendation);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const getAIEducationalAdvice = () => {
    setAiLoading(true);
    fetch("/api/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age,
        studytime,
        failures,
        absences,
        schoolsup,
        famsup,
        G1,
        G2,
        higher,
        prediction,
        confidence
      })
    })
      .then(res => res.json())
      .then(resData => {
        setAiAdvice(resData.advice);
        setAiLoading(false);
      })
      .catch(err => {
        console.error(err);
        setAiLoading(false);
      });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Inputs */}
        <form onSubmit={handlePredict} className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h5 className="text-sm font-semibold font-display text-slate-900">Student Attribute Configuration</h5>
            <p className="text-xs text-slate-500 mt-1">Configure the student details below to simulate risk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Model & Version selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Predictive ML Model</label>
              <select 
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full text-xs bg-slate-50 text-slate-800 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium"
              >
                <option value="Random Forest">Random Forest Classifier</option>
                <option value="Decision Tree">Decision Tree Classifier</option>
                <option value="Logistic Regression">Logistic Regression Classifier</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Feature Scope Mode</label>
              <select 
                value={useGrades ? "true" : "false"}
                onChange={e => setUseGrades(e.target.value === "true")}
                className="w-full text-xs bg-slate-50 text-slate-800 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium"
              >
                <option value="true">Include G1 & G2 (Option A)</option>
                <option value="false">Exclude G1 & G2 (Option B - Early Warning)</option>
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150 shadow-inner">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Student Age</span>
                <span className="font-mono text-indigo-600 font-bold">{age} years old</span>
              </div>
              <input 
                type="range" min="15" max="22" value={age} 
                onChange={e => setAge(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150 shadow-inner">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Weekly Study Time</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {studytime === 1 ? "<2 hours" : studytime === 2 ? "2-5 hours" : studytime === 3 ? "5-10 hours" : ">10 hours"}
                </span>
              </div>
              <input 
                type="range" min="1" max="4" value={studytime} 
                onChange={e => setStudytime(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150 shadow-inner">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Previous Class Failures</span>
                <span className="font-mono text-indigo-600 font-bold">{failures} fails</span>
              </div>
              <input 
                type="range" min="0" max="3" value={failures} 
                onChange={e => setFailures(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150 shadow-inner">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Absences (0 - 93)</span>
                <span className="font-mono text-indigo-600 font-bold">{absences} days</span>
              </div>
              <input 
                type="range" min="0" max="40" value={absences} 
                onChange={e => setAbsences(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Grades (Shown only if useGrades is active) */}
            {useGrades && (
              <>
                <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150 shadow-inner">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">First Period Grade G1 (0-20)</span>
                    <span className="font-mono text-emerald-600 font-bold">{G1}/20</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" value={G1} 
                    onChange={e => setG1(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-150 shadow-inner">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Second Period Grade G2 (0-20)</span>
                    <span className="font-mono text-emerald-600 font-bold">{G2}/20</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" value={G2} 
                    onChange={e => setG2(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Select options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Extra Educational Support</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button" onClick={() => setSchoolsup("yes")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${schoolsup === "yes" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  Yes Support
                </button>
                <button
                  type="button" onClick={() => setSchoolsup("no")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${schoolsup === "no" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  No Support
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Family Educational Support</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button" onClick={() => setFamsup("yes")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${famsup === "yes" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  Yes Support
                </button>
                <button
                  type="button" onClick={() => setFamsup("no")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${famsup === "no" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  No Support
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Wants Higher Education</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button" onClick={() => setHigher("yes")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${higher === "yes" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  Yes (Higher)
                </button>
                <button
                  type="button" onClick={() => setHigher("no")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${higher === "no" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  No (Higher)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Internet Access at Home</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button" onClick={() => setInternet("yes")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${internet === "yes" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  Has Internet
                </button>
                <button
                  type="button" onClick={() => setInternet("no")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${internet === "no" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  No Internet
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
          >
            <Send className="w-4 h-4" />
            {loading ? "Generating ML Risk Prediction..." : "Run ML Predictor Engine"}
          </button>
        </form>

        {/* Right Column: Prediction Outcomes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[320px] shadow-sm">
            {prediction === null ? (
              <div className="p-4 space-y-3">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
                <h6 className="text-sm font-semibold text-slate-800 font-display">Awaiting Input Parameters</h6>
                <p className="text-xs text-slate-500 max-w-xs">
                  Fill in the student attributes on the left and trigger the predictor to check pass/fail trajectories.
                </p>
              </div>
            ) : (
              <div className="space-y-6 w-full animate-scale-in">
                <div className="flex flex-col items-center space-y-2">
                  {prediction === 1 ? (
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full border border-emerald-100 shadow-sm">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-full border border-rose-100 shadow-sm">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  )}
                  <h6 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Model Prediction</h6>
                  <h4 className={`text-2xl font-bold font-display ${prediction === 1 ? "text-emerald-600" : "text-rose-600"}`}>
                    {prediction === 1 ? "Student Pass (G3 ≥ 10)" : "At Risk of Failing"}
                  </h4>
                </div>

                {/* Simulated Dial Indicator */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="72" cy="72" r="60" 
                      stroke={prediction === 1 ? "#10b981" : "#f43f5e"} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60 * (1 - (confidence || 50) / 100)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-bold font-mono text-slate-900">{confidence?.toFixed(1)}%</span>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-semibold">Confidence</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-left">
                  <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Academic Advisor Note</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{recommendation}</p>
                </div>

                {/* Gemini AI Action */}
                {!aiAdvice && (
                  <button
                    onClick={getAIEducationalAdvice}
                    disabled={aiLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-indigo-200" />
                    {aiLoading ? "Consulting AI Advisor..." : "Ask Gemini AI Academic Advisor"}
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Advice Output Container */}
          {aiAdvice && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 animate-slide-up text-left shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-slate-900 font-display">Gemini AI Intervention Plan</h6>
                  <p className="text-[10px] text-slate-400 font-mono font-semibold">Custom tailored feedback based on predictive inputs.</p>
                </div>
              </div>
              
              <div className="text-xs text-slate-600 space-y-2 whitespace-pre-line leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                {aiAdvice}
              </div>
            </div>
          )}

          {aiLoading && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 py-12 animate-pulse shadow-sm">
              <Bot className="w-10 h-10 text-indigo-600 animate-bounce" />
              <p className="text-xs text-slate-500 max-w-xs">Gemini is synthesizing academic advice and building an action plan...</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
