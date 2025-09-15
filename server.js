// Import necessary libraries
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// --- CONFIGURATION ---
const PORT = 3000;
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL_NAME = "gpt-4o"; // Corrected Model Name

// --- INITIALIZATION ---
const app = express();
app.use(express.json());
app.use(cors());

if (!API_KEY) {
  throw new Error("OPENAI_API_KEY is not set. Please create a .env file and add your key.");
}
const genAI = new OpenAI({ apiKey: API_KEY });

// --- LOAD THE KNOWLEDGE BASE ---
let knowledgeBase;
try {
  const rawData = fs.readFileSync('knowledge_base.json');
  knowledgeBase = JSON.parse(rawData);
  console.log("Successfully loaded the SimPhy knowledge base.");
} catch (error) {
  console.error("CRITICAL ERROR: Failed to load or parse knowledge_base.json:", error);
  process.exit(1);
}

// --- REFINED SYSTEM PROMPT WITH A COMPLETE EXAMPLE FOR FIELDS ---
const systemPrompt = `You are an expert SimPhy script generator. Your task is to convert a user's prompt into a complete, runnable JavaScript script using the provided SimPhy API knowledge base.

RULES:
1.  **Analyze the Prompt**: Identify all objects, their properties, relationships, and fields from the user's request.
2.  **Use the Knowledge Base**: You MUST use the provided API summary and concepts to map user ideas to the correct API functions. Do not invent functions.
3.  **Handle Fields Correctly**: This is a critical rule. Fields (like "electric field") are pre-existing in the simulation UI. You CANNOT create new fields from a script. The only way to interact with them is to get them using 'World.getField("FieldName")'. Your generated code MUST always check if the returned field is null and print a helpful error message to the user if it is not found.
4.  **Handle Static Bodies**: If the user mentions "ground", "floor", or a "wall", create a large rectangle and make it STATIC by using '.setMassType(1)'. This is the only correct way.
5.  **Make Smart Assumptions**:
    * Gravity MUST ALWAYS be set to (0, -9.8), unless the user explicitly asks for zero gravity.
    * If the prompt implies a ground is needed, create a static ground rectangle automatically.
    * Choose reasonable, non-overlapping positions and sizes for objects.
6.  **Output Format**: Your final output MUST be only the JavaScript code, with helpful comments explaining each step. Do not include any other text or explanations outside of the code comments.

--- PERFECT EXAMPLES ---

## EXAMPLE 1: Bodies and Joints
User Request: "a block with two wheels is attached to a static wall with a spring"
Correct Code:
/**
 * Wheeled Block with Spring Simulation
 */
World.clearAll();
World.setGravity(0, -9.8);
var ground = World.addRectangle(100, 2);
ground.setPosition(0, -1);
ground.setMassType(1); // Make static
var wall = World.addRectangle(2, 100);
wall.setPosition(10, 49);
wall.setMassType(1); // Make static
var block = World.addRectangle(4, 2);
block.setPosition(2, 1.5);
block.setMass(15);
var wheel1 = World.addDisc(0.75);
wheel1.setPosition(1, 0.75);
wheel1.setMass(2);
var wheel2 = World.addDisc(0.75);
wheel2.setPosition(3, 0.75);
wheel2.setMass(2);
World.addRevoluteJoint(block, wheel1, new Vector2(1, 0.75));
World.addRevoluteJoint(block, wheel2, new Vector2(3, 0.75));
var springJoint = World.addSpringJoint(block, wall, new Vector2(4, 1.5), new Vector2(9, 1.5), 5.0, 0.5);
springJoint.setNaturalLength(4.0);
print("Simulation is ready!");

## EXAMPLE 2: Fields and Charged Particles
User Request: "a positively charged red ball in a constant electric field named 'E' that points down."
Correct Code:
/**
 * Charged Particle in an Electric Field
 */
World.clearAll();
World.setGravity(0, -9.8);

// Get the pre-existing Electric Field named 'E'. This must be added in the UI first.
var E = World.getField("E");

// Check if the field exists before trying to modify it
if (E != null) {
    // Set it to a constant downward value
    E.setIntensity(new Vector2(0, -50));
    E.setEnabled(true);
    print("Electric field 'E' configured successfully.");
} else {
    print("ERROR: Electric field named 'E' not found. Please add it in the SimPhy UI first.");
}

// Create the charged particle
var ball = World.addDisc(0.5);
ball.setPosition(0, 8);
ball.setMass(1);
ball.setCharge(2); // Set a positive charge
ball.setFillColor("red");

--- END OF EXAMPLES ---
`;

// --- API ENDPOINT for generating scripts ---
app.post('/generate', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log(`Received prompt: "${userPrompt}"`);

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const augmentedPrompt = `
      ---
      HERE IS THE KNOWLEDGE BASE. USE ONLY THESE FUNCTIONS AND CONCEPTS:
      ${JSON.stringify(knowledgeBase, null, 2)}
      ---
      HERE IS THE USER'S REQUEST:
      "${userPrompt}"
      ---
      GENERATE THE SCRIPT:
    `;

    const generationConfig = {
      temperature: 0.2,
      topK: 1,
      topP: 1,
      maxOutputTokens: 4096,
    };

    const chat = model.startChat({
        generationConfig,
        history: [{ role: "user", parts: [{ text: systemPrompt }] }]
    });

    const result = await chat.sendMessage(augmentedPrompt);
    const response = await result.response;
    const generatedScript = response.text();
    
    console.log("Script generated successfully.");
    res.json({ script: generatedScript });

  } catch (error) {
    console.error('Error calling the AI model:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

