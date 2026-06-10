import re

file_path = "/home/frappe/frappe-bench/apps/product_sales_planning/product_sales_planning/utils/query_builder.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. 修复 detail 维度的查询 - 添加 task_id
old_detail = '''            data_query = f"""
                SELECT 
                    cs.store_id,
                    sl.shop_name as store_name,
                    sl.channel,
                    sl.shop_type,
                    cs.code,
                    pl.name1 as commodity_name,
                    pl.specifications,
                    pl.brand,
                    pl.category,
                    pl.nickname,
                    DATE_FORMAT(cs.sub_date, '%%Y-%%m') as month,
                    SUM(cs.quantity) as quantity
                FROM `tabCommodity Schedule` cs
                {data_join_clause}
                WHERE {where_clause}
                GROUP BY cs.store_id, cs.code, DATE_FORMAT(cs.sub_date, '%%Y-%%m')
                ORDER BY {sort_clause}
            """'''

new_detail = '''            data_query = f"""
                SELECT 
                    cs.store_id,
                    sl.shop_name as store_name,
                    sl.channel,
                    sl.shop_type,
                    cs.code,
                    pl.name1 as commodity_name,
                    pl.specifications,
                    pl.brand,
                    pl.category,
                    pl.nickname,
                    cs.task_id,
                    DATE_FORMAT(cs.sub_date, '%%Y-%%m') as month,
                    SUM(cs.quantity) as quantity
                FROM `tabCommodity Schedule` cs
                {data_join_clause}
                WHERE {where_clause}
                GROUP BY cs.store_id, cs.code, cs.task_id, DATE_FORMAT(cs.sub_date, '%%Y-%%m')
                ORDER BY {sort_clause}
            """'''

content = content.replace(old_detail, new_detail)

# 2. 修复 store 维度的查询 - 添加 task_id
old_store = '''            data_query = f"""
                SELECT 
                    cs.store_id,
                    sl.shop_name as store_name,
                    sl.channel,
                    sl.shop_type,
                    COUNT(DISTINCT cs.code) as product_count,
                    DATE_FORMAT(cs.sub_date, '%%Y-%%m') as month,
                    SUM(cs.quantity) as quantity
                FROM `tabCommodity Schedule` cs
                {data_join_clause}
                WHERE {where_clause}
                GROUP BY cs.store_id, DATE_FORMAT(cs.sub_date, '%%Y-%%m')
                ORDER BY {sort_clause}
            """'''

new_store = '''            data_query = f"""
                SELECT 
                    cs.store_id,
                    sl.shop_name as store_name,
                    sl.channel,
                    sl.shop_type,
                    cs.task_id,
                    COUNT(DISTINCT cs.code) as product_count,
                    DATE_FORMAT(cs.sub_date, '%%Y-%%m') as month,
                    SUM(cs.quantity) as quantity
                FROM `tabCommodity Schedule` cs
                {data_join_clause}
                WHERE {where_clause}
                GROUP BY cs.store_id, cs.task_id, DATE_FORMAT(cs.sub_date, '%%Y-%%m')
                ORDER BY {sort_clause}
            """'''

content = content.replace(old_store, new_store)

# 3. 修复 _aggregate_data 中的 detail 分组
old_detail_agg = '''        if dimension == "detail":
            # 按 store_id + code 聚合
            grouped = {}
            for row in raw_data:
                key = f"{row['store_id']}-{row['code']}"
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
                        "months": {},
                        "total": 0
                    }
                if row.get("month"):
                    grouped[key]["months"][row["month"]] = row.get("quantity") or 0
                    grouped[key]["total"] += row.get("quantity") or 0
            
            return list(grouped.values())'''

new_detail_agg = '''        if dimension == "detail":
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
            
            return list(grouped.values())'''

content = content.replace(old_detail_agg, new_detail_agg)

# 4. 修复 _aggregate_data 中的 store 分组
old_store_agg = '''        elif dimension == "store":
            # 按 store_id 聚合
            grouped = {}
            for row in raw_data:
                key = row["store_id"]
                if key not in grouped:
                    grouped[key] = {
                        "store_id": row["store_id"],
                        "store_name": row.get("store_name") or row["store_id"],
                        "channel": row.get("channel") or "",
                        "shop_type": row.get("shop_type") or "",
                        "product_count": row.get("product_count") or 0,
                        "months": {},
                        "total": 0
                    }
                if row.get("month"):
                    grouped[key]["months"][row["month"]] = row.get("quantity") or 0
                    grouped[key]["total"] += row.get("quantity") or 0
            
            return list(grouped.values())'''

new_store_agg = '''        elif dimension == "store":
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
            
            return list(grouped.values())'''

content = content.replace(old_store_agg, new_store_agg)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed query_builder.py - added task_id to all queries")
