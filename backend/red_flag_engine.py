import re

RED_FLAG_PATTERNS = {
    "Urgent language": [
        "urgent",
        "immediately",
        "act now",
        "act immediately",
        "within 24 hours",
        "limited time",
        "hurry",
        "right now",
    ],

    "Financial request": [
        "pay",
        "payment",
        "transfer money",
        "send money",
        "bank details",
        "credit card",
        "debit card",
        "account number",
        "upi",
    ],

    "Personal information request": [
        "password",
        "otp",
        "pin",
        "cvv",
        "verify your details",
        "verify your identity",
        "personal information",
        "share your details",
    ],

    "Prize or reward claim": [
        "you won",
        "winner",
        "congratulations",
        "prize",
        "lottery",
        "reward",
        "cash prize",
        "free gift",
    ],

    "Account threat": [
        "account will be blocked",
        "account blocked",
        "account suspended",
        "account will be closed",
        "verify your account",
        "security alert",
    ],

    "Suspicious link": [
        "click here",
        "click the link",
        "open this link",
        "verify using this link",
        "click below",
    ],

    "Banking-related content": [
        "bank account",
        "bank",
        "net banking",
        "online banking",
        "banking",
    ],
}

def detect_red_flags(message):
    """
    Detect suspicious patterns in a message.

    Returns a list of detected red flags.
    """

    message = message.lower()

    detected_flags = []

    for category, patterns in RED_FLAG_PATTERNS.items():

        for pattern in patterns:

            if pattern in message:
                detected_flags.append(category)
                break

    # Detect URLs
    url_pattern = r"https?://\S+|www\.\S+"

    if re.search(url_pattern, message):
        detected_flags.append("Contains a URL")

    return detected_flags


if __name__ == "__main__":

    test_message = """
    URGENT! Your bank account will be blocked.
    Verify your details immediately using this link:
    https://example.com
    """

    flags = detect_red_flags(test_message)

    print("Detected Red Flags:")

    for flag in flags:
        print("✓", flag)