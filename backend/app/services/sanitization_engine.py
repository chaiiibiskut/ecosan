from datetime import datetime, timedelta
from typing import Optional


def compute_sanitization_score(
    footfall_per_hour: int,
    minutes_since_cleaned: Optional[int],
    odor_level_ppm: float,
) -> int:
    if minutes_since_cleaned is None:
        minutes_since_cleaned = 1440

    time_factor = min(minutes_since_cleaned / 720, 1.0) * 40

    footfall_factor = min(footfall_per_hour / 200, 1.0) * 30

    odor_factor = min(odor_level_ppm / 500, 1.0) * 30

    raw_score = 100 - (time_factor + footfall_factor + odor_factor)
    score = max(0, min(100, int(round(raw_score))))

    return score


def get_sanitization_status(score: int) -> str:
    if score >= 80:
        return "excellent"
    elif score >= 60:
        return "good"
    elif score >= 40:
        return "fair"
    elif score >= 20:
        return "poor"
    else:
        return "critical"