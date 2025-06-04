def determine_jeans_size(waist_cm, hip_cm, size_charts):
    """Determine jeans size based on waist and hip measurements"""
    best_match = None
    min_diff = float('inf')
    between_sizes = False
    between_size_lower = None
    between_size_upper = None
    
    # Prioritize waist measurement for jeans (70% waist, 30% hip)
    waist_weight = 0.7
    hip_weight = 0.3
    
    # Sort sizes for potential between-size determination
    size_data = []
    for size, data in size_charts.get("jeans", {}).get("size_mapping", {}).items():
        size_data.append((size, data))
    
    # Sort by waist measurement
    size_data.sort(key=lambda x: x[1]["waist"])
    
    # Find best match with weighted measurements
    for size, data in size_data:
        waist_diff = abs(data["waist"] - waist_cm) * waist_weight
        hip_diff = abs(data["hip"] - hip_cm) * hip_weight
        total_diff = waist_diff + hip_diff
        
        if total_diff < min_diff:
            min_diff = total_diff
            best_match = size
    
    # Check if measurements are between sizes
    for i in range(len(size_data) - 1):
        current_size, current_data = size_data[i]
        next_size, next_data = size_data[i + 1]
        
        if (current_data["waist"] <= waist_cm <= next_data["waist"]):
            lower_diff = abs(current_data["waist"] - waist_cm)
            upper_diff = abs(next_data["waist"] - waist_cm)
            total_range = next_data["waist"] - current_data["waist"]
            
            if lower_diff / total_range <= 0.3 or upper_diff / total_range <= 0.3:
                between_sizes = True
                between_size_lower = current_size
                between_size_upper = next_size
                
                if upper_diff < lower_diff:
                    best_match = next_size
                else:
                    best_match = current_size
                break
    
    result = best_match.replace("US_", "") if best_match else ""
    
    if between_sizes:
        lower = between_size_lower.replace("US_", "")
        upper = between_size_upper.replace("US_", "")
        
        lower_diff = abs(size_charts["jeans"]["size_mapping"][between_size_lower]["waist"] - waist_cm)
        upper_diff = abs(size_charts["jeans"]["size_mapping"][between_size_upper]["waist"] - waist_cm)
        total_range = size_charts["jeans"]["size_mapping"][between_size_upper]["waist"] - size_charts["jeans"]["size_mapping"][between_size_lower]["waist"]
        
        if 0.15 < lower_diff / total_range < 0.85 and 0.15 < upper_diff / total_range < 0.85:
            result = f"{lower}-{upper}"
    
    return result

def determine_dress_size(bust_cm, waist_cm, hip_cm, size_charts):
    """Determine dress size based on bust, waist, and hip measurements"""
    best_match = None
    min_diff = float('inf')
    between_sizes = False
    between_size_lower = None
    between_size_upper = None
    
    # Weight measurements by importance
    bust_weight = 0.4
    waist_weight = 0.35
    hip_weight = 0.25
    
    # Sort sizes
    size_data = []
    for size, data in size_charts.get("dresses", {}).get("size_mapping", {}).items():
        size_data.append((size, data))
    
    size_data.sort(key=lambda x: x[1]["bust"])
    
    # Find best match
    for size, data in size_data:
        bust_diff = abs(data["bust"] - bust_cm) * bust_weight
        waist_diff = abs(data["waist"] - waist_cm) * waist_weight
        hip_diff = abs(data["hip"] - hip_cm) * hip_weight
        total_diff = bust_diff + waist_diff + hip_diff
        
        if total_diff < min_diff:
            min_diff = total_diff
            best_match = size
    
    # Check for between sizes
    for i in range(len(size_data) - 1):
        current_size, current_data = size_data[i]
        next_size, next_data = size_data[i + 1]
        
        if (current_data["bust"] <= bust_cm <= next_data["bust"]):
            lower_diff = abs(current_data["bust"] - bust_cm)
            upper_diff = abs(next_data["bust"] - bust_cm)
            total_range = next_data["bust"] - current_data["bust"]
            
            if lower_diff / total_range <= 0.3 or upper_diff / total_range <= 0.3:
                between_sizes = True
                between_size_lower = current_size
                between_size_upper = next_size
                
                if upper_diff < lower_diff:
                    best_match = next_size
                else:
                    best_match = current_size
                break
    
    result = best_match.split("/")[0].replace("US_", "") if best_match else ""
    
    if between_sizes:
        lower = between_size_lower.split("/")[0].replace("US_", "")
        upper = between_size_upper.split("/")[0].replace("US_", "")
        
        lower_diff = abs(size_charts["dresses"]["size_mapping"][between_size_lower]["bust"] - bust_cm)
        upper_diff = abs(size_charts["dresses"]["size_mapping"][between_size_upper]["bust"] - bust_cm)
        total_range = size_charts["dresses"]["size_mapping"][between_size_upper]["bust"] - size_charts["dresses"]["size_mapping"][between_size_lower]["bust"]
        
        if 0.15 < lower_diff / total_range < 0.85 and 0.15 < upper_diff / total_range < 0.85:
            result = f"{lower}-{upper}"
    
    return result

def determine_skirt_size(waist_cm, hip_cm, size_charts):
    """Determine skirt size based on waist and hip measurements"""
    best_match = None
    min_diff = float('inf')
    between_sizes = False
    between_size_lower = None
    between_size_upper = None
    
    # Weight measurements
    waist_weight = 0.65
    hip_weight = 0.35
    
    # Sort sizes
    size_data = []
    for size, data in size_charts.get("skirts", {}).get("size_mapping", {}).items():
        size_data.append((size, data))
    
    size_data.sort(key=lambda x: x[1]["waist"])
    
    # Find best match
    for size, data in size_data:
        waist_diff = abs(data["waist"] - waist_cm) * waist_weight
        hip_diff = abs(data["hip"] - hip_cm) * hip_weight
        total_diff = waist_diff + hip_diff
        
        if total_diff < min_diff:
            min_diff = total_diff
            best_match = size
    
    # Check for between sizes
    for i in range(len(size_data) - 1):
        current_size, current_data = size_data[i]
        next_size, next_data = size_data[i + 1]
        
        if (current_data["waist"] <= waist_cm <= next_data["waist"]):
            lower_diff = abs(current_data["waist"] - waist_cm)
            upper_diff = abs(next_data["waist"] - waist_cm)
            total_range = next_data["waist"] - current_data["waist"]
            
            if lower_diff / total_range <= 0.3 or upper_diff / total_range <= 0.3:
                between_sizes = True
                between_size_lower = current_size
                between_size_upper = next_size
                
                if upper_diff < lower_diff:
                    best_match = next_size
                else:
                    best_match = current_size
                break
    
    result = best_match.split("/")[0].replace("US_", "") if best_match else ""
    
    if between_sizes:
        lower = between_size_lower.split("/")[0].replace("US_", "")
        upper = between_size_upper.split("/")[0].replace("US_", "")
        
        lower_diff = abs(size_charts["skirts"]["size_mapping"][between_size_lower]["waist"] - waist_cm)
        upper_diff = abs(size_charts["skirts"]["size_mapping"][between_size_upper]["waist"] - waist_cm)
        total_range = size_charts["skirts"]["size_mapping"][between_size_upper]["waist"] - size_charts["skirts"]["size_mapping"][between_size_lower]["waist"]
        
        if 0.15 < lower_diff / total_range < 0.85 and 0.15 < upper_diff / total_range < 0.85:
            result = f"{lower}-{upper}"
    
    return result

def get_size_details(garment_type, size_code, size_charts):
    """Get detailed size information for a given garment type and size code"""
    if not size_code:
        return {}
    
    lookup_code = f"US_{size_code}"
    
    if garment_type in ["dresses", "skirts"]:
        size_mapping = size_charts.get(garment_type, {}).get("size_mapping", {})
        if lookup_code in size_mapping:
            return size_mapping.get(lookup_code, {})
        
        for key in size_mapping.keys():
            if key.startswith(lookup_code + "/"):
                return size_mapping.get(key, {})
    else:
        size_mapping = size_charts.get(garment_type, {}).get("size_mapping", {})
        return size_mapping.get(lookup_code, {})
    
    return {}