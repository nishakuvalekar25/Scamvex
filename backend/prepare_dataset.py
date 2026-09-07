import pandas as pd
from pathlib import Path

# Paths
input_file = Path("data/SMSSpamCollection")
output_file = Path("data/scamvex_dataset.csv")

# Read the original UCI dataset
df = pd.read_csv(
    input_file,
    sep="\t",
    header=None,
    names=["label", "message"],
    encoding="utf-8"
)

# Convert labels
df["label"] = df["label"].map({
    "ham": "legitimate",
    "spam": "scam"
})

# Remove missing values and duplicates
df = df.dropna()
df = df.drop_duplicates()

# Put message first
df = df[["message", "label"]]

# Save processed dataset
df.to_csv(output_file, index=False)

print("Dataset created successfully!")
print(f"Total messages: {len(df)}")
print("\nClass distribution:")
print(df["label"].value_counts())
print(f"\nSaved to: {output_file}")