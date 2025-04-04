
# Podnexus - An Interactive Podcast Application
 
 > Author: [Suryateja Duvvuri](https://github.com/SuryatejaDuvvuri)


#### Motivation
>Listening to a podcast is like listening to a 90 min lecture where the content is only delivered by the host or the professor themselves. This is one way of delivering content but it does not always engage the audience to interact with the content especially in a podcast where audience cannot directly interact with the host. With the power of AI, we can make the podcast interactive which improves audience engagement with the content by asking questions and providing feedback in which the AI can give responses in real time. This application also allows the user to explore a topic in context as much as they want just like in any conversational interaction. 


#### General Description:
> The application offers a simple, intuitive user interface that prompts the user to insert the YouTube podcast link. The backend processes the link and converts it to an audio file that the user can play. Meanwhile, it uses speech to text transcription as well as Ollama to customize the AI to our needs by giving the content of the podcast as if they were the host. Once the audio player shows up, the user can ask questions by clicking the "Start Recording" button. Once they're done asking their question, it will be prompted to the AI where the AI will produce a response and be delivered through text to speech using ElevenLabs API.

### Demo
[![Watch the video](https://github.com/user-attachments/assets/a08a0d59-968a-4213-b36a-4718ace7376)](https://www.youtube.com/watch?v=AecZcCicCwM)


#### Languages/Tools/Technologies used:

Frontend: React.js, Tailwind CSS, Radix UI(for customized components)
Backend: Spring Boot, Spring MVC, Spring Web, Spring AI(Ollama LLM), Local Whisper.cpp(For Speech to Text), ElevenLabs API(For text to speech)
API: Youtube Data API(For extracting audio from a link), REST API for communicating between frontend and backend

 
#### The features in this project would be:

# Youtube Podcast Integration
> Users can give a Youtube Link which is then converted into an audio file locally.


# Real-time AI-Interaction
> Users can get AI-generated responses based on the context of the podcast


# Speech to Text and Text to Speech
> Speech to Text converts user's voice or podcast's audio to text using Whisper
> Text To Speech converts AI's textual response into voice using ElevenLabs


 ## Screenshots

> <img width="1500" alt="image" src="https://github.com/user-attachments/assets/a08a0d59-968a-4213-b36a-4718ace73760" />
<img width="1493" alt="image" src="https://github.com/user-attachments/assets/c359ee7b-dfe8-47a0-8473-eb89934ef375" />



## **Installation and Usage**

### **Prerequisites**

Before you can start running this project, make sure you have the following tools installed:

- **Java 11 or higher** (for backend)
- **Node.js** (for frontend development)
- **Docker** (optional for deploying backend)
- **Python** (for diarization and speech-to-text)

### **1. Clone the Repository**

First, clone the project repository to your local machine:

```bash
[git clone https://github.com/yourusername/podnexus.git](https://github.com/SuryatejaDuvvuri/PodNexus.git)

```
### **2. Backend Setup (Spring Boot)
1. Run the following in separate terminal.
2. cd PodnexusBackend
3. Do ```mvn clean install``` and ```mvn spring-boot::run```

### **3. Frontend Setup
```cd podnexus```
```npm install```
```npm run start```
### **4. Ollama Setup
1. Refer to Ollama Documentation on how to install Ollama and run Llama 3.2: https://github.com/ollama/ollama


