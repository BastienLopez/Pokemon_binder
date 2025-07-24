from fastapi import APIRouter

router = APIRouter()

@router.post("/signup")
async def signup():
    return {"message": "Endpoint signup - à implémenter en Phase 2"}

@router.post("/login")
async def login():
    return {"message": "Endpoint login - à implémenter en Phase 2"}

@router.get("/me")
async def get_current_user():
    return {"message": "Endpoint me - à implémenter en Phase 2"}
