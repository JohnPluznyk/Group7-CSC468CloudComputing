# Use the latest Python image from the official Docker Hub repository
FROM python:latest

# Set the working directory inside the container
WORKDIR /app

# Copy all files from the directory containing the Dockerfile into the container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 8000
EXPOSE 8000

# Specify the command to run when the container starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
