import whisper
from transformers import pipeline

whisper_model = whisper.load_model("base") 

def speech_to_text(audio_path):
    result = whisper_model.transcribe(audio_path)
    return result["text"]


def detect_fake_news(text):
    model = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    candidate_labels = ["real", "fake"]
    result = model(text, candidate_labels)
    
    if result['scores'][0] > result['scores'][1]:
        return "real"  
    else:
        return "fake" 

def main(audio_path):

    print("Converting speech to text...")
    text = speech_to_text(audio_path)
    print(f"Transcribed Text: {text}")

    print("Checking if the news is fake or real...")
    result = detect_fake_news(text)
    print(f"The news is: {result}")

audio_path = "news verification/test audio/fake news 3.mp3"

main(audio_path)
