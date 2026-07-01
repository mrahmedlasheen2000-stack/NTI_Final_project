import { useEffect, useState } from "react";
import { Play, ShieldAlert, Award, Grid, ChevronRight, Shuffle, Cpu } from "lucide-react";

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
}

interface ModelPayload {
  logisticRegression: { modelName: string; withGrades: Metrics; withoutGrades: Metrics };
  decisionTree: { modelName: string; withGrades: Metrics; withoutGrades: Metrics };
  randomForest: { modelName: string; withGrades: Metrics; withoutGrades: Metrics };
  trainingSize: number;
  testingSize: number;
}

export default function ModelStudio() {
  const [useGrades, setUseGrades] = useState(false); // Toggle Option A vs Option B
  const [testRatio, setTestRatio] = useState(0.2);
  const [randomSeed, setRandomSeed] = useState(42);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ModelPayload | null>(null);
  const [activeModel, setActiveModel] = useState<"RF" | "DT" | "LR">("RF");

  const runTraining = () => {
    setLoading(true);
    fetch("/api/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testRatio, randomSeed }),
    })
      .then(res => res.json())
      .then(payload => {
        setData(payload);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    runTraining();
  }, []);

  if (!data) return null;

  // Isolate metrics of the selected configuration & model
  const getActiveMetrics = (): Metrics => {
    const modelData = activeModel === "RF" ? data.randomForest : activeModel === "DT" ? data.decisionTree : data.logisticRegression;
    return useGrades ? modelData.withGrades : modelData.withoutGrades;
  };

  const metrics = getActiveMetrics();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Control Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm">
        <div>
          <h4 className="text-base font-semibold font-display text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" />
            Machine Learning Training Lab
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Re-split the dataset and train Logistic Regression, Decision Tree, & Random Forest models live.
          </p>
        </div>

        {/* Training Parameters Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-inner">
            <span className="text-[10px] text-slate-400 font-mono uppercase px-1">Test Ratio</span>
            <select 
              value={testRatio} 
              onChange={e => setTestRatio(parseFloat(e.target.value))}
              className="text-xs bg-transparent text-slate-700 focus:outline-none cursor-pointer font-mono font-semibold"
            >
              <option value="0.1" className="bg-white text-slate-800">10% Split</option>
              <option value="0.2" className="bg-white text-slate-800">20% Split</option>
              <option value="0.3" className="bg-white text-slate-800">30% Split</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-inner">
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-mono uppercase">Seed</span>
            <input 
              type="number" 
              value={randomSeed} 
              onChange={e => setRandomSeed(parseInt(e.target.value) || 42)}
              className="w-12 text-xs bg-transparent text-slate-700 text-center focus:outline-none font-mono font-semibold"
            />
          </div>

          <button 
            onClick={runTraining}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-all w-full md:w-auto cursor-pointer shadow-md shadow-indigo-600/10"
          >
            <Play className="w-3.5 h-3.5" />
            {loading ? "Training..." : "Train Live Models!"}
          </button>
        </div>
      </div>

      {/* Model Selection and Option A/B Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Models Selector & Core Toggle */}
        <div className="lg:col-span-4 space-y-6">
          {/* Option Toggle */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">Project Version Scope</h5>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setUseGrades(true)}
                className={`py-2 px-3 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  useGrades 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Option A (With G1 & G2)
              </button>
              <button
                onClick={() => setUseGrades(false)}
                className={`py-2 px-3 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  !useGrades 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Option B (Early-Warning)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
              {useGrades 
                ? "Option A yields extremely high metrics (Accuracy >90%) because G1 & G2 grades directly project the G3 trajectory."
                : "Option B is a realistic warning system. It restricts the features solely to early student demographics, travel times, failures, and supports."
              }
            </p>
          </div>

          {/* Model Classifiers Tabs */}
          <div className="space-y-3">
            <div 
              onClick={() => setActiveModel("RF")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeModel === "RF" 
                  ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/10" 
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-center">
                <h5 className={`text-sm font-bold ${activeModel === "RF" ? "text-indigo-950" : "text-slate-800"}`}>Random Forest</h5>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeModel === "RF" ? "rotate-90" : ""}`} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Bagged decision ensemble. High generalisation, robust to categorical outliers.</p>
              <div className="flex gap-4 mt-3 text-[10px] font-mono font-semibold">
                <span className="text-indigo-600">Acc: {((useGrades ? data.randomForest.withGrades.accuracy : data.randomForest.withoutGrades.accuracy) * 100).toFixed(1)}%</span>
                <span className="text-emerald-600">F1: {((useGrades ? data.randomForest.withGrades.f1Score : data.randomForest.withoutGrades.f1Score) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveModel("DT")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeModel === "DT" 
                  ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/10" 
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-center">
                <h5 className={`text-sm font-bold ${activeModel === "DT" ? "text-indigo-950" : "text-slate-800"}`}>Decision Tree</h5>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeModel === "DT" ? "rotate-90" : ""}`} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Single hierarchical flowchart with information gain splitting thresholds.</p>
              <div className="flex gap-4 mt-3 text-[10px] font-mono font-semibold">
                <span className="text-indigo-600">Acc: {((useGrades ? data.decisionTree.withGrades.accuracy : data.decisionTree.withoutGrades.accuracy) * 100).toFixed(1)}%</span>
                <span className="text-emerald-600">F1: {((useGrades ? data.decisionTree.withGrades.f1Score : data.decisionTree.withoutGrades.f1Score) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveModel("LR")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeModel === "LR" 
                  ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/10" 
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-center">
                <h5 className={`text-sm font-bold ${activeModel === "LR" ? "text-indigo-950" : "text-slate-800"}`}>Logistic Regression</h5>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeModel === "LR" ? "rotate-90" : ""}`} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Parametric sigmoid classification. Highly interpretable features weights.</p>
              <div className="flex gap-4 mt-3 text-[10px] font-mono font-semibold">
                <span className="text-indigo-600">Acc: {((useGrades ? data.logisticRegression.withGrades.accuracy : data.logisticRegression.withoutGrades.accuracy) * 100).toFixed(1)}%</span>
                <span className="text-emerald-600">F1: {((useGrades ? data.logisticRegression.withGrades.f1Score : data.logisticRegression.withoutGrades.f1Score) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Model Metrics & Confusion Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {/* Core Metrics Viewer */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
            <h5 className="text-sm font-semibold text-slate-900 mb-6 font-display">
              Evaluation Metrics Comparison
            </h5>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Accuracy</p>
                <h6 className="text-2xl font-bold font-display text-slate-900 mt-1">{(metrics.accuracy * 100).toFixed(1)}%</h6>
                <div className="text-[9px] text-slate-400 mt-1">Overall correctness</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Precision</p>
                <h6 className="text-2xl font-bold font-display text-indigo-600 mt-1">{(metrics.precision * 100).toFixed(1)}%</h6>
                <div className="text-[9px] text-slate-400 mt-1">Correct positive calls</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Recall (Sensitivity)</p>
                <h6 className="text-2xl font-bold font-display text-emerald-600 mt-1">{(metrics.recall * 100).toFixed(1)}%</h6>
                <div className="text-[9px] text-slate-400 mt-1">Detected passes</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">F1-Score</p>
                <h6 className="text-2xl font-bold font-display text-blue-600 mt-1">{(metrics.f1Score * 100).toFixed(1)}%</h6>
                <div className="text-[9px] text-slate-400 mt-1">Balance metric</div>
              </div>
            </div>
          </div>

          {/* Interactive Confusion Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Confusion Matrix Visualization Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Grid className="w-4 h-4 text-indigo-500" />
                Confusion Matrix
              </h5>
              <p className="text-xs text-slate-500 mb-6">Evaluation split results on {data.testingSize} unseen records.</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-center font-mono">
                {/* Row 1: True Positive & False Negative */}
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">True Positive (TP)</div>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{metrics.confusionMatrix.tp}</div>
                  <div className="text-[8px] text-emerald-600 mt-1">Predicted Pass, Actual Pass</div>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                  <div className="text-[10px] text-rose-700 uppercase font-bold">False Negative (FN)</div>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{metrics.confusionMatrix.fn}</div>
                  <div className="text-[8px] text-rose-600 mt-1">Predicted Fail, Actual Pass</div>
                </div>

                {/* Row 2: False Positive & True Negative */}
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                  <div className="text-[10px] text-rose-700 uppercase font-bold">False Positive (FP)</div>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{metrics.confusionMatrix.fp}</div>
                  <div className="text-[8px] text-rose-600 mt-1">Predicted Pass, Actual Fail</div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">True Negative (TN)</div>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{metrics.confusionMatrix.tn}</div>
                  <div className="text-[8px] text-emerald-600 mt-1">Predicted Fail, Actual Fail</div>
                </div>
              </div>
            </div>

            {/* Rubric Explanatory Drawer */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-500" />
                  Why recall matters most?
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed mt-3">
                  In school student pass/fail prediction, <strong>False Negatives (FN)</strong> — predicting a student will pass when they are actually at risk of failing — is highly critical. 
                  If we miss a failing student (high FN, lower recall), they will not receive intervention or support, which leads to academic failure.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mt-3">
                  Our custom <strong>Random Forest</strong> models actively prioritize maximizing the F1-Score to strike a perfect protective balance, safeguarding vulnerable student trajectories.
                </p>
              </div>

              <div className="text-[10px] font-mono text-slate-400 border-t border-slate-150 pt-3 mt-4">
                Total training records used: {data.trainingSize} students
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
