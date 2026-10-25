"""只读检查项目的 BMAD 6.12.4 Codex 安装；Python 3.11+。"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

VERSION = "6.12.4"
REQUIRED = {"bmad-help", "bmad-spec", "bmad-prd", "bmad-architecture",
            "bmad-create-epics-and-stories", "bmad-sprint-planning", "bmad-build",
            "bmad-code-review", "bmad-qa-generate-e2e-tests"}


def inside(root: Path, relative: str) -> Path:
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError(f"路径越出项目: {relative}")
    return path


def inspect(root: Path) -> dict:
    root = root.resolve()
    errors = []
    count = 0
    resources = 0
    try:
        manifest = (root / "_bmad/_config/manifest.yaml").read_text(encoding="utf-8")
        installation = re.search(r"(?m)^installation:\r?\n((?:[ \t]+[^\n]*(?:\n|$))*)", manifest)
        if not installation or not re.search(
                rf"(?m)^  version: {re.escape(VERSION)}[ \t]*\r?$", installation[1]):
            errors.append(f"需要固定版本 {VERSION}")
        with (root / "_bmad/_config/skill-manifest.csv").open(encoding="utf-8", newline="") as stream:
            rows = list(csv.DictReader(stream))
        names = set()
        for row in rows:
            name = row["canonicalId"]
            if not re.fullmatch(r"bmad-[a-z0-9-]+", name) or name in names:
                raise ValueError(f"技能 ID 非法或重复: {name}")
            names.add(name)
            logical_source = inside(root, row["path"])
            if not logical_source.is_relative_to(root / "_bmad"):
                raise ValueError(f"技能源不在 _bmad 内: {name}")
            installed = inside(root, f".agents/skills/{name}/SKILL.md")
            content = installed.read_text(encoding="utf-8")
            header = content.split("---", 2)
            if len(header) != 3 or header[0].strip() or not re.search(
                    rf"(?m)^name:\s*['\"]?{re.escape(name)}['\"]?\s*$", header[1]):
                raise ValueError(f"技能 frontmatter 名称错误: {name}")
            description = re.search(r"(?m)^description:[ \t]*(.+)$", header[1])
            if not description or not description[1].strip().strip("'\"").strip():
                raise ValueError(f"技能缺少描述: {name}")
            count += 1
        if missing := REQUIRED - names:
            errors.append("缺少流程技能: " + ", ".join(sorted(missing)))
        # 安装器迁移技能后，清单仍记录逻辑源路径。按技能 ID 映射到 Codex 实体。
        with (root / "_bmad/_config/files-manifest.csv").open(encoding="utf-8", newline="") as stream:
            for row in csv.DictReader(stream):
                inside(root / "_bmad", row["path"])
                parts = Path(row["path"]).parts
                if "__pycache__" in parts or Path(row["path"]).suffix == ".pyc":
                    continue  # 安装器不分发 Python 缓存；发布清单可能仍包含这些条目。
                index = next((i for i, part in enumerate(parts) if part in names), None)
                if index is None:
                    continue
                resource = inside(root, str(Path(".agents/skills", *parts[index:])))
                if hashlib.sha256(resource.read_bytes()).hexdigest() != row["hash"]:
                    errors.append(f"技能资源校验失败: {resource.relative_to(root)}")
                resources += 1
        if resources == 0:
            errors.append("技能资源清单为空")
        for script in ("render_skill.py", "resolve_customization.py", "config_utils.py"):
            if not (root / "_bmad/scripts" / script).is_file():
                errors.append(f"缺少共享脚本: {script}")
        resolved = subprocess.run(
            [sys.executable, str(root / "_bmad/scripts/resolve_config.py"), "--project-root", str(root)],
            capture_output=True, text=True, encoding="utf-8", timeout=20, check=False)
        if resolved.returncode:
            errors.append("配置解析失败: " + resolved.stderr.strip())
        else:
            core = json.loads(resolved.stdout)["core"]
            if not isinstance(core, dict):
                raise ValueError("配置解析失败: core 必须是配置表")
            for key, expected in {"project_name": "dvadmin", "communication_language": "Chinese",
                                  "document_output_language": "Chinese", "output_folder": "_bmad-output"}.items():
                if core.get(key) != expected:
                    errors.append(f"配置不符: core.{key}，应为 {expected}")
    except (OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError) as exc:
        errors.append(str(exc))
    return {"ok": not errors, "expected_version": VERSION, "skills_checked": count,
            "resources_checked": resources, "errors": errors}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    result = inspect(args.project_root)
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
