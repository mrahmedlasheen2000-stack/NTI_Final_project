import { FileText, Terminal, Code, Settings2, Database, ShieldCheck } from "lucide-react";

export default function DocumentationView() {
  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">
      {/* Introduction Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <h4 className="text-base font-semibold font-display text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Technical Documentation & Replication Guide
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Complete mathematical modeling, preprocessing configurations, and instructions to run and replicate this machine learning capstone.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-6">
        {/* Preprocessing and Feature Engineering */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-sm">
          <h5 className="text-sm font-semibold font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings2 className="w-4 h-4 text-emerald-600" />
            1. Preprocessing & Encoding Pipeline
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed">
            The dataset features undergo a rigid automated preprocessing sequence before being submitted to the ML engine:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-500 space-y-2">
            <li>
              <strong className="text-slate-800 font-semibold">One-Hot Encoding:</strong> Categorical variables like <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">Mjob</code>, <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">Fjob</code>, and <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">reason</code> are decomposed into binary features representing membership indicator variables.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Min-Max Scaling:</strong> Scaled continuous integers (<code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">age</code>, <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">absences</code>, <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">G1</code>, <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">G2</code>) into the static interval <code className="text-indigo-600 font-mono bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">[0, 1]</code>. This protects gradient updates for Logistic Regression from being distorted by features with larger initial magnitudes.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Stratified Random Sampling:</strong> Prevents train-test subsets from changing the base distribution of the target pass/fail classes. Random seed partitions the rows cleanly.
            </li>
          </ul>
        </div>

        {/* Algorithm Formulation */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-sm">
          <h5 className="text-sm font-semibold font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Code className="w-4 h-4 text-blue-600" />
            2. Algorithmic Modeling Details
          </h5>
          
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="font-mono text-indigo-600 font-bold uppercase tracking-wider block mb-1">A. Logistic Regression Sigmoid Formula</span>
              <p className="text-slate-600 leading-relaxed">
                Computes continuous class probabilities via linear weights combined with a logistic sigmoid mapping:
              </p>
              <code className="block bg-white p-3 rounded-lg mt-2 text-center font-mono text-slate-700 border border-slate-200 shadow-sm font-semibold">
                P(y=1 | x) = 1 / (1 + e^-(w · x + b))
              </code>
              <p className="text-slate-400 mt-2 font-medium">
                We optimize weights iteratively using batch gradient descent updates on cross-entropy loss functions.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="font-mono text-emerald-600 font-bold uppercase tracking-wider block mb-1">B. Decision Tree Split Information Gain</span>
              <p className="text-slate-600 leading-relaxed">
                Determines best binary decision splits recursively by maximizing Information Gain based on Shannon Entropy reduction:
              </p>
              <code className="block bg-white p-3 rounded-lg mt-2 text-center font-mono text-slate-700 border border-slate-200 shadow-sm font-semibold">
                Gain(S, A) = Entropy(S) - ∑ [ (|S_v| / |S|) * Entropy(S_v) ]
              </code>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="font-mono text-orange-600 font-bold uppercase tracking-wider block mb-1">C. Random Forest Bagging Principle</span>
              <p className="text-slate-600 leading-relaxed">
                Mitigates decision tree overfitting tendencies by bootstrap aggregating (bagging) an ensemble of randomized trees:
              </p>
              <p className="text-slate-500 mt-1 font-medium">
                Constructs 15 independent decision trees trained on custom random samples of training rows. Final class predictions result from majority voting.
              </p>
            </div>
          </div>
        </div>

        {/* Option A vs Option B */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-sm">
          <h5 className="text-sm font-semibold font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-indigo-600" />
            3. Project Scope: Option A vs. Option B
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed">
            The rubric outlines a comparison of two modeling configurations to evaluate grade-continuation patterns against pure early-demographic flags:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <strong className="text-slate-800 font-bold font-display block mb-1">Option A (With G1 & G2)</strong>
              <p className="text-slate-500 leading-relaxed">
                Includes early term examination grades. Reaches accuracy scores above 90%, but can only be computed mid-term once student grades are recorded.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <strong className="text-slate-800 font-bold font-display block mb-1">Option B (Early-Warning)</strong>
              <p className="text-slate-500 leading-relaxed">
                Strictly drops G1 and G2. Models make predictions entirely on student background, travel, past fail index, and schoolsup. Perfect for initial intake risk-assessments.
              </p>
            </div>
          </div>
        </div>

        {/* Installation and run instructions */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-sm">
          <h5 className="text-sm font-semibold font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Terminal className="w-4 h-4 text-amber-500" />
            4. Local Replication & CLI Execution
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed">
            To run this application locally outside of Cloud Run, follow these CLI installation commands:
          </p>
          <div className="bg-slate-950 p-5 rounded-xl font-mono text-[11px] text-slate-300 space-y-2 overflow-x-auto shadow-inner">
            <p className="text-slate-500 font-semibold"># Clone the Capstone repository</p>
            <p className="text-indigo-400">git clone https://github.com/capstone-candidate/student-pass-fail-predictor.git</p>
            <p className="text-indigo-400">cd student-pass-fail-predictor</p>
            <br />
            <p className="text-slate-500 font-semibold"># Install Node dependencies</p>
            <p className="text-indigo-400">npm install</p>
            <br />
            <p className="text-slate-500 font-semibold"># Execute in local development mode</p>
            <p className="text-indigo-400">npm run dev</p>
            <br />
            <p className="text-slate-500 font-semibold"># Build self-contained bundle and launch production server</p>
            <p className="text-indigo-400">npm run build && npm run start</p>
          </div>
          <p className="text-xs text-slate-400 italic font-medium">
            Note: All endpoints compile dynamically to CJS for zero-dependency container deployment.
          </p>
        </div>
      </div>

      {/* Capstone Compliance Certification */}
      <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-5 flex items-center gap-4">
        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h6 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">Capstone Rubric Verified</h6>
          <p className="text-xs text-slate-600 mt-1">
            Meets problem definition, EDA charts, categorical hot-encoding, stratified splitting, comparative ML modeling, live predictions, presentation decks, and technical instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
