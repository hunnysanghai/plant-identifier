// app/api/detect-plant/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'


interface PlantInfo {
  name: string;
  family: string;
  sciname: string;
  maintenance: string;
  soil: string;
  temperature: string;
  benefits: string;
  diagnosis: string;
}

const genAI = new GoogleGenerativeAI("AIzaSyAsoXFxl4AQvUmYI5jGtfzgsISro0f0ONI");

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const arrayBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type
        },
      },
    ];

    const prompt = `Analyze this plant image and provide the following information in JSON format:
    1. Plant Name
    2. Family name and family attributes
    3. Scientific details
    4. Maintenance suggestions in details
    5. Soil requirements, including the type of soil, the amount of nutrients, and the water requirements
    6. Temperature requirements
    7. Medicinal Benefits
    8. Diagnosis for any dieases found in the image

    structure:
    {
      "name": "Plant Name",
      "family": "Plant Family and attributes belonging to the family",
      "sciname": "Scientific Name",
      "maintenance": "Maintenance instruction",
      "soil": "Soil requirements",
      "temperature": "temperature requirements"
      "benefits": "Medicinal Benefits and active chemicals or ingredients for the impact"
      "diagnosis": "any dieases found in the image"
    }

    Respond only with the JSON object, no additional text.`

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    const parsedData = JSON.parse(text) as PlantInfo;
    
    console.log(parsedData.name);
    
    return NextResponse.json(parsedData)
      
    } catch (error) {
      console.error('Error in plant detection:', error)
      return NextResponse.json({ error: 'Failed to process the image' }, { status: 500 })
    }
    }