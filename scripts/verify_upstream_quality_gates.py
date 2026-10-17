#!/usr/bin/env python3
"""Check required GitHub check-runs without accepting missing or stale evidence."""
import json
import os
import sys

REQUIRED = ("production-ai-smoke", "coach-quality-smoke")


def gate_exit_code(payload: dict, expected_commit: str) -> int:
    if not expected_commit:
        raise ValueError("Expected commit SHA must be supplied")
    runs = payload.get("check_runs", [])
    for name in REQUIRED:
        # Different SHA checks never satisfy this commit's quality gate.
        matches = [r for r in runs if r.get("name") == name
                   and r.get("head_sha") == expected_commit]
        if not matches or any(r.get("status") != "completed" for r in matches):
            print(f"PENDING: {name} has no completed result for {expected_commit}")
            return 10
        if any(r.get("conclusion") != "success" for r in matches):
            print(f"FAILED: {name} completed without success")
            return 1
    print("UPSTREAM AI QUALITY GATES PASS")
    return 0


def main() -> int:
    try:
        payload = json.loads(os.environ["CHECKS"])
        return gate_exit_code(payload, os.environ["EXPECTED_COMMIT"])
    except (KeyError, ValueError, TypeError) as exc:
        print(f"ERROR: cannot validate quality gate response: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
