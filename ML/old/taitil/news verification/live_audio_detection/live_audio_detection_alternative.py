import os
import yt_dlp
import librosa
import numpy as np
from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification

# Function to download audio from YouTube using yt-dlp
def download_audio(youtube_url, download_path="downloads"):
    if not os.path.exists(download_path):
        os.makedirs(download_path)

    print(f"Downloading audio from {youtube_url}...")

    # Download the audio stream using yt-dlp
    ydl_opts = {
        'format': 'bestaudio/best',  # Get the best audio format available
        'extractaudio': True,  # Extract audio
        'outtmpl': os.path.join(download_path, 'audio.%(ext)s'),  # Output file template
        'postprocessors': [{
            'key': 'FFmpegAudioConvertor',  # Convert to desired audio format
            'preferredcodec': 'wav',  # Set desired codec to WAV
            'preferredquality': '192',  # Set desired quality
        }],
        'noplaylist': True,  # Do not download playlists, just the single video
        'quiet': False,  # Show logs to help troubleshoot
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])  # Start the download
    except Exception as e:
        print(f"Error downloading the audio: {e}")
        return None

    audio_path = os.path.join(download_path, 'audio.wav')
    print(f"Audio downloaded to {audio_path}")
    return audio_path


# Function to load pre-trained Wav2Vec2 model for classification
def load_model():
    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-xlsr-53")
    model = Wav2Vec2ForSequenceClassification.from_pretrained("facebook/wav2vec2-large-xlsr-53")
    return processor, model

# Function to predict deepfake (classification) from audio
def predict_audio_class(audio_path, processor, model):
    y, sr = librosa.load(audio_path, sr=16000)
    inputs = processor(y, sampling_rate=sr, return_tensors="pt", padding=True)

    with torch.no_grad():
        logits = model(**inputs).logits
        predictions = torch.argmax(logits, dim=-1)

    if predictions.item() == 1:
        print("The audio is likely a deepfake!")
    else:
        print("The audio seems normal.")

# Main function to integrate everything
def main(youtube_url):
    audio_path = download_audio(youtube_url)
    processor, model = load_model()
    predict_audio_class(audio_path, processor, model)

if __name__ == "__main__":
    youtube_url = input("Enter the YouTube URL: ")
    main(youtube_url)
