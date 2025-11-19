import pandas as pd
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import joblib
from sklearn.preprocessing import StandardScaler

# Load the CSV dataset
df = pd.read_csv("news verification/vansh/audio_features.csv")

# Extract features (X) and labels (y)
X = df.drop(columns=['LABEL', 'FILE_PATH'])  # Drop the LABEL and FILE_PATH columns
y = df['LABEL']


# Encode labels (REAL -> 0, FAKE -> 1)
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Standardize the features for better performance with SVM
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

# Train the SVM model
svm_model = SVC(kernel='linear')  # You can experiment with different kernels
svm_model.fit(X_train, y_train)

# Test the model
y_pred = svm_model.predict(X_test)

# Output classification report
print(classification_report(y_test, y_pred))

# Save the trained model and the scaler
joblib.dump(svm_model, 'svm_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(label_encoder, 'label_encoder.pkl')
