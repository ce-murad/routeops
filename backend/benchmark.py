"""Reproducible RouteOps CVRP benchmark. Place next to backend/solver.py."""
import csv
import math
import random
import statistics
from pathlib import Path

import solver

SEED = 20261015
CONFIGS = [(10, 3)] * 3 + [(20, 5)] * 4 + [(40, 8)] * 3
CAPACITY = 10


def distance_matrix(stops):
    """Fixed straight-line distance matrix, meters; no external routing service."""
    n = len(stops)
    return [[int(round(solver.haversine_km(stops[i], stops[j]) * 1000))
             for j in range(n)] for i in range(n)]


def scenario(index, customers):
    rng = random.Random(SEED + index)
    # Sample within roughly 10 km of central Ankara; synthetic, not real addresses.
    stops = [{"id": "depot", "lat": 39.9208, "lng": 32.8541, "demand": 0}]
    for i in range(customers):
        stops.append({"id": f"customer_{i+1}",
                      "lat": 39.9208 + rng.uniform(-0.065, 0.065),
                      "lng": 32.8541 + rng.uniform(-0.075, 0.075),
                      "demand": rng.randint(1, 2)})
    return stops


def sequential_baseline(stops, matrix, vehicles):
    """First-fit sequential vehicle assignment, original customer order."""
    routes = [[] for _ in range(vehicles)]
    loads = [0] * vehicles
    v = 0
    for i in range(1, len(stops)):
        demand = stops[i]["demand"]
        if loads[v] + demand > CAPACITY:
            v += 1
        if v >= vehicles:
            raise ValueError("Baseline ran out of vehicles; scenario infeasible for this baseline")
        routes[v].append(i)
        loads[v] += demand
    total_m = 0
    for route in routes:
        if route:
            seq = [0] + route + [0]
            total_m += sum(matrix[a][b] for a, b in zip(seq, seq[1:]))
    return total_m / 1000


def run():
    rows = []
    original_table = solver.osrm_table_matrix
    original_geometry = solver.osrm_route_geometry
    try:
        # Supply identical fixed matrices to the existing solver. No OSRM requests.
        solver.osrm_route_geometry = lambda points: points
        for index, (customers, vehicles) in enumerate(CONFIGS, 1):
            stops = scenario(index, customers)
            matrix = distance_matrix(stops)
            # Solver expects meters and seconds; constant 40 km/h only for duration.
            durations = [[int(round(d / 1000 / 40 * 3600)) for d in row] for row in matrix]
            solver.osrm_table_matrix = lambda points, dm=matrix, tm=durations: (dm, tm)
            baseline_km = sequential_baseline(stops, matrix, vehicles)
            result = solver.solve_vrp({"stops": stops, "depotId": "depot",
                                       "vehicles": vehicles, "capacity": CAPACITY,
                                       "objective": "distance"})
            if result is None or result.get("status") != "ok":
                raise RuntimeError(f"RouteOps failed scenario {index}")
            served = [sid for route in result["routes"] for sid in route["stopIds"] if sid != "depot"]
            expected = {s["id"] for s in stops[1:]}
            if len(served) != customers or set(served) != expected or len(set(served)) != customers:
                raise RuntimeError(f"Unserved or duplicated customers in scenario {index}")
            if any(route["load"] > CAPACITY for route in result["routes"]):
                raise RuntimeError(f"Capacity violation in scenario {index}")
            optimized_km = float(result["summary"]["totalDistanceKm"])
            reduction = (baseline_km - optimized_km) / baseline_km * 100
            row = {"scenario": index, "customers": customers, "vehicles": vehicles,
                   "baseline_km": round(baseline_km, 2),
                   "routeops_km": round(optimized_km, 2),
                   "reduction_pct": round(reduction, 2)}
            rows.append(row)
            print(f"Scenario {index:02d}: {customers:2d} customers | baseline {baseline_km:7.2f} km | RouteOps {optimized_km:7.2f} km | reduction {reduction:6.2f}%", flush=True)
    finally:
        solver.osrm_table_matrix = original_table
        solver.osrm_route_geometry = original_geometry

    output = Path(__file__).with_name("benchmark_results.csv")
    with output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    percentages = [row["reduction_pct"] for row in rows]
    weighted = (sum(r["baseline_km"] for r in rows) - sum(r["routeops_km"] for r in rows)) / sum(r["baseline_km"] for r in rows) * 100
    print(f"\nMean scenario reduction: {statistics.mean(percentages):.2f}%")
    print(f"Median scenario reduction: {statistics.median(percentages):.2f}%")
    print(f"Pooled distance reduction: {weighted:.2f}%")
    print(f"RouteOps improved {sum(p > 0 for p in percentages)} of {len(rows)} scenarios")
    print(f"Saved results to {output}")
    print("NOTE: Synthetic straight-line distances, not OSRM road distances.")


if __name__ == "__main__":
    run()
