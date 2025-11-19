import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# Load the CSV dataset
df = pd.read_csv("news verification/vansh/audio_features.csv")

# Extract features (X) and labels (y)
X = df.drop(columns=['LABEL', 'FILE_PATH'])  # Drop the LABEL and FILE_PATH columns
y = df['LABEL']

# Encode labels (REAL -> 0, FAKE -> 1)
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Standardize the features for better performance with any model (SVM or Random Forest)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

# Handling Class Imbalance with class weights in Random Forest
rf_model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)

# You can also tune hyperparameters using GridSearchCV if desired
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2]
}

grid_search = GridSearchCV(rf_model, param_grid, cv=5, verbose=1, n_jobs=-1)
grid_search.fit(X_train, y_train)

# Get the best model from grid search
best_rf_model = grid_search.best_estimator_

# Test the model
y_pred = best_rf_model.predict(X_test)

# Output classification report and confusion matrix
print("Classification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Save the trained model, scaler, and label encoder
joblib.dump(best_rf_model, 'rf_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(label_encoder, 'label_encoder.pkl')
