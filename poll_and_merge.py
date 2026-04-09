#!/usr/bin/env python3
import subprocess
import time
import sys

def check_pr_status():
    result = subprocess.run(
        ["gh", "pr", "checks", "1222", "--repo", "facebookexperimental/xds"],
        capture_output=True, text=True,
        cwd="/vercel/sandbox/repos/xds-worktrees/85b78f95"
    )
    output = result.stdout + result.stderr
    lines = [l.strip() for l in output.strip().split("\n") if l.strip()]
    
    all_pass = True
    any_fail = False
    any_pending = False
    statuses = []
    
    for line in lines:
        if "Command exited" in line:
            continue
        parts = line.split("\t")
        if len(parts) >= 2:
            name = parts[0].strip()
            status = parts[1].strip()
            statuses.append((name, status))
            if status == "fail":
                any_fail = True
                all_pass = False
            elif status != "pass":
                any_pending = True
                all_pass = False
    
    return all_pass, any_fail, any_pending, statuses

max_attempts = 30
attempt = 0

while attempt < max_attempts:
    attempt += 1
    all_pass, any_fail, any_pending, statuses = check_pr_status()
    
    if any_fail:
        print(f"RESULT:FAIL")
        for name, status in statuses:
            print(f"  {status:8s} {name}")
        sys.exit(1)
    
    if all_pass:
        print(f"RESULT:PASS")
        for name, status in statuses:
            print(f"  {status:8s} {name}")
        # Now merge
        merge_result = subprocess.run(
            ["gh", "pr", "merge", "1222", "--repo", "facebookexperimental/xds", "--squash", "--delete-branch"],
            capture_output=True, text=True,
            cwd="/vercel/sandbox/repos/xds-worktrees/85b78f95"
        )
        print(f"MERGE_STDOUT: {merge_result.stdout}")
        print(f"MERGE_STDERR: {merge_result.stderr}")
        print(f"MERGE_RC: {merge_result.returncode}")
        if merge_result.returncode == 0:
            print("RESULT:MERGED")
        else:
            print("RESULT:MERGE_FAILED")
        sys.exit(0)
    
    pending_names = [n for n, s in statuses if s not in ("pass", "fail")]
    print(f"Attempt {attempt}: {len(pending_names)} pending ({', '.join(pending_names[:3])}{'...' if len(pending_names)>3 else ''})... waiting 60s")
    sys.stdout.flush()
    time.sleep(60)

if attempt >= max_attempts:
    print("RESULT:TIMEOUT")
    sys.exit(2)
