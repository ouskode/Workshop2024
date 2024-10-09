import streamlit as st

# Title of the chat page
st.title("🚵 ChatSport - Exercise Advice")

# Introduction text
st.write("Welcome to ChatSport! Ask for advice on exercises and get instant responses.")

# Input for user question
user_input = st.text_input("Ask your question about exercises:")

# Placeholder for the response
response = ""

# Simple logic to provide advice based on user input
if user_input:
    if "cardio" in user_input.lower():
        response = "For cardio exercises, consider running, cycling, or swimming."
    elif "strength" in user_input.lower():
        response = "For strength training, try weight lifting, resistance bands, or bodyweight exercises like push-ups."
    elif "flexibility" in user_input.lower():
        response = "For flexibility, yoga and stretching exercises are great options."
    else:
        response = "Please specify if you need advice on cardio, strength, or flexibility exercises."

# Display the response
if response:
    st.write(response)