import numpy as np
import librosa
import joblib

# Load the saved model, scaler, and label encoder
rf_model = joblib.load('ML/taitil/Models/Random Forest/rf_model.pkl')
scaler = joblib.load('ML/taitil/Models/Random Forest/scaler.pkl')
label_encoder = joblib.load('ML/taitil/Models/Random Forest/label_encoder.pkl')

# Function to extract features from an audio file
def extract_features(audio_path):
    y, sr = librosa.load(audio_path, sr=None)
    
    # Extract chroma_stft
    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr).mean()
    
    # Extract rms
    rms = librosa.feature.rms(y=y).mean()
    
    # Extract spectral_centroid
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    
    # Extract spectral_bandwidth
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr).mean()
    
    # Extract rolloff
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr).mean()
    
    # Extract zero_crossing_rate
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y=y).mean()
    
    # Extract MFCCs (first 20 coefficients)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mfccs_mean = np.mean(mfccs, axis=1)
    
    # Combine all features into a single feature vector
    features = np.hstack([chroma_stft, rms, spectral_centroid, spectral_bandwidth,
                          rolloff, zero_crossing_rate, mfccs_mean])
    
    return features

# Predict whether the audio file is real or fake
def predict_audio(audio_path):
    # Extract features from the provided audio file
    features = extract_features(audio_path).reshape(1, -1)
    
    # Standardize the features
    features_scaled = scaler.transform(features)
    
    # Make a prediction using the Random Forest model
    prediction = rf_model.predict(features_scaled)
    
    # Decode the prediction to original label
    label = label_encoder.inverse_transform(prediction)
    
    return label[0]  # Returns either 'REAL' or 'FAKE'

# Example usage
audio_file = input("Enter the path to the audio file: ")
prediction = predict_audio(audio_file)

print(f"The audio is predicted to be: {prediction}")
