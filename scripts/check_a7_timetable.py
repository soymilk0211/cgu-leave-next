"""Sanity-check data/a7-shuttle-timetable.json. Run: python3 -I scripts/check_a7_timetable.py"""
import json, pathlib
D = json.loads(pathlib.Path(__file__).parent.parent.joinpath("data/a7-shuttle-timetable.json").read_text("utf-8"))
T = D["trips"]
sch = lambda s: [t for t in T if t["schedule"] == s]
wk = [t for t in sch("mon_fri") if "a7_exit1" in t["stop_times"]]
assert len(wk) == 37 and len(sch("sun_holiday")) == 18 and len(sch("friday_preholiday_extra")) == 9
assert [t["stop_times"]["meide"] for t in sch("friday_preholiday_extra")] == \
    "15:15 15:45 16:15 16:45 17:15 17:45 18:15 18:45 19:15".split()
assert len([t for t in sch("mon_fri") if "a7_exit1" not in t["stop_times"]]) == 27
for t in wk:
    assert t["detours_via_meide"] == (t["stop_times"]["meide"] is not None)
    if t["stop_times"]["a7_exit1"] in ("12:05", "12:20"): assert not t["detours_via_meide"]
assert sum(t["detours_via_meide"] for t in wk) == 19
for t in T + D["overrides"][0]["trips"]:
    assert t["source_url"].startswith("https://") and t["last_checked"] == "2026-11-21"
assert D["overrides"][0]["valid_on"] == "2026-11-21" and not any(t["schedule"] == "sun_holiday" for t in D["overrides"][0]["trips"])
assert D["service_calendar"]["winter_summer_break"]["status"] == "unverified"
assert "corp_museum" not in {k for t in T for k in t["stop_times"]}
print("ok", len(T), "trips")
