import math
import random
from typing import List, Tuple, Optional
from dataclasses import dataclass

try:
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False


@dataclass
class Location:
    id: int
    lat: float
    lng: float
    fill_pct: float


@dataclass
class Vehicle:
    id: int
    lat: float
    lng: float
    capacity_kg: float
    current_load_kg: float


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_distance_matrix(locations: List[Location]) -> List[List[int]]:
    n = len(locations)
    matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                dist = haversine(
                    locations[i].lat, locations[i].lng,
                    locations[j].lat, locations[j].lng
                )
                matrix[i][j] = int(dist * 1000)
    return matrix


def solve_vrp_ortools(
    locations: List[Location],
    vehicle: Vehicle,
    max_distance_km: float = 50.0
) -> Tuple[List[int], float]:
    if not ORTOOLS_AVAILABLE:
        return solve_vrp_greedy(locations, vehicle, max_distance_km)

    depot_idx = 0
    locations_with_depot = [Location(-1, vehicle.lat, vehicle.lng, 0)] + locations
    distance_matrix = compute_distance_matrix(locations_with_depot)

    num_vehicles = 1
    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), num_vehicles, depot_idx)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    max_distance_meters = int(max_distance_km * 1000)
    routing.AddDimension(
        transit_callback_index,
        0,
        max_distance_meters,
        True,
        "Distance"
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 10

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return solve_vrp_greedy(locations, vehicle, max_distance_km)

    route = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        if node != depot_idx:
            route.append(locations[node - 1].id)
        index = solution.Value(routing.NextVar(index))

    total_distance = 0
    index = routing.Start(0)
    while not routing.IsEnd(index):
        next_index = solution.Value(routing.NextVar(index))
        total_distance += distance_callback(index, next_index)
        index = next_index

    return route, total_distance / 1000.0


def solve_vrp_greedy(
    locations: List[Location],
    vehicle: Vehicle,
    max_distance_km: float = 50.0
) -> Tuple[List[int], float]:
    if not locations:
        return [], 0.0

    unvisited = locations.copy()
    route = []
    current_lat, current_lng = vehicle.lat, vehicle.lng
    total_distance = 0.0

    while unvisited:
        nearest = min(
            unvisited,
            key=lambda loc: haversine(current_lat, current_lng, loc.lat, loc.lng)
        )
        dist = haversine(current_lat, current_lng, nearest.lat, nearest.lng)
        if total_distance + dist > max_distance_km:
            break
        route.append(nearest.id)
        total_distance += dist
        current_lat, current_lng = nearest.lat, nearest.lng
        unvisited.remove(nearest)

    return route, total_distance


def compute_random_route_distance(locations: List[Location], vehicle: Vehicle) -> float:
    if not locations:
        return 0.0
    shuffled = locations.copy()
    random.shuffle(shuffled)
    total = 0.0
    current_lat, current_lng = vehicle.lat, vehicle.lng
    for loc in shuffled:
        total += haversine(current_lat, current_lng, loc.lat, loc.lng)
        current_lat, current_lng = loc.lat, loc.lng
    return total


def optimize_route(
    bins: List[Location],
    vehicles: List[Vehicle],
    max_bins_per_vehicle: int = 10,
    max_distance_km: float = 50.0
) -> List[dict]:
    bins_sorted = sorted(bins, key=lambda b: b.fill_pct, reverse=True)
    results = []

    for vehicle in vehicles:
        available_bins = bins_sorted[:max_bins_per_vehicle]
        if not available_bins:
            continue

        route, optimized_distance = solve_vrp_ortools(
            available_bins, vehicle, max_distance_km
        )

        random_distance = compute_random_route_distance(available_bins, vehicle)
        distance_saved = max(0, random_distance - optimized_distance)

        results.append({
            "vehicle_id": vehicle.id,
            "vehicle_code": f"EV-{vehicle.id:02d}",
            "bin_ids": route,
            "optimized_distance_km": round(optimized_distance, 2),
            "random_distance_km": round(random_distance, 2),
            "distance_saved_km": round(distance_saved, 2),
            "bins_count": len(route),
        })

        for bin_id in route:
            bins_sorted = [b for b in bins_sorted if b.id != bin_id]

    return results