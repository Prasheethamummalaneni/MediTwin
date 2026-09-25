from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# Training data
training_texts = [
    "blood hemoglobin glucose cholesterol laboratory test",
    "blood test laboratory report platelet count",

    "take tablet medicine dosage prescription",
    "doctor prescribed medicine tablet capsule",

    "patient diagnosed with diabetes hypertension disease",
    "diagnosis medical condition treatment",

    "x ray scan MRI ultrasound imaging",
    "radiology CT scan imaging report"
]


# Corresponding categories
training_labels = [
    "Lab Report",
    "Lab Report",

    "Prescription",
    "Prescription",

    "Diagnosis",
    "Diagnosis",

    "Imaging",
    "Imaging"
]


# Convert text into TF-IDF features
vectorizer = TfidfVectorizer()

X = vectorizer.fit_transform(training_texts)


# Train Logistic Regression classifier
classifier = LogisticRegression()

classifier.fit(X, training_labels)


def categorize_document(text: str) -> str:

    # If no text was extracted
    if not text.strip():
        return "Other"

    # Convert document text into TF-IDF vector
    vector = vectorizer.transform([text])

    # Predict category
    return classifier.predict(vector)[0]