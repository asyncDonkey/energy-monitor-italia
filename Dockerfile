# Dockerfile for the Python backend service

# 1. Start from a lightweight Python image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. First copy only the requirements file to leverage Docker cache
COPY requirements.txt .

# 4. Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application code
COPY . .

# 6. The command to run the application when the container starts
CMD ["python3", "data_fetcher.py"]