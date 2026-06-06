import os
from roboflow import Roboflow

os.makedirs("data/labeled", exist_ok=True)

rf = Roboflow(api_key="y8CqklhaGLS0Ao0RTtXc")
project = rf.workspace("kriss-workspace-0pkoe").project("origami-symbols")
version = project.version(1)
dataset = version.download("yolov8", location="./data/labeled", overwrite=True)

print(f"Downloaded to: {dataset.location}")
