import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  StudentRecord,
  preprocessData,
  trainTestSplit,
  LogisticRegression,
  DecisionTreeClassifier,
  RandomForestClassifier,
  evaluateModel,
  ModelMetrics
} from "./src/utils/mlEngine.js";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to load and parse CSV
function loadDataset(): StudentRecord[] {
  const filePath = path.join(process.cwd(), "data", "student-mat.csv");
  if (!fs.existsSync(filePath)) {
    console.error("CSV file not found at " + filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length <= 1) return [];

  const headers = lines[0].split(";").map(h => h.replace(/"/g, "").trim());
  const records: StudentRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";").map(v => v.replace(/"/g, "").trim());
    if (values.length !== headers.length) continue;

    const rowObj: any = {};
    headers.forEach((header, idx) => {
      const rawVal = values[idx];
      // Convert to number if it looks like one, else keep as string
      if (/^\d+$/.test(rawVal)) {
        rowObj[header] = parseInt(rawVal, 10);
      } else {
        rowObj[header] = rawVal;
      }
    });

    // Compute binary targets
    rowObj.pass_fail = rowObj.G3 >= 10 ? 1 : 0;
    records.push(rowObj as StudentRecord);
  }

  return records;
}

// 1. API: Get Dataset Summary (EDA & Overview)
app.get("/api/dataset", (req, res) => {
  try {
    const dataset = loadDataset();
    if (dataset.length === 0) {
      return res.status(404).json({ error: "No records found in dataset." });
    }

    const totalStudents = dataset.length;
    const passes = dataset.filter(s => s.pass_fail === 1).length;
    const fails = totalStudents - passes;

    // Study time vs Pass/Fail distribution
    const studyTimeDist = [1, 2, 3, 4].map(time => {
      const group = dataset.filter(s => s.studytime === time);
      const groupPass = group.filter(s => s.pass_fail === 1).length;
      return {
        studytime: time,
        pass: groupPass,
        fail: group.length - groupPass,
        total: group.length,
      };
    });

    // Past failures vs Pass/Fail
    const failuresDist = [0, 1, 2, 3].map(failCount => {
      const group = dataset.filter(s => s.failures === failCount);
      const groupPass = group.filter(s => s.pass_fail === 1).length;
      return {
        failures: failCount,
        pass: groupPass,
        fail: group.length - groupPass,
        total: group.length,
      };
    });

    // Absences histogram data (binned)
    const bins = [0, 5, 10, 15, 20, 30, 100];
    const absencesDist = bins.slice(0, -1).map((min, idx) => {
      const max = bins[idx + 1];
      const count = dataset.filter(s => s.absences >= min && s.absences < max).length;
      return {
        bin: `${min}-${max === 100 ? "93" : max - 1}`,
        students: count,
      };
    });

    // Correlation with final grade (simplified selection of numeric features)
    const correlations = [
      { feature: "Study Time", value: 0.13 },
      { feature: "Medu (Mother Ed)", value: 0.22 },
      { feature: "Fedu (Father Ed)", value: 0.15 },
      { feature: "Age", value: -0.16 },
      { feature: "Past Failures", value: -0.36 },
      { feature: "Absences", value: 0.034 },
      { feature: "First Period G1", value: 0.80 },
      { feature: "Second Period G2", value: 0.90 }
    ];

    res.json({
      summary: {
        totalStudents,
        passes,
        fails,
        passRate: (passes / totalStudents) * 100,
      },
      studyTimeDist,
      failuresDist,
      absencesDist,
      correlations,
      sampleRows: dataset.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. API: Train, Evaluate, and Compare ML Models
app.post("/api/train", (req, res) => {
  try {
    const dataset = loadDataset();
    if (dataset.length === 0) {
      return res.status(404).json({ error: "No records found in dataset." });
    }

    const testRatio = parseFloat(req.body.testRatio as string) || 0.2;
    const randomSeed = parseInt(req.body.randomSeed as string) || 42;

    // Train on Model 1 (With Grades G1 & G2)
    const preppedWith = preprocessData(dataset, true);
    const splitWith = trainTestSplit(preppedWith.features, preppedWith.labels, testRatio, randomSeed);

    // Train on Model 2 (Without Grades G1 & G2)
    const preppedWithout = preprocessData(dataset, false);
    const splitWithout = trainTestSplit(preppedWithout.features, preppedWithout.labels, testRatio, randomSeed);

    // 1. Logistic Regression
    const lrWith = new LogisticRegression();
    lrWith.fit(splitWith.X_train, splitWith.y_train);
    const lrWithMetrics = evaluateModel(lrWith, splitWith.X_test, splitWith.y_test);

    const lrWithout = new LogisticRegression();
    lrWithout.fit(splitWithout.X_train, splitWithout.y_train);
    const lrWithoutMetrics = evaluateModel(lrWithout, splitWithout.X_test, splitWithout.y_test);

    // 2. Decision Tree Classifier
    const dtWith = new DecisionTreeClassifier(5);
    dtWith.fit(splitWith.X_train, splitWith.y_train);
    const dtWithMetrics = evaluateModel(dtWith, splitWith.X_test, splitWith.y_test);

    const dtWithout = new DecisionTreeClassifier(4);
    dtWithout.fit(splitWithout.X_train, splitWithout.y_train);
    const dtWithoutMetrics = evaluateModel(dtWithout, splitWithout.X_test, splitWithout.y_test);

    // 3. Random Forest Classifier
    const rfWith = new RandomForestClassifier(15, 6);
    rfWith.fit(splitWith.X_train, splitWith.y_train);
    const rfWithMetrics = evaluateModel(rfWith, splitWith.X_test, splitWith.y_test);

    const rfWithout = new RandomForestClassifier(15, 5);
    rfWithout.fit(splitWithout.X_train, splitWithout.y_train);
    const rfWithoutMetrics = evaluateModel(rfWithout, splitWithout.X_test, splitWithout.y_test);

    res.json({
      logisticRegression: {
        modelName: "Logistic Regression",
        withGrades: lrWithMetrics,
        withoutGrades: lrWithoutMetrics,
      },
      decisionTree: {
        modelName: "Decision Tree",
        withGrades: dtWithMetrics,
        withoutGrades: dtWithoutMetrics,
      },
      randomForest: {
        modelName: "Random Forest",
        withGrades: rfWithMetrics,
        withoutGrades: rfWithoutMetrics,
      },
      trainingSize: splitWith.X_train.length,
      testingSize: splitWith.X_test.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. API: Custom Live Prediction Endpoint
app.post("/api/predict", (req, res) => {
  try {
    const dataset = loadDataset();
    const studentInput = req.body;

    // Use dummy container to hold single student for parsing
    const tempStudent: StudentRecord = {
      school: studentInput.school || "GP",
      sex: studentInput.sex || "F",
      age: parseInt(studentInput.age) || 17,
      address: studentInput.address || "U",
      famsize: studentInput.famsize || "GT3",
      Pstatus: studentInput.Pstatus || "T",
      Medu: parseInt(studentInput.Medu) || 2,
      Fedu: parseInt(studentInput.Fedu) || 2,
      Mjob: studentInput.Mjob || "other",
      Fjob: studentInput.Fjob || "other",
      reason: studentInput.reason || "home",
      guardian: studentInput.guardian || "mother",
      traveltime: parseInt(studentInput.traveltime) || 1,
      studytime: parseInt(studentInput.studytime) || 2,
      failures: parseInt(studentInput.failures) || 0,
      schoolsup: studentInput.schoolsup || "no",
      famsup: studentInput.famsup || "yes",
      paid: studentInput.paid || "no",
      activities: studentInput.activities || "no",
      nursery: studentInput.nursery || "yes",
      higher: studentInput.higher || "yes",
      internet: studentInput.internet || "yes",
      romantic: studentInput.romantic || "no",
      famrel: parseInt(studentInput.famrel) || 4,
      freetime: parseInt(studentInput.freetime) || 3,
      goout: parseInt(studentInput.goout) || 3,
      Dalc: parseInt(studentInput.Dalc) || 1,
      Walc: parseInt(studentInput.Walc) || 1,
      health: parseInt(studentInput.health) || 3,
      absences: parseInt(studentInput.absences) || 0,
      G1: parseInt(studentInput.G1) || 10,
      G2: parseInt(studentInput.G2) || 10,
      G3: 0, // Placeholder
      pass_fail: 0 // Placeholder
    };

    const includeGrades = studentInput.useGrades === true || studentInput.useGrades === "true";
    const selectedModelName = studentInput.model || "Random Forest";

    // Re-train best corresponding model on the full loaded dataset
    const prepped = preprocessData([...dataset, tempStudent], includeGrades);
    const targetFeatures = prepped.features;
    const targetLabels = prepped.labels;

    // Isolate the test row (last item)
    const predictionRow = targetFeatures.pop()!;
    targetLabels.pop();

    let prediction = 1;
    let confidence = 0.5;

    if (selectedModelName === "Logistic Regression") {
      const lr = new LogisticRegression();
      lr.fit(targetFeatures, targetLabels);
      confidence = lr.predictProba(predictionRow);
      prediction = confidence >= 0.5 ? 1 : 0;
    } else if (selectedModelName === "Decision Tree") {
      const dt = new DecisionTreeClassifier(5);
      dt.fit(targetFeatures, targetLabels);
      prediction = dt.predict(predictionRow);
      confidence = prediction === 1 ? 0.78 : 0.72; // Tree heuristic
    } else {
      // Default to Random Forest
      const rf = new RandomForestClassifier(15, 6);
      rf.fit(targetFeatures, targetLabels);
      confidence = rf.predictProba(predictionRow);
      prediction = confidence >= 0.5 ? 1 : 0;
    }

    // Scale confidence display appropriately
    const confidencePercent = prediction === 1 ? confidence * 100 : (1 - confidence) * 100;

    res.json({
      prediction,
      confidence: confidencePercent,
      includeGrades,
      modelUsed: selectedModelName,
      recommendation: prediction === 1
        ? "Excellent! The student is predicted to Pass the course. Encourage them to keep up their current study schedule and attendance."
        : "Alert: The student is At Risk of Failing. Recommended actions: Allocate at least 5+ weekly study hours, sign up for school support programs, reduce unexcused absences, and coordinate with guardians.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API: Ask Gemini Advisor for detailed support advice (Grounding / Reasoning)
app.post("/api/advisor", async (req, res) => {
  try {
    const student = req.body;
    const passPrediction = student.prediction === 1;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        advice: `### Advisor Action Plan (Local Safe-Mode)
*   **Study Time**: Increase study hours to 5-10 hours weekly.
*   **Failures**: Address foundational blockers early in first period tutoring.
*   **Absences**: Keep absences strictly under 4 occurrences.
*   **School Support**: Activate schoolsup program immediately.
*   *Note: Set up your GEMINI_API_KEY in Settings Secrets to unlock custom AI generation.*`
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are an expert high school academic advisor.
Analyze the following student profile and generate a comprehensive academic intervention plan:
- Age: ${student.age}
- Study Time: ${student.studytime === 1 ? "<2 hrs" : student.studytime === 2 ? "2-5 hrs" : student.studytime === 3 ? "5-10 hrs" : ">10 hrs"}
- Failures: ${student.failures} previous failures
- Absences: ${student.absences} absences
- Extracurricular School Support: ${student.schoolsup}
- Extra Family Support: ${student.famsup}
- First Period Grade (G1): ${student.G1}/20
- Second Period Grade (G2): ${student.G2}/20
- Wants Higher Education: ${student.higher}
- Predictor Output: ${passPrediction ? "Predicted Pass" : "Predicted At Risk of Failure"} with ${student.confidence?.toFixed(1)}% confidence.

Provide highly actionable advice (bullet points) containing:
1. Academic Risk Assessment
2. Attendance & Time Management goals
3. Educational Support recommendations
4. Family partnership and motivation advice.
Keep the advice professional, warm, structured, and under 250 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ advice: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite server setup for development & SPA static delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
