from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db.session import get_db
router = APIRouter()
def _require_admin(user):
    if getattr(user, "role", "user") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return True
@router.get("/health")
def ops_health(user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    import boto3, botocore
    out = {"ses": {}, "cloudwatch": {}}
    try:
        ses = boto3.client("ses", region_name=settings.AWS_REGION)
        q = ses.get_send_quota()
        out["ses"]["quota"] = {"Max24HourSend": q.get("Max24HourSend"),"MaxSendRate": q.get("MaxSendRate"),"SentLast24Hours": q.get("SentLast24Hours")}
    except Exception as e:
        out["ses"]["quota_error"] = str(e)
    try:
        sesv2 = boto3.client("sesv2", region_name=settings.AWS_REGION)
        acct = sesv2.get_account()
        out["ses"]["account"] = {"ProductionAccessEnabled": acct.get("ProductionAccessEnabled"),"SendingEnabled": acct.get("SendingEnabled"),"SuppressionAttributes": acct.get("SuppressionAttributes", {})}
    except Exception as e:
        out["ses"]["account_error"] = str(e)
    try:
        expected = []
        if settings.SES_CONFIG_SET_NAME:
            expected = [f"{settings.SES_CONFIG_SET_NAME}-bounce-rate", f"{settings.SES_CONFIG_SET_NAME}-complaint-rate"]
        cw = boto3.client("cloudwatch", region_name=settings.AWS_REGION)
        alarms = []
        if expected:
            resp = cw.describe_alarms(AlarmNames=expected)
            for a in resp.get("MetricAlarms", []):
                alarms.append({"AlarmName": a.get("AlarmName"),"StateValue": a.get("StateValue"),"StateReason": a.get("StateReason"),"Threshold": a.get("Threshold"),"MetricName": a.get("MetricName")})
        else:
            resp = cw.describe_alarms(MaxRecords=10)
            for a in resp.get("MetricAlarms", []):
                if a.get("Namespace") == "AWS/SES":
                    alarms.append({"AlarmName": a.get("AlarmName"),"StateValue": a.get("StateValue"),"MetricName": a.get("MetricName")})
        out["cloudwatch"]["alarms"] = alarms
    except Exception as e:
        out["cloudwatch"]["error"] = str(e)
    return out
