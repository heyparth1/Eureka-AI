# GenAI Physics Simulator for SimPhy

This project is a web-based application that uses a Retrieval-Augmented Generation (RAG) AI model to translate natural language prompts into executable JavaScript code for the SimPhy physics simulation software. Users can describe a complex physics setup in plain English, and the AI will generate the corresponding, accurate simulation script.


## ✨ Key Features

* **Natural Language to Code:** Translates high-level descriptions (e.g., "a pendulum on a moving cart") into precise, runnable code.
* **RAG-Powered Accuracy:** Uses a custom knowledge base built from the SimPhy source code, ensuring the AI uses real, valid API functions instead of guessing.
* **Complex Logic Generation:** Capable of understanding and creating scripts for multi-body systems with various joints, forces, and relationships.
* **Automated Workflow:** Generates a downloadable `.js` file, eliminating the need for manual copy-pasting and reducing errors.
* **Simple & Fast Interface:** A clean, single-page web app for quick and easy interaction.

## 🏛️ Architecture

The application uses a modern RAG architecture to achieve high accuracy with a proprietary, undocumented API.

1.  **Knowledge Base:** A `knowledge_base.json` file was created by analyzing SimPhy's Java source code. This file acts as a detailed "textbook" of the scripting API.
2.  **User Prompt:** The user provides a prompt via the web interface.
3.  **RAG Pipeline (Backend):** The Node.js server receives the prompt, augments it with the entire knowledge base, and sends this rich context to the OpenAI API.
4.  **Informed Generation:** The AI model uses the provided rules, examples, and API definitions to generate a logically sound and syntactically correct script.
5.  **Code to User:** The generated script is sent back to the frontend to be displayed and downloaded.

---

## 🌍 Generalizing This Approach: Adding NLP to Any Software

This project demonstrates a **reusable blueprint** for adding Natural Language Processing to *any complex software system*.

At its core, the system acts as an **AI-powered universal translator** between **human intent** and **software APIs**.

### 🔁 Universal NLP → Software Pipeline

1. **Extract or Document APIs**  
   Convert documentation or source code into structured machine-readable knowledge.

2. **Build a Domain Knowledge Layer**  
   Map natural language concepts to real API calls and constraints.

3. **Retrieval-Augmented Generation (RAG)**  
   Retrieve only the most relevant API snippets per user query.

4. **Augmented Prompting**  
   Merge user intent, retrieved context, and best-practice examples.

5. **Informed Generation**  
   Generate code or actions that are domain-valid and logically correct.

6. **Execution / Export**  
   Output usable scripts, configurations, or commands.

> This removes the need to learn *how* a tool works — users only express *what* they want.

---

## 🔌 Potential Applications

- **Game Development (Unity / Unreal)** – Generate gameplay logic and scene setups.
- **Data Science (Python / MATLAB)** – Auto-generate pipelines, models, and plots.
- **CAD & 3D Modeling (Blender / AutoCAD)** – Create and modify models using language.
- **Scientific & Engineering Simulations** – Physics, robotics, electronics.
- **Enterprise Tools** – Safe natural language interfaces for internal systems.

---

## 🧠 Impact: How This Helps People

### 🎓 Students
- Learn concepts without fighting syntax.
- Instantly visualize “what-if” scenarios.

### 🧑‍🏫 Educators
- Build interactive demos and virtual labs in seconds.
- Teach advanced topics without heavy programming.

### 👩‍💻 Professionals
- Faster onboarding to complex or proprietary tools.
- Reduced development time and fewer API errors.

### 🌍 Accessibility
- Democratizes access to powerful software.
- Enables non-programmers to use expert-level tools.

---

## 🚀 Vision

This project shifts software from **expert-only interfaces** to **intent-driven systems**.

By layering NLP + RAG on top of existing tools, any complex system can become **conversational, intelligent, and accessible** — accelerating learning, innovation, and discovery.

---

## 📁 File Structure

This project consists of a few key files working together:

### `server.js`
This is the Node.js backend server built with Express.
* **Serves the Frontend:** It serves the `index.html` file to the user's browser.
* **API Endpoint:** It creates a `/generate` endpoint that listens for requests from the frontend.
* **Orchestrates the AI:** It contains the core RAG logic. It reads the `knowledge_base.json`, combines it with the user's prompt and a detailed system prompt (containing rules and examples), and makes the final call to the Google Generative AI API.
* **Security:** It securely handles the `OPENAI_API_KEY` from the `.env` file, ensuring it's never exposed to the client-side.

### `index.html`
This is the complete single-page frontend for the application.
* **User Interface:** Contains the HTML structure for the title, text input area, generate button, and the code display block.
* **Client-Side Logic:** Includes the JavaScript required to:
    * Capture the user's prompt.
    * Send the prompt to the `/generate` endpoint on the server using a `fetch` request.
    * Handle the loading state (showing a spinner).
    * Display the returned JavaScript code in the code block.
    * Power the "Copy Code" button.

### `knowledge_base.json`
This file is the "brain" of our RAG system. It's a structured JSON file that we manually created to act as the AI's textbook.
* **`api_summary`:** A detailed, hierarchical breakdown of the SimPhy API, listing all the known classes (`World`, `Body`, `Field`, etc.) and their methods, parameters, and descriptions.
* **`concept_dictionary`:** A key-value map that connects common English words and phrases (e.g., "hinge", "static", "ground") to their corresponding API calls (e.g., `World.addRevoluteJoint`, `body.setMassType(1)`). This helps the AI quickly find the right tools for the job.

### `package.json` & `package-lock.json`
These are standard Node.js files that manage the project's dependencies.
* **`package.json`:** Lists the libraries our server needs, such as `@google/generative-ai`, `express`, `cors`, and `dotenv`.
* **`package-lock.json`:** An auto-generated file that locks the specific versions of each dependency to ensure the project works consistently everywhere.

### `.env`
A local, private file used to store secret keys. This file is **not** and **should not** be committed to version control (it should be listed in your `.gitignore` file).
* **`OPENAI_API_KEY`**: This variable holds your secret API key for the Google AI service.

## 🚀 Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd genai-simphy-rag
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    * Create a new file named `.env` in the root of the project.
    * Add your Google AI API key to it:
        ```
        OPENAI_API_KEY="YOUR_API_KEY_HERE"
        ```

4.  **Start the server:**
    ```bash
    node server.js
    ```

5.  **Open the app:**
    * Open your web browser and navigate to `http://localhost:3000`.

## 🧑‍💻 How to Use

1.  **Enter a Prompt:** Type a description of the 2D mechanics simulation you want to create in the text box.
2.  **Generate Script:** Click the "Generate Script" button.
3.  **Review & Download:** The generated JavaScript code will appear in the display box. You can then use the "Copy Code" button to paste it into your SimPhy editor.