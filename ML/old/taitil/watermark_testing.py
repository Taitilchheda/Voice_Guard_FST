import subprocess

def test_watermark_survival(file_path, file_reader, wavmark, model, device, original_payload):
    """
    Test the robustness of a watermark after MP3 compression.

    Parameters:
        file_path (str): Path to the original audio file.
        file_reader (object): Object for reading audio files.
        wavmark (object): Watermarking module with decode functionality.
        model (object): The model used for decoding the watermark.
        device (str): The device to perform decoding on (e.g., 'cpu' or 'cuda').
        original_payload (numpy.array): The original payload to compare after decoding.
    """
    print("\nTesting robustness after MP3 compression...")

    # Paths for compressed MP3 and WAV files
    mp3_path = "compressed.mp3"
    wav_path = "compressed.wav"

    try:
        # Step 1: Simulate MP3 compression
        subprocess.run(["ffmpeg", "-i", file_path, "-b:a", "128k", mp3_path], check=True)
        subprocess.run(["ffmpeg", "-i", mp3_path, wav_path], check=True)

        # Step 2: Decode from compressed audio (WAV)
        compressed_signal = file_reader.read_as_single_channel(wav_path)
        decoded_payload, _ = wavmark.decode_watermark(
            model, compressed_signal, device=device
        )

        # Step 3: Calculate Bit Error Rate (BER)
        ber = (original_payload != decoded_payload).mean() * 100

        # Print the results
        print(f"After MP3 compression:")
        print(f"Decoded payload: {decoded_payload}")
        print(f"Bit Error Rate (BER): {ber:.1f}%")
    
    except subprocess.CalledProcessError as e:
        print(f"Error during MP3 compression: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
