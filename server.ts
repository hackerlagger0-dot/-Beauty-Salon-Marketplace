import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Error creating Gemini client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. AI features will run in high-quality simulated backup mode.");
}

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large limit for base64 images (hairstyles/skincare uploads)
app.use(express.json({ limit: "15mb" }));

// --- API Endpoints ---

// 1. Chatbot Endpoint
app.post("/api/gemini/chatbot", async (req, res) => {
  const { messages, userContext } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages payload." });
  }

  const latestMessage = messages[messages.length - 1]?.text || "";
  const conversationHistory = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join("\n");

  const prompt = `
You are GlamBot, a friendly and extremely smart AI Beauty & Styling Booking Assistant for our Beauty Salon Marketplace website.
Your objective is to help the user discover salons, decide on hair, makeup, skin, or nail treatments, find active coupon offers, and assist in creating a booking.

Here is the marketplace database context of salons and deals:
- Active Offers:
  1. "GLOWFIRST" - 20% off on first booking (Min value: ₹499)
  2. "SPALUXE" - Flat ₹500 off on Luxury Spa & Facials (Min value: ₹1999)
  3. "HAIRMAGIC" - 15% off on Hair highlights and creative haircuts (Min value: ₹799)

- List of Salons:
  1. Prism Hair & Nail Studio (Bandra, Mumbai) - Precision hair color, balayage, creative cuts, chrome nail extensions. Stylist: Vikram Malhotra (Master Hair Director).
  2. Glow & Co. Luxury Wellness Spa (Indiranagar, Bangalore) - Hydrafacials, Swedish deep tissue massages, Ayurvedic treatments. Therapist: Elena Gilbert (Chief Esthetician).
  3. Radiant Brides Luxury Salon (Karol Bagh, Delhi) - Traditional airbrush bridal makeup, Sangeet styling, Gold facials. Stylist: Aisha Sharma (Celebrity Bridal Stylist).
  4. The Velvet Lounge Salon (Koregaon Park, Pune) - Trends haircuts, aromatherapeutic foot spa, creative nail art. Stylist: Rajesh Kumar.
  5. Urban Edge Barber & Spa (Colaba, Mumbai) - Royal beard trims, hot razor wet shaves, charcoal scalp detoxes. Stylist: Karan Mehra.

User Current Context:
- Active Selected City: ${userContext?.city || "Mumbai"}
- User Coordinates: Lat 19.0544, Lng 72.8402 (Near Bandra, Mumbai)
- User Name: ${userContext?.name || "Guest"}

Please respond to the user's latest query respectfully. Keep your response conversational, concise (max 3 short paragraphs), warm, and suggest 1 or 2 matching salons/services. If the user wants to book, guide them to click "Book Service" directly on the salon's card/profile. Always present the response clearly. Do not use markdown headers or lists that are too lengthy.

Latest User Query: "${latestMessage}"
Conversation History:
${conversationHistory}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini chatbot error:", err);
      return res.json({ 
        text: "I'm having a small glitch connecting to my central beauty base. However, looking at our catalog, I highly recommend checking out " + 
              (userContext?.city === 'Bangalore' ? "Glow & Co. in Indiranagar for therapeutic skincare" : "Prism Hair & Nail Studio in Bandra") + 
              "! Is there a particular styling or skincare service you are seeking today?" 
      });
    }
  } else {
    // Simulated Backup response if Gemini key is not loaded
    const queryLower = latestMessage.toLowerCase();
    
    // 1. Detect city from query or context
    let city = userContext?.city || "Mumbai";
    if (queryLower.includes("mumbai")) {
      city = "Mumbai";
    } else if (queryLower.includes("bangalore") || queryLower.includes("bengaluru") || queryLower.includes("indiranagar")) {
      city = "Bangalore";
    } else if (queryLower.includes("delhi") || queryLower.includes("new delhi") || queryLower.includes("karol bagh")) {
      city = "Delhi";
    } else if (queryLower.includes("pune") || queryLower.includes("koregaon")) {
      city = "Pune";
    }

    // 2. Detect services
    const hasHair = queryLower.includes("hair") || queryLower.includes("cut") || queryLower.includes("balayage") || queryLower.includes("trim") || queryLower.includes("shave") || queryLower.includes("barber");
    const hasSpa = queryLower.includes("spa") || queryLower.includes("massage") || queryLower.includes("reflexology") || queryLower.includes("tissue");
    const hasSkin = queryLower.includes("facial") || queryLower.includes("skin") || queryLower.includes("peel") || queryLower.includes("glow") || queryLower.includes("prep");
    const hasNail = queryLower.includes("nail") || queryLower.includes("acrylic") || queryLower.includes("chrome") || queryLower.includes("gel");
    const hasBridal = queryLower.includes("bridal") || queryLower.includes("wedding") || queryLower.includes("makeup") || queryLower.includes("saree");
    const hasCoupon = queryLower.includes("coupon") || queryLower.includes("offer") || queryLower.includes("discount") || queryLower.includes("promo") || queryLower.includes("deal");

    let text = "";

    if (queryLower.includes("hi") || queryLower.includes("hello") || queryLower.includes("hey")) {
      text = `Hello ${userContext?.name || "there"}! I'm GlamBot. I can help you find premium haircuts, spa therapy, gorgeous nail art, and wedding bridal packages in **${city}**. What are you looking to pamper yourself with today?`;
    } else if (hasCoupon) {
      text = `We have three exclusive coupons today:\n1. **GLOWFIRST**: 20% off for new clients!\n2. **SPALUXE**: Flat ₹500 off on Luxury Spas & Facials.\n3. **HAIRMAGIC**: 15% off on Creative Haircuts & Colors.\nWhich one would you like to use?`;
    } else {
      // Filter salons by city and matching service
      if (city === "Mumbai") {
        if (hasHair && hasNail) {
          text = `In **Mumbai (Bandra)**, I highly recommend **Prism Hair & Nail Studio**! It is Bandra's premier high-concept salon specializing in precision hair color, French Balayage by Vikram Malhotra, and custom chrome nail extensions. You can use coupon **HAIRMAGIC** for 15% off!`;
        } else if (hasHair) {
          text = `For hair services in **Mumbai**, you have two fantastic options:\n1. **Prism Hair & Nail Studio** in Bandra: Famous for precision cuts and Balayage by Vikram Malhotra (use coupon **HAIRMAGIC** for 15% off!).\n2. **Urban Edge Barber & Spa** in Colaba: A luxury gentlemanly lodge for royal beard trims, hot razor wet shaves, and hair combos by Karan Mehra.`;
        } else if (hasNail) {
          text = `For stunning nail art in **Mumbai**, check out **Prism Hair & Nail Studio** in Bandra. Carlos Santana is their senior nail artist, renowned for luxury chrome gel extensions and 3D acrylic art!`;
        } else if (hasSpa || hasSkin) {
          text = `For a relaxing experience in **Mumbai**, **Urban Edge Barber & Spa** in Colaba offers their Men Charcoal Deep Exfoliating Spa and scalp detox combos with hot towels! Or you can also book a deep moisture lock hair spa at **Prism Hair & Nail Studio** in Bandra.`;
        } else {
          text = `I can help you find the best salons in **Mumbai**! We have:\n1. **Prism Hair & Nail Studio** (Bandra) - Best for haircuts, balayage, and custom nail art.\n2. **Urban Edge Barber & Spa** (Colaba) - Best for royal beard trims, razor shaves, and charcoal facials.\nWhat service are you looking to book today?`;
        }
      } else if (city === "Bangalore") {
        if (hasSpa || hasSkin || hasHair || hasNail || hasBridal) {
          text = `In **Bangalore (Indiranagar)**, you must visit **Glow & Co. Luxury Wellness Spa**! Elena Gilbert (Chief Esthetician) is famous for their **Signature HydroPeel Hydrafacial**, and Devendra Gowda offers deeply restorative Swedish Deep Tissue Therapy. Use coupon **SPALUXE** for flat ₹500 off!`;
        } else {
          text = `In **Bangalore**, our top-rated venue is **Glow & Co. Luxury Wellness Spa** in Indiranagar. They offer therapeutic skincare (Signature HydroPeel Hydrafacial) and deep tissue massages. What treatment would you like to inquire about?`;
        }
      } else if (city === "Delhi") {
        if (hasBridal || hasSkin || hasHair || hasNail || hasSpa) {
          text = `For unmatched bridal and sangeet makeovers in **Delhi (Karol Bagh)**, **Radiant Brides Luxury Salon** is spectacular! Aisha Sharma is their celebrity airbrush stylist. They also offer luxurious Gold Facials for an instant skin glow. Use coupon **GLOWFIRST** for 20% off!`;
        } else {
          text = `In **Delhi**, we have **Radiant Brides Luxury Salon** located in Karol Bagh. It's the ultimate destination for premium HD bridal makeups, cocktail looks, and bridal skin prep facials. How can I help you style your special occasion?`;
        }
      } else if (city === "Pune") {
        if (hasHair || hasSpa || hasNail || hasSkin) {
          text = `In **Pune (Koregaon Park)**, the trendiest spot is **The Velvet Lounge Salon**! Rajesh Kumar is a master unisex stylist known for creative haircuts, fades, aromatic foot spas, and custom matte/gloss nail art. Use coupon **HAIRMAGIC** for 15% off!`;
        } else {
          text = `In **Pune**, check out **The Velvet Lounge Salon** in Koregaon Park. They specialize in modern trending haircuts, aromatic foot massage spas, and beautiful nail combos. What would you like to book?`;
        }
      } else {
        text = `I can help you find excellent beauty salons in your city! From precision haircuts at Prism Salon (Mumbai) to Hydrafacials at Glow & Co (Bangalore) and bridal prep at Radiant Brides (Delhi). What service can I help you with today?`;
      }
    }
    return res.json({ text });
  }
});

// 2. Hairstyle Analysis Endpoint
app.post("/api/gemini/hairstyle", async (req, res) => {
  const { imageBase64, selectedStyle, gender } = req.body;

  let contents: any[] = [];
  let userText = `Please analyze a hairstyle recommendation. User gender category: ${gender || "unisex"}. Desired transition style: ${selectedStyle || "Classic Modern Bob"}.`;
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      }
    });
    userText += " I have uploaded my photo for your computer-vision face shape and hair texture analysis.";
  }

  contents.push({ text: `
You are GlamAI, the master virtual hair stylist and recommendation model. 
Evaluate the user's hair request and uploaded selfie structure.
Even if no photo is uploaded, simulate a professional customized assessment based on the requested style: "${selectedStyle}".

Provide your expert response as a clean JSON object with the following structure:
{
  "faceShape": "Oval / Round / Square / Heart / Oblong",
  "suitabilityScore": 92, // integer out of 100
  "stylingAnalysis": "A 2-3 sentence analysis on why this cut suits or matches their face shape and natural volume.",
  "morningRoutine": "A brief 1-sentence tip on how to maintain the bounce or sleekness each morning.",
  "recommendedProducts": ["Product A", "Product B"],
  "matchingSalons": ["Prism Hair & Nail Studio", "The Velvet Lounge Salon"],
  "suggestedStylists": ["Vikram Malhotra", "Rajesh Kumar"]
}

Be encouraging, glamorous, and realistic. Keep descriptions actionable.
` + userText });

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
        }
      });
      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err) {
      console.error("Hairstyle AI error:", err);
      // Fallback response on error
    }
  }

  // Backup Mock response if Gemini client is unavailable or failed
  const faceShapes = ["Oval", "Square", "Round", "Heart"];
  const randomFaceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
  return res.json({
    faceShape: randomFaceShape,
    suitabilityScore: 88 + Math.floor(Math.random() * 10),
    stylingAnalysis: `The requested ${selectedStyle || "Modern Textured Fringe"} highlights your beautiful natural jawline and soft cheekbones perfectly, balancing out your elegant ${randomFaceShape} face profile.`,
    morningRoutine: "Mist with water or lightweight sea salt spray, blow-dry with a round brush from root to tip.",
    recommendedProducts: ["Argan Hydrating Hair Serum", "Volumizing Sea-Salt Texture Spray"],
    matchingSalons: ["Prism Hair & Nail Studio", "The Velvet Lounge Salon"],
    suggestedStylists: ["Vikram Malhotra", "Rajesh Kumar"]
  });
});

// 3. Skincare Routine Advisor Endpoint
app.post("/api/gemini/skincare", async (req, res) => {
  const { skinType, concerns, budget, imageBase64 } = req.body;

  let contents: any[] = [];
  let userText = `Skin Type: ${skinType}. Prime concerns: ${concerns?.join(", ") || "hydration & glow"}. Budget Category: ${budget}.`;

  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      }
    });
    userText += " An image of my face is attached for dermatological surface analysis.";
  }

  contents.push({ text: `
You are DermAI, a virtual skincare esthetician. Create a high-end personal morning/night routine based on the skin type "${skinType}" and concerns "${concerns}".
Provide your analysis and routine as a clean JSON object with the following structure:
{
  "skinAnalysis": "A 2-sentence breakdown of what their skin needs right now (e.g. hydration balance, barrier repair).",
  "morningRoutine": [
    { "step": "Cleanse", "product": "Gentle low-pH Foaming Cleanser", "benefit": "Cleanses oil build-up without stripping" },
    { "step": "Treat", "product": "Vitamin C + Hyaluronic Serum", "benefit": "Brightens tone and boosts collagen" },
    { "step": "Protect", "product": "SPF 50+ Fluid sunscreen", "benefit": "Defends against photo-aging" }
  ],
  "nightRoutine": [
    { "step": "Double Cleanse", "product": "Micellar Oil followed by Gentle wash", "benefit": "Removes SPF and environmental grime" },
    { "step": "Target", "product": "Niacinamide / Retinol treatment", "benefit": "Soothes inflammation or targets lines" },
    { "step": "Moisturize", "product": "Ceramide Barrier Night Cream", "benefit": "Locks in hydration and repairs overnight" }
  ],
  "salonTreatment": "HydroPeel Oxygen Facial or Rose Clay Spa Session",
  "lifestyleTip": "Drink 2.5L water daily and sleep on a silk pillowcase to prevent friction and moisture loss."
}
` + userText });

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
        }
      });
      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err) {
      console.error("Skincare AI error:", err);
    }
  }

  // Backup mock response
  return res.json({
    skinAnalysis: `Your ${skinType} skin is showing a slight moisture barrier deficiency, which explains the ${concerns?.[0] || "dehydration"}. Prioritizing mild humectants and ceramide sealants will quickly restore balance.`,
    morningRoutine: [
      { step: "Cleanse", product: "Hydrating Ceramide Cleanser", benefit: "Purifies gently without affecting natural oils" },
      { step: "Infuse", product: "2% Hyaluronic Acid Serum", benefit: "Plumps epidermal skin cells instantly" },
      { step: "Protect", stepNo: 3, product: "Broad-Spectrum Mattifying SPF 50", benefit: "Prevents ultraviolet cellular damage" }
    ],
    nightRoutine: [
      { step: "Cleanse", product: "Soothing Cleansing Milk", benefit: "Lifts dirt and daily pollutants comfortably" },
      { step: "Rejuvenate", product: "0.2% Gentle retinol or Niacinamide Ampoule", benefit: "Accelerates cell turnover and evens texture" },
      { step: "Seal", product: "Probiotic Night Recovery Cream", benefit: "Restores friendly skin flora and blocks moisture evaporation" }
    ],
    salonTreatment: "Signature HydroPeel Hydrafacial at Glow & Co. Wellness Spa",
    lifestyleTip: "Integrate Omega-3 rich foods like walnuts or flaxseeds to naturally strengthen your sebum lipid barrier."
  });
});

// --- Server & Vite Setup ---

async function startServer() {
  // Setup Vite dev server middleware in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static files serving enabled.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Beauty Salon Marketplace server running on http://localhost:${PORT}`);
  });
}

startServer();
