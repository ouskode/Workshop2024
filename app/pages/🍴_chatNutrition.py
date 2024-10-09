import streamlit as st
from langchain_groq import ChatGroq
from langchain_community.document_loaders import JSONLoader
import os
import json

os.environ["GROQ_API_KEY"] = "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"

def create_json_file(dict_data):
    file_name_temporary = "temp"
    with open(f"/tmp/{file_name_temporary}.json", "w") as f:
        json.dump(dict_data, f)
    return f"/tmp/{file_name_temporary}.json"



st.title("🍽️ Nutrition Chat 👨‍⚕️")

@st.dialog("insert your information")
def dialog():
    st.write("Please insert your nutrition information")
    gender = st.selectbox("Select your gender",
                 ("Male", "Female"),
                 index=None,
                 placeholder="Select your gender")
    age = st.text_input("Age", placeholder="18")
    height = st.text_input("Height (in centimeter)", placeholder="170")
    weight = st.text_input("Weight (in kilogram)", placeholder="70")
    activity = st.selectbox("Select your activity level",
                 ("Sedentary", "Lightly active", "Moderately active", "Very active", "Super active"),
                 index=None,
                 placeholder="Select your activity level")
    if st.button("Submit"):
        st.session_state.dialog = {"gender": gender, "age": age + "ans", "height": height, "weight" + "cm": weight + "kg", "activity": activity}
        st.rerun()
        st.success("Your information has been submitted")

if "dialog" not in st.session_state:
    dialog()

if "dialog" in st.session_state:
    file_path = create_json_file(st.session_state.dialog)
    file = os.open(file_path, os.O_RDWR)

    question = st.text_input(
        "Ask something about your nutrition",
        placeholder="Can you give me a advice for lose some kg?",
        disabled=not dialog,
    )


    if file and question:

        json_loader = JSONLoader(file_path, jq_schema=".[]")
        article = json_loader.load_and_split()

        llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        streaming=True,
        )

        messages = [
        (
            "system",
            "You are a helpful assistant that give advice of nutrition. When you put emoji for the answer, it will be more friendly for the user. When you have food recipe you can format that in table.",
        ),
        ("human", f"Here's an article of information of user:\n\n<article>{article}</article>\n\n{question}"),
        ]
        response = llm.stream(messages)

        with st.spinner("Thinking..."):
            st.write("### Answer")
            st.write_stream(response)
