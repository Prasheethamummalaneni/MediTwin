import os
from pypdf import PdfReader


def extract_text(file_path: str) -> str:

    text = ""

    # TXT file
    if file_path.lower().endswith(".txt"):

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as f:

            text = f.read()


    # PDF file
    elif file_path.lower().endswith(".pdf"):

        try:

            reader = PdfReader(file_path)

            for page in reader.pages:

                extracted_text = page.extract_text()

                if extracted_text:
                    text += extracted_text

        except Exception:
            raise ValueError("Unable to read the PDF file.")


    return text