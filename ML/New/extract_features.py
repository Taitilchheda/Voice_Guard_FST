import os
import numpy as np
import pandas as pd
import librosa
from tqdm import tqdm

def extract_audio_features(audio_path):
    """
    Extract audio features from a single audio file
    """
    # Load audio file
    y, sr = librosa.load(audio_path, duration=3.0, sr=22050)
    
    # Initialize feature dictionary
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

def process_dataset(real_dir, fake_dir, output_csv):
    """
    Process all audio files and create a CSV dataset
    """
    # Initialize lists to store data
    all_features = []
    labels = []
    file_paths = []
    
    # Process REAL audio files
    print("Processing REAL audio files...")
    for filename in tqdm(os.listdir(real_dir)):
        if filename.endswith('.wav'):
            file_path = os.path.join(real_dir, filename)
            features = extract_audio_features(file_path)
            
            if features is not None:
                all_features.append(features)
                labels.append("REAL")
                file_paths.append(file_path)
    
    # Process FAKE audio files
    print("Processing FAKE audio files...")
    for filename in tqdm(os.listdir(fake_dir)):
        if filename.endswith('.wav'):
            file_path = os.path.join(fake_dir, filename)
            features = extract_audio_features(file_path)
            
            if features is not None:
                all_features.append(features)
                labels.append("FAKE")
                file_paths.append(file_path)
    
    # Create DataFrame
    df = pd.DataFrame(all_features)
    df['LABEL'] = labels
    df['FILE_PATH'] = file_paths
    
    # Save to CSV
    df.to_csv(output_csv, index=False)
    print(f"Dataset saved to {output_csv}")
    
    # Print feature statistics
    print("\nFeature Statistics:")
    print(df.describe())
    
    # Print class distribution
    print("\nClass Distribution:")
    print(df['LABEL'].value_counts())

# Usage
if __name__ == "_main_":
    # Define paths
    real_dir = "dataset/REAL"
    fake_dir = "dataset/FAKE"
    output_csv = "dataset/csv/audio_features.csv"
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    
    # Process the dataset
    process_dataset(real_dir, fake_dir, output_csv)