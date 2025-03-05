import json
import random


def generate_data(num_points=150000, x_range=(-1, 1), y_range=(-1, 1)):
    data = []
    for i in range(num_points):
        point = {
            "id": i,
            "x": random.uniform(*x_range),
            "y": random.uniform(*y_range),
            "children": []
        }
        data.append(point)
    return data


data_points = generate_data()
with open("data.json", "w") as f:
    json.dump(data_points, f, indent=2)

print("Generated 100,000 data points and saved to data.json")
