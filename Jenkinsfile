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
              ssh -o StrictHostKeyChecking=no ubuntu@43.205.125.42 'bash -s' <<'BASH'
          set -euo pipefail

          cd ~
          # Clone if missing
          [ -d AlgoDatta ] || git clone https://github.com/algodatta/AlgoDatta.git
          cd AlgoDatta

          # Always deploy the remote HEAD (avoid pull/merge conflicts)
          git fetch origin main
          git reset --hard origin/main
          git clean -fdx

          # Build & start with prod overrides; never pull private images
          docker compose -f docker-compose.yml -f /etc/algodatta/docker-compose.prod.yml \
            up -d --build --remove-orphans

          # Show status
          docker compose ps
          BASH
            '''
        }
      }
    }
  }
}