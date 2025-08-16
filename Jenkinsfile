pipeline {
  agent any
  environment {
    DEPLOY_HOST = credentials('lightsail_host')      // or set as plain text in job
    SSH_KEY_CRED = 'lightsail-ssh'                   // Jenkins SSH credential ID
    REPO_URL = 'https://github.com/algodatta/AlgoDatta.git'
    REPO_DIR = 'AlgoDatta'
  }
  stages {
    stage('Checkout Repo (local)') {
      steps { checkout scm }
    }
    stage('Build & Deploy on Lightsail') {
      steps {
        sshagent (credentials: [SSH_KEY_CRED]) {
          sh '''
            set -e
            ssh -o StrictHostKeyChecking=no ubuntu@$DEPLOY_HOST '
              set -e
              if [ ! -d "$REPO_DIR" ]; then
                git clone '"$REPO_URL"' "$REPO_DIR"
              fi
              cd "$REPO_DIR"
              git reset --hard
              git clean -fd
              git pull origin main

              # Build images
              docker compose -f docker-compose.yml build

              # Ensure DB is up (if using a db service)
              (docker compose up -d db || true)

              # Run Alembic migrations BEFORE starting backend
              docker compose run --rm backend alembic upgrade head

              # Bring up app
              docker compose -f docker-compose.yml up -d --remove-orphans
            '
          '''
        }
      }
    }
  }
}