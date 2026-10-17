import importlib.util
import pathlib
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "verify_upstream_quality_gates.py"
spec = importlib.util.spec_from_file_location("verify_upstream", SCRIPT)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

SHA = "a" * 40


def check(name, status="completed", conclusion="success", sha=SHA):
    return {"name": name, "status": status, "conclusion": conclusion, "head_sha": sha}


class QualityGateTest(unittest.TestCase):
    def test_all_success(self):
        runs = [check(name) for name in mod.REQUIRED]
        self.assertEqual(mod.gate_exit_code({"check_runs": runs}, SHA), 0)

    def test_missing_and_in_progress_are_pending_not_passed(self):
        self.assertEqual(mod.gate_exit_code({"check_runs": []}, SHA), 10)
        runs = [check("production-ai-smoke", status="in_progress", conclusion=None),
                check("coach-quality-smoke")]
        self.assertEqual(mod.gate_exit_code({"check_runs": runs}, SHA), 10)

    def test_non_success_fails_closed(self):
        runs = [check("production-ai-smoke", conclusion="failure"),
                check("coach-quality-smoke")]
        self.assertEqual(mod.gate_exit_code({"check_runs": runs}, SHA), 1)

    def test_other_commit_is_not_accepted(self):
        runs = [check(name, sha="b" * 40) for name in mod.REQUIRED]
        self.assertEqual(mod.gate_exit_code({"check_runs": runs}, SHA), 10)

    def test_empty_sha_is_rejected(self):
        with self.assertRaises(ValueError):
            mod.gate_exit_code({"check_runs": []}, "")


if __name__ == "__main__":
    unittest.main()
