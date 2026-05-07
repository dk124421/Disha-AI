from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, AsyncGenerator
import json
import asyncio
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyBv-7jo5BZVJZ50v9mlXGDQHsgT9kPw_Ec"))

app = FastAPI(
    title="Disha AI — AI Service",
    description="Multi-agent AI orchestration for Disha AI platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MODELS ──────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_profile: Optional[dict] = None
    conversation_id: Optional[str] = None

class IkigaiRequest(BaseModel):
    loves: List[str]
    good_at: List[str]
    world_needs: List[str]
    can_earn: List[str]
    user_profile: Optional[dict] = None

class CareerMatchRequest(BaseModel):
    ikigai_analysis: Optional[dict] = None
    personality_scores: Optional[dict] = None
    user_profile: Optional[dict] = None
    interests: Optional[List[str]] = None

class RoadmapRequest(BaseModel):
    career_title: str
    user_profile: Optional[dict] = None
    current_skills: Optional[List[str]] = None
    timeline_weeks: Optional[int] = 24

class OpportunityRequest(BaseModel):
    district: Optional[str] = None
    state: Optional[str] = None
    career_interests: Optional[List[str]] = None
    education_level: Optional[str] = None

# ─── GEMINI HELPERS ──────────────────────────────────────────

def get_gemini_model(model_name: str = "gemini-2.0-flash"):
    return genai.GenerativeModel(model_name)

def build_system_prompt_mentor(user_profile: Optional[dict] = None) -> str:
    profile_context = ""
    if user_profile:
        name = user_profile.get("full_name", "friend")
        location = user_profile.get("location_city", "India")
        education = user_profile.get("education_level", "student")
        profile_context = f"""
You are talking to {name}, a {education} from {location}.
Their interests: {', '.join(user_profile.get('interests', []))}
Their goals: {user_profile.get('life_goals', 'Not specified')}
"""
    return f"""You are Disha, an emotionally intelligent AI career mentor for Indian students and young professionals.

Your personality:
- Warm, encouraging, honest, and deeply empathetic
- You understand the Indian education system, family pressures, and local opportunities
- You speak like a wise senior who genuinely cares
- You give specific, actionable advice — not vague platitudes
- You explain the "why" behind every recommendation
- You understand Tier-2/Tier-3 city challenges
- You balance emotional support with practical strategy

{profile_context}

Guidelines:
- Ask reflective follow-up questions when needed
- Never dismiss any career interest
- Always mention both traditional and emerging paths
- Acknowledge family/societal pressure as real challenges
- Keep responses warm but focused
- Format with clear sections when giving structured advice
- If unsure, say so honestly and guide them to find out

Remember: You are NOT a job portal. You help people discover PURPOSE and DIRECTION."""

# ─── ENDPOINTS ───────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "disha-ai-service", "version": "1.0.0"}

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming AI mentor chat via SSE"""
    
    async def generate() -> AsyncGenerator[str, None]:
        try:
            model = get_gemini_model()
            system_prompt = build_system_prompt_mentor(request.user_profile)
            
            # Build conversation history
            history = []
            for msg in request.messages[:-1]:  # All but last
                history.append({
                    "role": "user" if msg.role == "user" else "model",
                    "parts": [msg.content]
                })
            
            chat = model.start_chat(history=history)
            
            # Add system context to first message if history is empty
            last_msg = request.messages[-1].content
            if not history:
                last_msg = f"{system_prompt}\n\nUser: {last_msg}"
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: chat.send_message(last_msg, stream=True)
            )
            
            for chunk in response:
                if chunk.text:
                    data = json.dumps({"content": chunk.text, "done": False})
                    yield f"data: {data}\n\n"
                    await asyncio.sleep(0)
            
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
        except Exception as e:
            error_data = json.dumps({"error": str(e), "done": True})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/ikigai/analyze")
async def analyze_ikigai(request: IkigaiRequest):
    """Analyze IKIGAI inputs and generate career insights"""
    
    model = get_gemini_model()
    
    prompt = f"""You are an expert IKIGAI career analyst. Analyze this person's IKIGAI inputs and generate career insights.

LOVES (What they love): {', '.join(request.loves)}
GOOD AT (What they're good at): {', '.join(request.good_at)}
WORLD NEEDS (What the world needs): {', '.join(request.world_needs)}
CAN EARN (What they can earn from): {', '.join(request.can_earn)}

{f"User profile: {json.dumps(request.user_profile)}" if request.user_profile else ""}

Respond with a JSON object (no markdown) with this exact structure:
{{
  "ikigai_summary": "2-3 sentence poetic summary of their unique IKIGAI",
  "sweet_spot": "The intersection of all 4 circles - their potential purpose",
  "passion": "Intersection of loves + good at",
  "mission": "Intersection of loves + world needs",
  "vocation": "Intersection of world needs + can earn",
  "profession": "Intersection of good at + can earn",
  "dominant_strength": "Their single biggest strength",
  "career_themes": ["theme1", "theme2", "theme3"],
  "emotional_alignment_score": 85,
  "uniqueness_factor": "What makes them uniquely positioned"
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean markdown if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IKIGAI analysis failed: {str(e)}")

@app.post("/career/match")
async def match_careers(request: CareerMatchRequest):
    """Generate personalized career matches with Reality Scores"""
    
    model = get_gemini_model()
    
    prompt = f"""You are an expert career counselor for Indian students. Generate the top 5 career matches.

User Data:
- IKIGAI Analysis: {json.dumps(request.ikigai_analysis) if request.ikigai_analysis else "Not available"}
- Personality: {json.dumps(request.personality_scores) if request.personality_scores else "Not available"}
- Profile: {json.dumps(request.user_profile) if request.user_profile else "Not available"}
- Interests: {', '.join(request.interests) if request.interests else "Not specified"}

For each career, consider the Indian job market, salary in INR, and opportunities for Tier-2/3 cities.

Respond with JSON only (no markdown):
{{
  "careers": [
    {{
      "title": "Career Title",
      "category": "Technology/Creative/Business/etc",
      "tagline": "One exciting sentence about this career",
      "why_this_fits": "Personalized 2-3 sentence explanation of why THIS person fits this career",
      "reality_scores": {{
        "passion_fit": 85,
        "salary_potential": 70,
        "market_demand": 90,
        "ai_risk": 20,
        "stress_level": 60,
        "difficulty": 65,
        "remote_possibility": 80,
        "future_growth": 88
      }},
      "salary_range": {{"min": 600000, "max": 2000000, "currency": "INR", "unit": "annual"}},
      "top_skills_needed": ["skill1", "skill2", "skill3"],
      "entry_paths": ["path1", "path2"],
      "tier2_opportunities": "How they can pursue this from a Tier-2 city",
      "day_in_life": "Brief description of a typical day"
    }}
  ],
  "recommendation_rationale": "Overall reasoning for these recommendations"
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Career matching failed: {str(e)}")

@app.post("/roadmap/generate")
async def generate_roadmap(request: RoadmapRequest):
    """Generate a personalized learning roadmap"""
    
    model = get_gemini_model()
    
    prompt = f"""Generate a detailed, actionable learning roadmap for someone pursuing: {request.career_title}

Timeline: {request.timeline_weeks} weeks
Current Skills: {', '.join(request.current_skills) if request.current_skills else 'Beginner'}
Profile: {json.dumps(request.user_profile) if request.user_profile else 'Indian student'}

Respond with JSON only (no markdown):
{{
  "title": "Your {request.career_title} Journey",
  "description": "Inspiring 1-2 sentence description",
  "total_weeks": {request.timeline_weeks},
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase Name",
      "duration_weeks": 4,
      "focus": "What to focus on",
      "milestones": [
        {{
          "week": 2,
          "title": "Milestone title",
          "description": "What to achieve",
          "deliverable": "Concrete output",
          "resources": [
            {{"type": "course/book/project", "title": "Resource name", "url": "", "is_free": true}}
          ]
        }}
      ]
    }}
  ],
  "key_certifications": ["cert1", "cert2"],
  "portfolio_projects": [
    {{"title": "Project name", "description": "Brief description", "skills_demonstrated": ["skill1"]}}
  ],
  "monthly_check_ins": ["What to review each month"]
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@app.post("/opportunity/local")
async def find_local_opportunities(request: OpportunityRequest):
    """Find hyper-local opportunities based on location"""
    
    model = get_gemini_model()
    
    location = f"{request.district}, {request.state}" if request.district else request.state or "India"
    
    prompt = f"""Generate realistic local career opportunities for: {location}
Career interests: {', '.join(request.career_interests) if request.career_interests else 'General'}
Education level: {request.education_level or 'Student'}

Focus on: real government schemes, MSME opportunities, remote-friendly gigs, local startups, skill centers.
Make it specific to {location if location != 'India' else 'Tier-2/3 Indian cities'}.

Respond with JSON only (no markdown):
{{
  "location_summary": "Brief overview of opportunities in this location",
  "opportunities": [
    {{
      "title": "Opportunity title",
      "type": "internship/scheme/freelance/startup/skill_center/gig",
      "organization": "Organization name",
      "description": "What this opportunity offers",
      "eligibility": "Who can apply",
      "how_to_access": "Step-by-step how to get this",
      "is_remote": true,
      "potential_earning": "Earning potential",
      "tags": ["tag1", "tag2"]
    }}
  ],
  "government_schemes": [
    {{
      "name": "Scheme name",
      "ministry": "Which ministry",
      "benefit": "What benefit",
      "how_to_apply": "Application process",
      "url": ""
    }}
  ],
  "local_tips": ["Specific advice for this location"]
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Opportunity search failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
