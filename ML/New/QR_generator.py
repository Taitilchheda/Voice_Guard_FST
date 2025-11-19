import qrcode
import os
import pandas as pd

# Function to generate and save QR code based on unique_hex_code
def generate_qr(unique_hex_code, output_folder):
    """
    Generates a QR code for a given unique_hex_code and saves it to the specified folder.
    """
    # Create the QR code from the unique_hex_code
    qr = qrcode.QRCode(
        version=1,  # version defines the size of the QR code
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(unique_hex_code)
    qr.make(fit=True)

    # Create an image from the QR code
    img = qr.make_image(fill='black', back_color='white')

    # Generate the file path for saving the image
    qr_image_path = os.path.join(output_folder, f"{unique_hex_code}.png")
    img.save(qr_image_path)
    return qr_image_path

# Function to process the CSV and generate QR codes
def process_csv_and_generate_qr(csv_file, output_folder):
    """
    Reads the CSV file, generates QR codes for each unique_hex_code, and updates the CSV with the QR image paths.
    """
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(csv_file)

    # Create the QR_images folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Prepare to update the CSV with the new QR code image paths
    qr_image_paths = []

    # Iterate through the rows and generate QR codes for each unique_hex_code
    for index, row in df.iterrows():
        unique_hex_code = row['unique_hex_code']  # Hex code for QR
        print(f"Generating QR for unique_hex_code: {unique_hex_code}")

        try:
            # Generate the QR code and get the image path
            qr_image_path = generate_qr(unique_hex_code, output_folder)
            qr_image_paths.append(qr_image_path)  # Add the path to the list
        except Exception as e:
            print(f"Error generating QR for {unique_hex_code}: {e}")
            qr_image_paths.append(None)

    # Update the CSV with the new column for QR image paths
    df['qr_image_path'] = qr_image_paths

    # Save the updated DataFrame back to CSV
    df.to_csv(csv_file, index=False)
    print(f"CSV updated with QR image paths. Saved to {csv_file}")

# Example usage
output_folder = 'QR_images'  # Folder to store QR images

# Replace with your actual CSV file path
process_csv_and_generate_qr('ML/New/updated_deepfake_audio_data.csv', output_folder)
