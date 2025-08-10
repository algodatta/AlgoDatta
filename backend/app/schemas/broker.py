from pydantic import BaseModel
class BrokerProfile(BaseModel):
    name: str = "dhan"
    status: str = "disconnected"
