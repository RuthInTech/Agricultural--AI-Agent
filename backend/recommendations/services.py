from .models import Crop

def evaluate_water_suitability(farm, crop):
    """
    Compare farm water availability with crop water needs.
    Returns a score and an explanation.
    """

    farm_water = farm.water_availability.strip().lower()
    crop_water = crop.water_requirement.strip().lower()

    if not farm_water:
        return 0, "Farm water availability has not been provided."

    if not crop_water:
        return 0, "Water requirements for this crop are unknown."

    water_levels = {"low", "medium", "high"}

    if farm_water not in water_levels:
        return 0, "Farm water availability needs to be standardized."

    if crop_water not in water_levels:
        return 0, "Crop water requirement needs to be standardized."

   
    levels = {"low": 1, "medium": 2, "high": 3}

    available = levels[farm_water]
    required = levels[crop_water]

    if available >= required:
        return 15, "Water availability meets the crop's basic water category."

    return 0, "Water availability may be insufficient for this crop."


def evaluate_soil_suitability(farm, crop):
     """
    Compare a farm's soil type with a crop's suitable soil types.
    Returns a score and an explanation.
    """

     farm_soil = farm.soil_type.strip().lower()

     crop_soils = [ soil.strip().lower() for soil in crop.suitable_soil_types]

     if not farm_soil:
        return 0, "Farm soil type has not been provided."

     if not crop_soils:
        return 0, "Soil requirements for this crop are unknown."

     if farm_soil in crop_soils:
        return 20, f"Soil type matches: {farm.soil_type}."

     return 0, f"Soil compatibility needs further verification for {farm.soil_type}."


   
def generate_recommendations(farm):
    recommendations = []

    crops = Crop.objects.all()

    for crop in crops:
        score = 0
        reasons = []

     
        soil_score, soil_reason = evaluate_soil_suitability(
            farm, crop
        )
        score += soil_score
        reasons.append(soil_reason)

        
        water_score, water_reason = evaluate_water_suitability(
            farm, crop
        )
        score += water_score
        reasons.append(water_reason)
        
        recommendations.append({
            "crop": crop,
            "score": score,
            "suitability": "PENDING",
            "reasons": reasons,
        })

    # 4. Rank crops from highest score to lowest
    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return recommendations