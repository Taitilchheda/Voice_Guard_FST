import os
import librosa
import numpy as np
import pandas as pd

def extract_audio_features(audio_path):
    """
    Extract audio features from a single audio file.
    :param audio_path: Path to the audio file.
    :return: Dictionary with audio features.
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

def generate_csv(real_folder, fake_folder, output_csv_path):
    """
    Generate CSV file with audio features for real and fake audio files.
    :param real_folder: Path to the folder with REAL audio files.
    :param fake_folder: Path to the folder with FAKE audio files.
    :param output_csv_path: Path to save the output CSV file.
    """
    data = []

    # Process REAL files
    for filename in os.listdir(real_folder):
        if filename.endswith(".wav"):
            audio_path = os.path.join(real_folder, filename)
            features = extract_audio_features(audio_path)
            if features:
                features['LABEL'] = 'REAL'
                features['FILE_PATH'] = audio_path
                data.append(features)
    
    # Process FAKE files
    for filename in os.listdir(fake_folder):
        if filename.endswith(".wav"):
            audio_path = os.path.join(fake_folder, filename)
            features = extract_audio_features(audio_path)
            if features:
                features['LABEL'] = 'FAKE'
                features['FILE_PATH'] = audio_path
                data.append(features)
    
    # Convert list of dictionaries to a DataFrame
    df = pd.DataFrame(data)
    
    # Check if 'LABEL' and 'FILE_PATH' columns are present
    if 'LABEL' not in df.columns or 'FILE_PATH' not in df.columns:
        print("Error: Missing 'LABEL' or 'FILE_PATH' column")
        return
    
    # Save the DataFrame to CSV
    df.to_csv(output_csv_path, index=False)
    print(f"CSV file saved to {output_csv_path}")

def main():
    # Define paths to the REAL and FAKE audio folders
    real_folder = "ML/generated/real_audio_files"  # Replace with your REAL audio files folder
    fake_folder = "ML/generated/fake_audio_files"  # Replace with your FAKE audio files folder
    
    # Define the output CSV file path
    output_csv_path = "audio_features.csv"  # This is the name of the CSV file to save
    
    # Generate the CSV file
    generate_csv(real_folder, fake_folder, output_csv_path)

if __name__ == "__main__":
    main()
