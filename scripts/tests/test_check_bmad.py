"""用隔离安装夹具验证健康检查的失败行为，不修改真实安装。"""
import csv
import hashlib
import importlib.util
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

PROJECT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("check_bmad", PROJECT / "scripts/check_bmad.py")
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)


class InstallationCheckTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "_bmad/_config").mkdir(parents=True)
        shutil.copytree(PROJECT / "_bmad/scripts", self.root / "_bmad/scripts")
        (self.root / "_bmad/config.toml").write_text(
            '[core]\nproject_name="dvadmin"\ncommunication_language="Chinese"\n'
            'document_output_language="Chinese"\noutput_folder="_bmad-output"\n', encoding="utf-8")
        (self.root / "_bmad/_config/manifest.yaml").write_text(
            "installation:\n  version: 6.12.4\n", encoding="utf-8")
        self.rows = []
        resources = []
        for name in sorted(checker.REQUIRED):
            source = f"_bmad/core/{name}/SKILL.md"
            self.rows.append({"canonicalId": name, "path": source})
            content = f"---\nname: {name}\ndescription: '测试技能说明'\n---\n测试工作流\n"
            for relative in [source, f".agents/skills/{name}/SKILL.md"]:
                path = self.root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
            relative = f"core/{name}/workflow.md"
            workflow = self.root / f".agents/skills/{name}/workflow.md"
            workflow.write_text("测试工作流", encoding="utf-8")
            resources.append({"path": relative, "hash": hashlib.sha256(workflow.read_bytes()).hexdigest()})
        self.write_rows()
        with (self.root / "_bmad/_config/files-manifest.csv").open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=["path", "hash"])
            writer.writeheader()
            writer.writerows(resources)

    def write_rows(self):
        with (self.root / "_bmad/_config/skill-manifest.csv").open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=["canonicalId", "path"])
            writer.writeheader()
            writer.writerows(self.rows)

    def test_complete_installation(self):
        result = checker.inspect(self.root)
        self.assertTrue(result["ok"], result)
        self.assertEqual(result["skills_checked"], len(checker.REQUIRED))

    def test_missing_codex_skill(self):
        (self.root / ".agents/skills/bmad-build/SKILL.md").unlink()
        self.assertFalse(checker.inspect(self.root)["ok"])

    def test_modified_resource(self):
        path = self.root / ".agents/skills/bmad-build/workflow.md"
        path.write_text(path.read_text(encoding="utf-8") + "变更", encoding="utf-8")
        self.assertIn("资源校验失败", " ".join(checker.inspect(self.root)["errors"]))

    def test_missing_resource(self):
        (self.root / ".agents/skills/bmad-build/workflow.md").unlink()
        self.assertFalse(checker.inspect(self.root)["ok"])

    def test_invalid_skill_name(self):
        path = self.root / ".agents/skills/bmad-build/SKILL.md"
        path.write_text(path.read_text(encoding="utf-8").replace("name: bmad-build", "name: other"), encoding="utf-8")
        self.assertIn("名称错误", " ".join(checker.inspect(self.root)["errors"]))

    def test_cli_exit_codes(self):
        command = [sys.executable, str(PROJECT / "scripts/check_bmad.py"), "--project-root", str(self.root)]
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)
        (self.root / ".agents/skills/bmad-build/SKILL.md").unlink()
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 1)

    def test_incompatible_version(self):
        (self.root / "_bmad/_config/manifest.yaml").write_text("installation:\n  version: 7.0.0\n", encoding="utf-8")
        self.assertFalse(checker.inspect(self.root)["ok"])

    def test_version_in_unrelated_section_does_not_pass(self):
        (self.root / "_bmad/_config/manifest.yaml").write_text(
            "installation:\n  version: 7.0.0\nother:\n  version: 6.12.4\n", encoding="utf-8")
        self.assertFalse(checker.inspect(self.root)["ok"])

    def test_scalar_core_config_returns_error(self):
        (self.root / "_bmad/config.toml").write_text('core="broken"\n', encoding="utf-8")
        self.assertIn("core 必须是配置表", " ".join(checker.inspect(self.root)["errors"]))

    def test_empty_description(self):
        path = self.root / ".agents/skills/bmad-build/SKILL.md"
        path.write_text("---\nname: bmad-build\ndescription: ''\n---\n", encoding="utf-8")
        self.assertIn("缺少描述", " ".join(checker.inspect(self.root)["errors"]))

    def test_duplicate_skill(self):
        self.rows.append(self.rows[0])
        self.write_rows()
        self.assertIn("重复", " ".join(checker.inspect(self.root)["errors"]))

    def test_path_outside_project(self):
        self.rows[0]["path"] = "../outside.md"
        self.write_rows()
        self.assertIn("越出", " ".join(checker.inspect(self.root)["errors"]))

    def test_invalid_configuration(self):
        (self.root / "_bmad/config.toml").write_text("[broken", encoding="utf-8")
        self.assertIn("配置解析失败", " ".join(checker.inspect(self.root)["errors"]))

    def test_team_override_language(self):
        config = self.root / "_bmad/config.toml"
        config.write_text(config.read_text(encoding="utf-8").replace('communication_language="Chinese"',
                          'communication_language="English"'), encoding="utf-8")
        self.assertFalse(checker.inspect(self.root)["ok"])
        custom = self.root / "_bmad/custom"
        custom.mkdir()
        (custom / "config.toml").write_text('[core]\ncommunication_language="Chinese"\n', encoding="utf-8")
        self.assertTrue(checker.inspect(self.root)["ok"])


if __name__ == "__main__":
    unittest.main()
