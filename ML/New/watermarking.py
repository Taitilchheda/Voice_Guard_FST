import wave
import numpy as np
import pydub
import os
import pandas as pd

# Convert audio files to WAV format using pydub if they're not WAV
def convert_to_wav(audio_file):
    """
    Converts MP3 or FLAC to WAV format using pydub for easy processing.
    """
    audio = pydub.AudioSegment.from_file(audio_file)
    wav_file = audio_file.replace(os.path.splitext(audio_file)[1], ".wav")
    audio.export(wav_file, format="wav")
    return wav_file

# Embed watermark into audio file
def embed_watermark(audio_file, unique_hex_code, weight=0.01):
    """
    Embed the unique hex watermark into an audio file with minimal distortion.
    """
    # Convert to WAV format if it's not already in WAV
    if not audio_file.lower().endswith('.wav'):
        audio_file = convert_to_wav(audio_file)

    # Open the WAV file
    with wave.open(audio_file, 'rb') as wav:
        params = wav.getparams()
        frames = wav.readframes(params.nframes)
        samples = np.frombuffer(frames, dtype=np.int16)

    # Convert the unique hex code to a binary string
    watermark_bin = bin(int(unique_hex_code, 16))[2:].zfill(len(unique_hex_code) * 4)  # 4 bits per hex digit

    # Embed the watermark into the least significant bit of the samples
    watermark_index = 0
    for i in range(len(samples)):
        if watermark_index < len(watermark_bin):
            # Extract watermark bit
            bit = int(watermark_bin[watermark_index])

            # Modify the least significant bit (LSB)
            samples[i] = (samples[i] & 0xFFFE) | bit  # Set LSB to watermark bit

            # Increment watermark bit index
            watermark_index += 1

        # Apply a small weight to minimize the impact on quality
        samples[i] += int(samples[i] * weight)

    # Ensure the samples are within the valid range for audio data
    samples = np.clip(samples, -32768, 32767)

    # Write the watermarked audio to a new file
    return samples, params

# Process CSV data and apply watermarking to audio files
def process_csv(csv_file, real_folder, fake_folder, output_folder):
    """
    Read the CSV file, map the audio files to respective folders (real or fake),
    apply watermarking, and update the CSV with the watermarked file path.
    """
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(csv_file)

    # Prepare to update the CSV with the new watermarked file path
    watermark_file_paths = []

    # Iterate through the rows and process each file
    for index, row in df.iterrows():
        unique_hex_code = row['unique_hex_code']  # Hex code for watermark
        audio_file_name = row['audio_file_name']  # The actual file name
        label = row['label']  # 'real' or 'fake' label

        # Determine the file path based on the label
        if label == 'real':
            folder = real_folder
        elif label == 'fake':
            folder = fake_folder
        else:
            print(f"Unknown label '{label}' for {audio_file_name}. Skipping...")
            continue

        # Full path to the audio file
        audio_file_path = os.path.join(folder, audio_file_name)

        # Check if the audio file exists
        if os.path.exists(audio_file_path):
            print(f"Embedding watermark for {audio_file_name} (Label: {label}) with unique code {unique_hex_code}")
            try:
                # Call embed watermark function and get the watermarked samples and params
                samples, params = embed_watermark(audio_file_path, unique_hex_code)

                # Save the watermarked audio to the output folder
                watermarked_file_name = audio_file_name.replace(".wav", "_watermarked.wav")
                watermarked_file_path = os.path.join(output_folder, watermarked_file_name)

                with wave.open(watermarked_file_path, 'wb') as out_wav:
                    out_wav.setparams(params)
                    out_wav.writeframes(samples.tobytes())

                print(f"Watermarked audio saved to: {watermarked_file_path}")
                watermark_file_paths.append(watermarked_file_path)
            except Exception as e:
                print(f"Error processing {audio_file_name}: {e}")
                watermark_file_paths.append(None)
        else:
            print(f"Error: File {audio_file_path} not found in the directory.")
            watermark_file_paths.append(None)

    # Update the CSV with the new column for watermark file paths
    df['watermarked_file_path'] = watermark_file_paths

    # Save the updated DataFrame back to CSV
    df.to_csv(csv_file, index=False)
    print(f"CSV updated with watermark details. Saved to {csv_file}")

# Example usage of the process_csv function
real_folder = 'ML/New/Data/REAL'  # Folder containing real audio files
fake_folder = 'ML/New/Data/FAKE'  # Folder containing fake audio files
output_folder = 'watermarked_files'  # Folder to store the watermarked files

# Ensure the output folder exists
os.makedirs(output_folder, exist_ok=True)

# Replace with your actual CSV file path
process_csv('ML/New/updated_deepfake_audio_data.csv', real_folder, fake_folder, output_folder)
