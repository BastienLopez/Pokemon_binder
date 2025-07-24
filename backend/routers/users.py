from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_users():
    return {"message": "Endpoint pour récupérer les utilisateurs - à implémenter"}

@router.get("/{user_id}")
async def get_user(user_id: str):
    return {"message": f"Endpoint pour récupérer l'utilisateur {user_id} - à implémenter"}
