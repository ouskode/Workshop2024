# Use the official Python image from the Docker Hub
FROM python:3.11

# Copy the rest of the application code into the container
COPY /app .

RUN pip install --upgrade pip

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port that Streamlit will run on
EXPOSE 8501

# Command to run the Streamlit app
CMD ["streamlit", "run", "main.py"]