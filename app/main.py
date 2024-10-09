import streamlit as st
from PIL import Image


@st.dialog("Sign up")
def dialog():
    st.write("Please select your authentication method")
    google = st.button("Google", icon="🔎", use_container_width=True)
    if google:
        st.success("Redirecting to login...")
        st.write('<meta http-equiv="refresh" content="0; url=http://localhost:3000/auth/login">', unsafe_allow_html=True)
        st.session_state.dialog = {"auth": "Google"}
        st.rerun()
        st.success("You have successfully signed up with Google")
    guest = st.button("Guest", icon=":material/mood:",use_container_width=True)
    if guest:
        st.session_state.dialog = {"auth": "Guest"}
        st.rerun()
        st.success("You have successfully signed up as a Guest")


st.set_page_config(
    page_title="Hello",
    page_icon="👋",
    layout="centered",
    initial_sidebar_state="collapsed",
)

if "dialog" not in st.session_state:
    dialog()

if "dialog" in st.session_state:
    image_banner_path = "app/assets/logo-workshop.png"
    image_logo_path = "app/assets/Logo.png"
    banner = Image.open(image_banner_path)
    logo = Image.open(image_logo_path)
    st.image(banner)

    st.logo(logo)

    st.write("# Welcome to MedMind! 👋")
    st.sidebar.title("Select chat")




    st.markdown(
        """
    ## Project Overview

    This project aims to design a web application that enables users to connect with AI-powered chatbots for personalized health advice and guidance. The application integrates with popular health tracking apps such as Google Fit, Apple Health, or other wearable devices to collect user data. The chatbots are trained to provide expert-level advice on various health topics, including:

    - **Medical tracking and monitoring**: Blood pressure, blood glucose levels, medication adherence
    - **Treatment planning and management**: Chronic disease management, medication side effects
    - **Nutrition and meal planning**: Personalized dietary recommendations, meal planning for specific health conditions
    - **Exercise and physical activity planning**: Customized workout routines, injury prevention

    ## Key Features

    - **Integration with Health Tracking Devices**: Connect your health tracking devices or apps to the platform.
    - **Personalized Health Advice**: Receive personalized health advice and guidance from AI-powered chatbots.
    - **Progress Tracking**: Track your progress and receive updates on your health metrics.
    - **Health Content Library**: Access a library of health-related content and resources.
    - **Human Interaction**: Interact with human healthcare professionals or specialists for additional guidance and support.

    ## Technical Features

    - **Natural Language Processing (NLP)**: Utilizes NLP and machine learning algorithms to enable conversational AI.
    - **App Integration**: Integrates with popular health tracking apps and devices.
    - **User Authentication and Data Security**: Ensures user authentication and data security measures to protect sensitive health information.
    - **Personalization and Customization**: Offers personalization and customization options for users to tailor their health advice and guidance.
    - **Scalability and Reliability**: Designed to handle a large user base and high traffic volumes.
    """
    )
