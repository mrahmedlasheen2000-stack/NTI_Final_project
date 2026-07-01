# Student Pass/Fail ML Predictor

An interactive machine learning capstone project that predicts whether a student is likely to **pass** or be **at risk of failing** a mathematics course. The application combines exploratory data analysis, model comparison, live prediction, and academic support recommendations in a full-stack web dashboard.

> **Deployment note:** This version is built with **React + Vite + Express.js/Node.js**. If your course submission specifically requires **Streamlit or Flask**, add a Streamlit/Flask deployment version before final submission.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Dataset](#dataset)
- [Target Definition](#target-definition)
- [Main Features](#main-features)
- [Machine Learning Approach](#machine-learning-approach)
- [Model Results](#model-results)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation and Local Setup](#installation-and-local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [How to Use the Application](#how-to-use-the-application)
- [Screenshots](#screenshots)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Project Overview

**Student Pass/Fail ML Predictor** is an educational data-mining application designed to support early academic intervention. The system analyzes student demographic, social, academic, and behavioral attributes to classify each student into one of two categories:

- **Pass**: the student is predicted to achieve a final grade of 10 or higher.
- **Fail / At Risk**: the student is predicted to achieve a final grade below 10.

The project includes:

- An **EDA dashboard** for understanding the dataset.
- A **model studio** for training and comparing machine learning models.
- A **live prediction form** for testing custom student profiles.
- A **recommendation system** that provides academic advice after prediction.
- Optional **Gemini-powered academic advisor** support when a `GEMINI_API_KEY` is available.
- Built-in **presentation slides** and technical documentation inside the web app.

The goal is not only to build a classifier, but also to show how machine learning can be used responsibly as an early-warning tool for teachers, counselors, and academic advisors.

---

## Problem Statement

Student failure can lead to grade repetition, lower motivation, reduced confidence, and possible dropout risk. Schools often identify struggling students only after final exams, when intervention is already too late.

This project addresses the following question:

> Can we use student background, study habits, school support indicators, absences, and early grades to predict whether a student is at risk of failing?

The application helps educators:

- Detect at-risk students earlier.
- Compare different predictive modeling strategies.
- Understand which factors are associated with student performance.
- Generate support recommendations for students who need help.

---

## Dataset

The project uses the included dataset file:

```text
data/student-mat.csv
```

This is a student performance dataset for a mathematics course. The included CSV contains:

| Item | Value |
|---|---:|
| Total records | 346 students |
| Total columns | 33 original columns |
| Passing students | 241 |
| Failing students | 105 |
| Pass rate | 69.65% |
| Final grade range | 0 to 20 |

### Feature Groups

The dataset contains several types of variables:

| Group | Example Columns | Description |
|---|---|---|
| Demographic | `school`, `sex`, `age`, `address`, `famsize`, `Pstatus` | Student background and household context |
| Family/Education | `Medu`, `Fedu`, `Mjob`, `Fjob`, `guardian` | Parent education, jobs, and guardian information |
| Study Context | `traveltime`, `studytime`, `failures`, `schoolsup`, `famsup`, `paid` | Learning environment and academic support |
| Lifestyle | `activities`, `nursery`, `higher`, `internet`, `romantic` | Student activities and personal indicators |
| Social/Health | `famrel`, `freetime`, `goout`, `Dalc`, `Walc`, `health`, `absences` | Family relationship, free time, alcohol use, health, attendance |
| Grades | `G1`, `G2`, `G3` | First period, second period, and final grades |

---

## Target Definition

The original final grade column is `G3`, measured on a 0-20 scale. The project converts this into a binary classification target called `pass_fail`:

```text
pass_fail = 1 if G3 >= 10
pass_fail = 0 if G3 < 10
```

This means:

- `1` = Pass
- `0` = Fail / At Risk

The final grade `G3` is used only to create the target label and is not used as an input feature for prediction.

---

## Main Features

### 1. EDA Dashboard

The EDA dashboard loads the CSV file and displays key dataset statistics, including:

- Total number of students.
- Number of passing and failing students.
- Overall pass rate.
- Study time vs. pass/fail distribution.
- Previous failures vs. pass/fail distribution.
- Absence distribution.
- Correlation-style feature insights.
- Sample rows from the raw dataset.

### 2. Model Studio and Metrics

The Model Studio allows users to train and compare three models:

- Logistic Regression
- Decision Tree Classifier
- Random Forest Classifier

It supports two modeling modes:

| Mode | Description | Purpose |
|---|---|---|
| Option A: With Grades | Includes `G1` and `G2` as features | Higher accuracy, useful after early grades are available |
| Option B: Without Grades | Excludes `G1` and `G2` | Earlier prediction using non-grade features |

Users can configure:

- Test split ratio.
- Random seed.
- Whether to evaluate with or without early grades.

### 3. Live Predictor Form

The Live Predictor lets users enter a custom student profile and receive:

- Pass/fail prediction.
- Confidence score.
- Selected model name.
- Recommendation message.

The form supports inputs such as:

- Age
- Study time
- Previous failures
- Absences
- First and second period grades
- School support
- Family support
- Internet access
- Higher education intention

### 4. Academic Advisor Recommendation

The backend includes an `/api/advisor` endpoint. If a Gemini API key is available, the system generates a customized academic intervention plan. If no key is available, the app returns a local safe-mode recommendation.

### 5. Built-in Presentation and Documentation

The app includes tabs for:

- Capstone presentation slides.
- Technical documentation and replication guide.

These are useful for a live demo or project defense.

---

## Machine Learning Approach

The machine learning pipeline is implemented in TypeScript inside:

```text
src/utils/mlEngine.ts
```

### Preprocessing Steps

1. **Target creation**
   - Creates `pass_fail` from `G3`.

2. **Feature selection**
   - Uses demographic, academic, support, lifestyle, and behavioral features.
   - Optionally includes or excludes `G1` and `G2`.

3. **One-hot encoding**
   - Converts categorical variables into binary indicator columns.
   - Examples: `school`, `sex`, `Mjob`, `Fjob`, `reason`, `guardian`.

4. **Binary yes/no encoding**
   - Converts yes/no fields to numerical features.
   - Examples: `schoolsup`, `famsup`, `paid`, `activities`, `nursery`, `higher`, `internet`, `romantic`.

5. **Min-max scaling**
   - Scales continuous/numeric columns into the `[0, 1]` range.

6. **Stratified train/test split**
   - Splits pass and fail classes proportionally to preserve class balance.

### Models Implemented

#### Logistic Regression

A custom logistic regression classifier trained with iterative gradient updates. It predicts the probability of passing using the sigmoid function:

```text
P(y = 1 | x) = 1 / (1 + e^-(w.x + b))
```

#### Decision Tree Classifier

A custom decision tree classifier that recursively selects feature thresholds using entropy and information gain.

#### Random Forest Classifier

A custom random forest made of multiple decision trees trained on bootstrap samples. The final prediction is based on majority voting across trees.

---

## Model Results

The following results were produced using the default settings:

- Test ratio: `0.2`
- Random seed: `42`
- Training size: `277`
- Testing size: `69`

### Option A: With G1 and G2 Grades

| Model | Accuracy | Precision | Recall | F1 Score | Confusion Matrix |
|---|---:|---:|---:|---:|---|
| Logistic Regression | 91.30% | 97.73% | 89.58% | 93.48% | TP=43, FP=1, FN=5, TN=20 |
| Decision Tree | 92.75% | 97.78% | 91.67% | 94.62% | TP=44, FP=1, FN=4, TN=20 |
| Random Forest | 94.20% | 95.83% | 95.83% | 95.83% | TP=46, FP=2, FN=2, TN=19 |

### Option B: Without G1 and G2 Grades

| Model | Accuracy | Precision | Recall | F1 Score | Confusion Matrix |
|---|---:|---:|---:|---:|---|
| Logistic Regression | 59.42% | 81.25% | 54.17% | 65.00% | TP=26, FP=6, FN=22, TN=15 |
| Decision Tree | 73.91% | 75.00% | 93.75% | 83.33% | TP=45, FP=15, FN=3, TN=6 |
| Random Forest | 73.91% | 75.00% | 93.75% | 83.33% | TP=45, FP=15, FN=3, TN=6 |

### Interpretation

- Models perform best when `G1` and `G2` are included because early grades are strongly related to final grade.
- The no-grade mode is more useful for early intervention because it can be used before exam grades are available.
- Random Forest performs strongly overall because it reduces the instability of a single decision tree.
- Recall is especially important for this project because missing an at-risk student is more harmful than incorrectly flagging a student for support.

---

## System Architecture

```text
React UI
  |
  | fetch requests
  v
Express.js API Server
  |
  | reads CSV and calls ML engine
  v
TypeScript ML Engine
  |
  | preprocesses data, trains models, evaluates/predicts
  v
JSON response back to React dashboard
```

### Application Flow

1. User opens the web dashboard.
2. React requests dataset statistics from the backend.
3. Express reads `data/student-mat.csv`.
4. The ML engine preprocesses features and labels.
5. Models are trained and evaluated when requested.
6. User enters a custom student profile.
7. Backend trains the selected model and returns a prediction.
8. App displays prediction, confidence, and academic recommendation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite 6 |
| Backend | Express.js / Node.js |
| Language | TypeScript |
| Styling | Tailwind CSS classes / custom CSS |
| Icons | lucide-react |
| Animation | motion |
| AI Advisor | Google GenAI SDK / Gemini API |
| Dataset Storage | Local CSV file |
| ML Implementation | Custom TypeScript classes |

---

## Project Structure

```text
student-pass_fail-ml-predictor/
├── data/
│   └── student-mat.csv
├── src/
│   ├── components/
│   │   ├── DocumentationView.tsx
│   │   ├── EDADashboard.tsx
│   │   ├── LivePredictor.tsx
│   │   ├── ModelStudio.tsx
│   │   └── PresentationSlides.tsx
│   ├── utils/
│   │   └── mlEngine.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

### Important Files

| File | Purpose |
|---|---|
| `server.ts` | Express backend, API routes, CSV loading, training/prediction endpoints |
| `src/utils/mlEngine.ts` | Preprocessing, train/test split, model classes, evaluation metrics |
| `src/App.tsx` | Main React app layout and tab navigation |
| `src/components/EDADashboard.tsx` | Exploratory data analysis dashboard |
| `src/components/ModelStudio.tsx` | Model training and evaluation interface |
| `src/components/LivePredictor.tsx` | User input form for custom prediction |
| `src/components/PresentationSlides.tsx` | In-app capstone presentation slides |
| `src/components/DocumentationView.tsx` | Technical documentation and replication guide |
| `data/student-mat.csv` | Student performance dataset |

---

## Installation and Local Setup

### Prerequisites

Install the following before running the project:

- Node.js 20 or later recommended
- npm
- Git

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd student-pass_fail-ml-predictor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development Mode

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
```

### 5. Run Production Build

```bash
npm run start
```

The production app also runs at:

```text
http://localhost:3000
```

---

## Environment Variables

The application can run without environment variables. Without a Gemini key, the advisor endpoint returns a local safe-mode recommendation.

Optional variable:

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No | Enables Gemini-generated academic advisor recommendations |

Example shell usage:

```bash
export GEMINI_API_KEY="your_api_key_here"
npm run dev
```

On Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="your_api_key_here"
npm run dev
```

> Note: The repository includes `.env.example`, but the current server reads `process.env.GEMINI_API_KEY`. If you want automatic `.env` loading, add `import "dotenv/config";` at the top of `server.ts`.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Starts the Express server with Vite middleware |
| Build | `npm run build` | Builds the React frontend and bundles the Express server |
| Start | `npm run start` | Runs the production server from `dist/server.cjs` |
| Type Check | `npm run lint` | Runs TypeScript checking with `tsc --noEmit` |
| Clean | `npm run clean` | Removes generated build output |

---

## API Endpoints

The backend runs on port `3000` and exposes the following API routes.

### 1. Get Dataset Summary

```http
GET /api/dataset
```

Returns:

- Summary counts
- Pass/fail totals
- Study time distribution
- Previous failures distribution
- Absence histogram
- Correlation-style insights
- Sample dataset rows

Example:

```bash
curl http://localhost:3000/api/dataset
```

---

### 2. Train and Compare Models

```http
POST /api/train
```

Example request body:

```json
{
  "testRatio": 0.2,
  "randomSeed": 42
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/train \
  -H "Content-Type: application/json" \
  -d '{"testRatio":0.2,"randomSeed":42}'
```

Returns evaluation metrics for:

- Logistic Regression
- Decision Tree
- Random Forest

Each model is evaluated in two modes:

- With `G1` and `G2`
- Without `G1` and `G2`

---

### 3. Predict a Custom Student Profile

```http
POST /api/predict
```

Example request body:

```json
{
  "model": "Random Forest",
  "useGrades": true,
  "age": 17,
  "studytime": 2,
  "failures": 0,
  "absences": 4,
  "G1": 10,
  "G2": 11,
  "schoolsup": "no",
  "famsup": "yes",
  "higher": "yes",
  "internet": "yes"
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"model":"Random Forest","useGrades":true,"age":17,"studytime":2,"failures":0,"absences":4,"G1":10,"G2":11,"schoolsup":"no","famsup":"yes","higher":"yes","internet":"yes"}'
```

Returns:

```json
{
  "prediction": 1,
  "confidence": 86.67,
  "includeGrades": true,
  "modelUsed": "Random Forest",
  "recommendation": "..."
}
```

---

### 4. Get Academic Advisor Advice

```http
POST /api/advisor
```

This endpoint returns either:

- Gemini-generated academic advice, if `GEMINI_API_KEY` is configured.
- Local fallback advice, if no API key is configured.

---

## How to Use the Application

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Go to **EDA Dashboard** to review the dataset.
4. Go to **Model Studio & Metrics**.
5. Choose the test ratio and random seed.
6. Click the training button to compare models.
7. Review accuracy, precision, recall, F1 score, and confusion matrix.
8. Go to **Live Predictor Form**.
9. Enter a student profile.
10. Select the model and choose whether to include early grades.
11. Generate the prediction and read the recommendation.
12. Use the slides tab for presentation/demo support.

---

## Screenshots

Add screenshots here after running the project locally.

Suggested screenshots:

```text
assets/screenshots/eda-dashboard.png
assets/screenshots/model-studio.png
assets/screenshots/live-predictor.png
assets/screenshots/presentation-slides.png
```

Example Markdown:

```markdown
![EDA Dashboard](assets/screenshots/eda-dashboard.png)
![Model Studio](assets/screenshots/model-studio.png)
![Live Predictor](assets/screenshots/live-predictor.png)
```

---

## Limitations

- The included CSV has 346 rows, which is a relatively small dataset for real-world deployment.
- The project currently uses a local CSV file instead of a database.
- The ML models are implemented from scratch for educational purposes, not optimized like production ML libraries.
- Min-max scaling is currently applied before the train/test split, which may introduce data leakage. A stricter approach would fit scaling parameters on the training set only and apply them to the test set.
- The `/api/predict` endpoint retrains a model each time a prediction is requested. A production system should train once, save the model, and reuse it.
- Tree confidence values are simplified, especially for the Decision Tree model.
- Predictions should support educators, not replace professional judgment.
- The app currently uses React + Express. If the submission rubric requires Streamlit or Flask, a Python deployment version should be added.

---

## Future Improvements

Recommended improvements include:

- Add a Flask or Streamlit version for rubric-compliant local deployment.
- Add k-fold cross-validation for more reliable evaluation.
- Save trained models instead of retraining on every prediction request.
- Fit preprocessing/scaling on the training set only to avoid leakage.
- Add unit tests for preprocessing, model training, and API endpoints.
- Add charts using a dedicated charting library.
- Add downloadable model reports.
- Add role-based dashboards for teachers and advisors.
- Add support for uploading a new CSV dataset.
- Add fairness and bias analysis across demographic groups.
- Replace hard-coded correlation values with dynamically calculated correlations.
- Update the in-app slides if the dataset row count changes.

---

## Ethical Considerations

This system should be used as a decision-support tool, not as the only basis for academic decisions. A prediction of failure should trigger support, counseling, tutoring, and family communication. It should not be used to punish students or limit opportunities.

Important responsible-use principles:

- Keep student data private.
- Explain predictions clearly.
- Allow educators to override or contextualize predictions.
- Monitor bias across demographic groups.
- Use predictions to provide help, not to label students permanently.

---

## Author

**Name:** `<your name>`  
**Course:** `<course name>`  
**Capstone Project:** Student Pass/Fail ML Predictor  
**GitHub Repository:** `<your public GitHub repository link>`  
**LinkedIn Post:** `<your LinkedIn project post link>`

---

## Acknowledgment

This project was built as a machine learning capstone project to demonstrate data analysis, preprocessing, classical machine learning, model evaluation, and local web deployment through an interactive dashboard.