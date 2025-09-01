
import json

from fastapi import Request



def install(app):

    @app.middleware("http")

    async def _login_form_adapter(request: Request, call_next):

        # Accept /api/v1/auth/login and /login as form posts from the SPA

        if request.method == "POST" and request.url.path in ("/api/v1/auth/login", "/login"):

            ctype = (request.headers.get("content-type") or "").lower()

            if "application/x-www-form-urlencoded" in ctype:

                form = await request.form()

                email = (form.get("email") or form.get("username") or "").strip().lower()

                password = form.get("password")

                body = json.dumps({"email": email, "password": password}).encode()



                async def receive():

                    return {"type": "http.request", "body": body, "more_body": False}



                # Replace body and normalize content-type to JSON

                request._receive = receive

                hdrs, replaced = [], False

                for k, v in request.scope.get("headers", []):

                    if k == b"content-type":

                        hdrs.append((b"content-type", b"application/json"))

                        replaced = True

                    else:

                        hdrs.append((k, v))

                if not replaced:

                    hdrs.append((b"content-type", b"application/json"))

                request.scope["headers"] = hdrs

        return await call_next(request)

