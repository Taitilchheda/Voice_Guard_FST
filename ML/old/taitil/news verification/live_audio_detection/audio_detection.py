import os
import numpy as np
import librosa
import tensorflow as tf
import yt_dlp

def download_audio_from_youtube(youtube_url, output_path="audio_temp"):
    """
    Downloads the audio from the YouTube video and converts it to .wav format using yt-dlp.
    """
    # Ensure the output directory exists
    os.makedirs(output_path, exist_ok=True)

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(output_path, 'audio.%(ext)s'),
    }

    # Download the audio from YouTube
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(youtube_url, download=True)
        audio_filename = ydl.prepare_filename(info_dict)
        
        # Rename to ensure .wav extension
        base, _ = os.path.splitext(audio_filename)
        wav_filename = base + '.wav'
        
        print(f"Audio downloaded and converted to WAV format at {wav_filename}")
        return wav_filename

def extract_features_from_audio(audio_file, n_mfcc=26):
    """
    Extract MFCC features from the audio file.
    Allows specifying the number of MFCCs to match model input.
    """
    y, sr = librosa.load(audio_file, sr=None)  # Load audio file
    
    # Extract MFCCs with specified number
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    
    # Take mean across time frames to get a fixed-length feature vector
    mfcc_processed = np.mean(mfcc, axis=1)
    
    return mfcc_processed

def inspect_model(model_path):
    """
    Comprehensive model inspection function
    """
    try:
        # Try loading the model using different methods
        print("Attempting to load model...")
        
        # Method 1: Standard Keras load_model
        try:
            model = tf.keras.models.load_model(model_path)
            print("\n--- Model Loaded Successfully ---")
            
            # Print model summary
            model.summary()
            
            # Print input and output shapes
            print("\nModel Input Shape:", model.input_shape)
            print("Model Output Shape:", model.output_shape)
            
            # Check model configuration
            print("\n--- Model Configuration ---")
            config = model.get_config()
            print(config)
            
            return model
        
        except Exception as e:
            print(f"Standard load_model failed: {e}")
        
        # Method 2: Custom loading
        try:
            with tf.keras.utils.custom_object_scope({}):
                model = tf.keras.models.load_model(model_path)
            print("\n--- Model Loaded with Custom Objects ---")
            model.summary()
            return model
        
        except Exception as e:
            print(f"Custom load_model failed: {e}")
        
    except Exception as e:
        print(f"Model inspection failed: {e}")
    
    return None

def process_video(youtube_url, model):
    """
    Download and process the YouTube video, then classify the audio as real or fake.
    """
    try:
        # Download and extract audio
        audio_path = download_audio_from_youtube(youtube_url)

        # Extract features from the audio
        features = extract_features_from_audio(audio_path, n_mfcc=26)
        print("Features shape:", features.shape)
        
        # Reshape to match model input expectations
        features_reshaped = features.reshape(1, -1)
        
        # Classify audio
        prediction = model.predict(features_reshaped)
        print(f"The audio in the video is: {'REAL' if prediction[0] > 0.5 else 'FAKE'}")
        
        # Optional: Clean up downloaded audio file
        os.remove(audio_path)
    
    except Exception as e:
        print(f"An error occurred: {e}")

# Main execution function
if __name__ == "__main__":
    # Inspect the model first
    model_path = 'news verification/vansh/audio_model.h5'
    model = inspect_model(model_path)
    
    if model:
        # Example: Process a YouTube video link
        youtube_url = input("Enter YouTube video URL: ")
        process_video(youtube_url, model)
    else:
        print("Failed to load the model. Please check the model file.") 