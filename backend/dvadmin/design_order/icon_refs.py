def normalize_icon_refs(value) -> list[dict]:
    if not isinstance(value, list):
        return []
    result = []
    seen = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        try:
            icon_id = int(item.get("id"))
        except (TypeError, ValueError):
            continue
        short_name = str(item.get("shortName", item.get("short_name", ""))).strip()
        if icon_id <= 0 or not short_name or icon_id in seen:
            continue
        raw_file_id = item.get("fileId", item.get("file_id"))
        try:
            file_id = int(raw_file_id) if raw_file_id else None
        except (TypeError, ValueError):
            file_id = None
        result.append({
            "id": icon_id,
            "shortName": short_name,
            "interpretation": str(item.get("interpretation", "")).strip(),
            "fileId": file_id if file_id and file_id > 0 else None,
        })
        seen.add(icon_id)
    return result
