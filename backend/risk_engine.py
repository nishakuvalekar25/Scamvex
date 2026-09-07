
def calculate_risk_score(scam_probability, red_flags):
    """
    Calculate final scam risk score.

    The score combines:
    1. ML model probability
    2. Severity of detected red flags
    """

    # Convert ML probability to percentage
    ml_score = scam_probability * 100

    # Weight of each suspicious indicator
    flag_weights = {
        "Urgent language": 8,
        "Account threat": 12,
        "Financial request": 15,
        "Personal information request": 15,
        "Prize or reward claim": 12,
        "Suspicious link": 15,
        "Contains a URL": 10
    }

    # Calculate total red-flag score
    flag_score = sum(
        flag_weights.get(flag, 5)
        for flag in red_flags
    )

    # Maximum contribution from red flags
    flag_score = min(flag_score, 40)

    # Convert red-flag score to percentage
    flag_percentage = (flag_score / 40) * 100

    # Combine ML + red flags
    risk_score = (
        (ml_score * 0.6) +
        (flag_percentage * 0.4)
    )

    # Keep between 0 and 100
    risk_score = max(0, min(100, risk_score))

    return round(risk_score, 2)



def get_risk_level(risk_score):

    if risk_score >= 70:
        return "HIGH"

    elif risk_score >= 40:
        return "MEDIUM"

    else:
        return "LOW"
    


def detect_category(message):

    message = message.lower()

    if any(word in message for word in [
        "bank",
        "account",
        "otp",
        "cvv",
        "credit card",
        "debit card"
    ]):
        return "Banking / Phishing Scam"

    if any(word in message for word in [
        "job",
        "vacancy",
        "salary",
        "hiring",
        "registration fee"
    ]):
        return "Fake Job Scam"

    if any(word in message for word in [
        "won",
        "winner",
        "prize",
        "lottery",
        "reward"
    ]):
        return "Prize / Lottery Scam"

    if any(word in message for word in [
        "delivery",
        "parcel",
        "package",
        "courier"
    ]):
        return "Delivery Scam"

    if any(word in message for word in [
        "investment",
        "profit",
        "returns",
        "crypto"
    ]):
        return "Investment Scam"

    return "Other / Suspicious Message"


def get_recommendation(risk_level):

    if risk_level == "HIGH":
        return (
            "Do not click links or share passwords, OTPs, "
            "banking details, or other sensitive information. "
            "Verify the message through an official source."
        )

    elif risk_level == "MEDIUM":
        return (
            "Be cautious. Verify the sender and message "
            "through an official source before taking action."
        )

    else:
        return (
            "No major suspicious indicators were detected, "
            "but continue to verify unexpected messages."
        )


if __name__ == "__main__":

    # Example values from our ML + red-flag systems
    scam_probability = 0.9364

    red_flags = [
        "Urgent language",
        "Account threat",
        "Contains a URL"
    ]

    message = """
    URGENT! Your bank account will be blocked.
    Verify your details immediately using:
    https://example.com
    """

    # Calculate score
    risk_score = calculate_risk_score(
        scam_probability,
        red_flags
    )

    # Get risk level
    risk_level = get_risk_level(risk_score)

    # Detect category
    category = detect_category(message)

    # Get recommendation
    recommendation = get_recommendation(risk_level)

    print("SCAMVEX ANALYSIS")
    print("----------------------------")

    print(f"Risk Score: {risk_score}%")
    print(f"Risk Level: {risk_level}")
    print(f"Category: {category}")

    print("\nRed Flags:")

    for flag in red_flags:
        print("✓", flag)

    print("\nRecommendation:")
    print(recommendation)