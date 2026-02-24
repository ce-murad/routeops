from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import math
import requests

def osrm_table_matrix(points):
    """
    Returns (distance_matrix_m, duration_matrix_s)
    using OSRM public table API.
    Falls back to None if request fails.
    """
    if len(points) < 2:
        return None, None

    coords = ";".join([f'{p["lng"]},{p["lat"]}' for p in points])
    url = f"http://router.project-osrm.org/table/v1/driving/{coords}"
    params = {
        "annotations": "distance,duration"
    }

    try:
        r = requests.get(url, params=params, timeout=(3, 7))
        r.raise_for_status()
        data = r.json()

        distances = data.get("distances")
        durations = data.get("durations")

        if not distances or not durations:
            return None, None

        return distances, durations

    except Exception:
        return None, None

def haversine_km(a, b):
    R = 6371
    lat1, lon1 = math.radians(a["lat"]), math.radians(a["lng"])
    lat2, lon2 = math.radians(b["lat"]), math.radians(b["lng"])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(h))


def osrm_route_geometry(points):
    if len(points) < 2:
        return points

    # Public OSRM can get slow with many via points; keep it snappy.
    if len(points) > 20:
        return points

    coords = ";".join([f'{p["lng"]},{p["lat"]}' for p in points])
    url = f"http://router.project-osrm.org/route/v1/driving/{coords}"
    params = {"overview": "full", "geometries": "geojson"}

    # 👇 connect timeout 3s, read timeout 7s (prevents “stuck forever”)
    r = requests.get(url, params=params, timeout=(3, 7))
    r.raise_for_status()
    data = r.json()

    routes = data.get("routes", [])
    if not routes:
        return points

    line = routes[0]["geometry"]["coordinates"]  # [lon, lat]
    return [{"lat": lat, "lng": lon} for lon, lat in line]


def solve_vrp(data):
    stops = data["stops"]
    depot_id = data["depotId"]
    vehicles = int(data["vehicles"])
    capacity = int(data["capacity"])
    objective = data.get("objective", "distance")  # "distance" or "time"

    depot_index = next(i for i, s in enumerate(stops) if s["id"] == depot_id)
    ordered = [stops[depot_index]] + stops[:depot_index] + stops[depot_index + 1 :]
    n = len(ordered)

    if n <= 1:
        return {
            "status": "ok",
            "summary": {
                "totalDistanceKm": 0,
                "totalTimeMin": 0,
                "routes": 0,
                "stopsServed": 0,
            },
            "routes": [],
            "unservedStopIds": [s["id"] for s in ordered],
        }

    # --- Build matrices: OSRM (preferred) + fallback to haversine ---
    # nodes for OSRM should be {lat,lng}
    nodes = [{"lat": s["lat"], "lng": s["lng"]} for s in ordered]
    osrm_dist, osrm_dur = osrm_table_matrix(nodes)

    if osrm_dist is not None and osrm_dur is not None:
        # OSRM returns floats (meters/seconds). Convert to int matrices.
        distance_m = [[int(x) for x in row] for row in osrm_dist]
        duration_s = [[int(x) for x in row] for row in osrm_dur]
        used_matrix = "osrm"
    else:
        # Fallback: haversine distance + constant-speed duration
        distance_m = [
            [int(haversine_km(ordered[i], ordered[j]) * 1000) for j in range(n)]
            for i in range(n)
        ]
        # 40 km/h -> seconds
        duration_s = [
            [
                int((distance_m[i][j] / 1000.0) / 40.0 * 3600.0)
                for j in range(n)
            ]
            for i in range(n)
        ]
        used_matrix = "haversine"

    demands = [int(s.get("demand", 0)) for s in ordered]

    manager = pywrapcp.RoutingIndexManager(n, vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)

    # --- Choose the cost callback based on objective ---
    if objective == "time":
        def cost_callback(from_index, to_index):
            i = manager.IndexToNode(from_index)
            j = manager.IndexToNode(to_index)
            return duration_s[i][j]
    else:
        def cost_callback(from_index, to_index):
            i = manager.IndexToNode(from_index)
            j = manager.IndexToNode(to_index)
            return distance_m[i][j]

    transit = routing.RegisterTransitCallback(cost_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit)

    # Capacity constraint
    def demand_callback(from_index):
        return demands[manager.IndexToNode(from_index)]

    demand_cb = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_cb,
        0,
        [capacity] * vehicles,
        True,
        "Capacity",
    )

    search = pywrapcp.DefaultRoutingSearchParameters()
    search.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    search.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    search.time_limit.seconds = 5

    solution = routing.SolveWithParameters(search)
    if not solution:
        return None

    routes = []
    total_distance_km = 0.0
    total_time_min = 0.0

    for v in range(vehicles):
        index = routing.Start(v)
        route_nodes = []

        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            route_nodes.append(node)
            index = solution.Value(routing.NextVar(index))

        # route_nodes has the visited nodes excluding the final End node
        if len(route_nodes) <= 1:
            continue

        stop_ids = [ordered[i]["id"] for i in route_nodes]

        # Geometry for display (road-following)
        visit_points = [{"lat": ordered[i]["lat"], "lng": ordered[i]["lng"]} for i in route_nodes]
        try:
            geometry = osrm_route_geometry(visit_points)
            if not geometry:
                geometry = visit_points
        except Exception:
            geometry = visit_points

        # Compute route distance/time using matrices (so KPIs match objective)
        route_dist_m = 0
        route_time_s = 0
        for a, b in zip(route_nodes, route_nodes[1:]):
            route_dist_m += distance_m[a][b]
            route_time_s += duration_s[a][b]

        km = route_dist_m / 1000.0
        time_min = route_time_s / 60.0

        total_distance_km += km
        total_time_min += time_min

        routes.append(
            {
                "routeId": v,
                "vehicleId": v,
                "stopIds": stop_ids,
                "load": sum(ordered[i].get("demand", 0) for i in route_nodes),
                "distanceKm": round(km, 2),
                "timeMin": round(time_min, 1),
                "geometry": geometry,
                # optional debug info; harmless if frontend ignores
                "matrixUsed": used_matrix,
            }
        )

    served = {sid for r in routes for sid in r["stopIds"]}

    return {
        "status": "ok",
        "summary": {
            "totalDistanceKm": round(total_distance_km, 2),
            "totalTimeMin": round(total_time_min, 1),
            "routes": len(routes),
            "stopsServed": len(served),
        },
        "routes": routes,
        "unservedStopIds": [s["id"] for s in ordered if s["id"] not in served],
    }

    