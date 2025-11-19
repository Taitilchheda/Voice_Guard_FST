import os
import librosa
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler

def extract_audio_features(audio_path):
    """
    Extract audio features from a single audio file
    """
    y, sr = librosa.load(audio_path, duration=3.0, sr=22050)
    
    features = {}
    try:
        # Compute STFT
        stft = librosa.stft(y)
        chroma = librosa.feature.chroma_stft(S=np.abs(stft), sr=sr)
        features['chroma_stft'] = np.mean(chroma)
        
        # Compute RMS energy
        features['rms'] = np.mean(librosa.feature.rms(y=y))
        
        # Compute spectral centroid and bandwidth
        features['spectral_centroid'] = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        features['spectral_bandwidth'] = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
        
        # Compute spectral rolloff
        features['rolloff'] = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
        
        # Compute zero crossing rate
        features['zero_crossing_rate'] = np.mean(librosa.feature.zero_crossing_rate(y))
        
        # Compute MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        for i in range(20):
            features[f'mfcc{i+1}'] = np.mean(mfccs[i])
            
    except Exception as e:
        print(f"Error processing {audio_path}: {str(e)}")
        return None
        
    return features

def predict_audio_class(audio_file_path):
    """
    Predict whether an audio file is REAL or FAKE based on its features.
    """
    # Load the trained SVM model
    model = joblib.load("svm_model.joblib")
    
    # Extract features from the given audio file
    features = extract_audio_features(audio_file_path)
    
    if features is None:
        print("Failed to extract features from the audio file.")
        return
    
    # Convert features to DataFrame for consistency
    features_df = pd.DataFrame([features])
    
    # Scale the features using StandardScaler
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features_df)
    
    # Make prediction using the trained SVM model
    prediction = model.predict(features_scaled)
    
    if prediction[0] == 1:
        print("The audio is REAL.")
    else:
        print("The audio is FAKE.")

def main():
    # Path to the audio file you want to predict
    audio_file_path = input("Please enter the path to the audio file: ")
    
    # Predict the class of the input audio
    predict_audio_class(audio_file_path)

if __name__ == "__main__":
    main()
