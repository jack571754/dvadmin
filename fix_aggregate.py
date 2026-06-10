#!/usr/bin/env python3
file_path = "/home/frappe/frappe-bench/apps/product_sales_planning/product_sales_planning/utils/query_builder.py"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 找到 _aggregate_data 方法的开始和结束
start_line = None
end_line = None
brace_count = 0

for i, line in enumerate(lines):
    if "def _aggregate_data" in line:
        start_line = i
    if start_line is not None:
        if "def get_query_builder" in line:
            end_line = i
            break

if start_line is None:
    print("Error: _aggregate_data method not found")
    exit(1)

print(f"Found _aggregate_data at lines {start_line+1} to {end_line+1}")

# 新的方法内容
new_method = '''    def _aggregate_data(
        self, 
        raw_data: List[Dict[str, Any]], 
        dimension: str,
        months: List[str]
    ) -> List[Dict[str, Any]]:
        """
        聚合原始数据
        
        将按月份分组的原始数据聚合为最终格式。
        
        Args:
            raw_data: 原始查询结果
            dimension: 数据维度
            months: 月份列表
            
        Returns:
            List[Dict[str, Any]]: 聚合后的数据列表
        """
        if dimension == "detail":
            # 按 store_id + code + task_id 聚合
            grouped = {}
            for row in raw_data:
                task_id = row.get("task_id") or ""
                key = f"{row['store_id']}-{row['code']}-{task_id}"
                if key not in grouped:
                    grouped[key] = {
                        "store_id": row["store_id"],
                        "store_name": row.get("store_name") or row["store_id"],
                        "channel": row.get("channel") or "",
                        "shop_type": row.get("shop_type") or "",
                        "code": row["code"],
                        "commodity_name": row.get("commodity_name") or row["code"],
                        "specifications": row.get("specifications") or "",
                        "brand": row.get("brand") or "",
                        "category": row.get("category") or "",
                        "nickname": row.get("nickname") or "",
                        "task_id": task_id,
                        "months": {},
                        "total": 0
                    }
                if row.get("month"):
                    grouped[key]["months"][row["month"]] = row.get("quantity") or 0
                    grouped[key]["total"] += row.get("quantity") or 0
            
            return list(grouped.values())
        
        elif dimension == "store":
            # 按 store_id + task_id 聚合
            grouped = {}
            for row in raw_data:
                task_id = row.get("task_id") or ""
                key = f"{row['store_id']}-{task_id}"
                if key not in grouped:
                    grouped[key] = {
                        "store_id": row["store_id"],
                        "store_name": row.get("store_name") or row["store_id"],
                        "channel": row.get("channel") or "",
                        "shop_type": row.get("shop_type") or "",
                        "task_id": task_id,
                        "product_count": row.get("product_count") or 0,
                        "months": {},
                        "total": 0
                    }
                if row.get("month"):
                    grouped[key]["months"][row["month"]] = row.get("quantity") or 0
                    grouped[key]["total"] += row.get("quantity") or 0
            
            return list(grouped.values())
        
        else:  # dimension == "product"
            # 按 code + task_id 聚合
            grouped = {}
            for row in raw_data:
                task_id = row.get("task_id") or ""
                key = f"{row['code']}-{task_id}"
                if key not in grouped:
                    grouped[key] = {
                        "code": row["code"],
                        "commodity_name": row.get("commodity_name") or row["code"],
                        "specifications": row.get("specifications") or "",
                        "brand": row.get("brand") or "",
                        "category": row.get("category") or "",
                        "nickname": row.get("nickname") or "",
                        "task_id": task_id,
                        "store_count": row.get("store_count") or 0,
                        "months": {},
                        "total": 0
                    }
                if row.get("month"):
                    grouped[key]["months"][row["month"]] = row.get("quantity") or 0
                    grouped[key]["total"] += row.get("quantity") or 0
            
            return list(grouped.values())


'''

# 替换方法
new_lines = lines[:start_line] + [new_method] + lines[end_line:]

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fixed _aggregate_data method")
