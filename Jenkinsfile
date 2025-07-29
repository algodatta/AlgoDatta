pipeline {
  agent any

  environment {
    REMOTE_HOST = "ubuntu@43.205.125.42"
    SSH_CRED_ID = "sshKeyPair"
  }

  stages {
    stage('Checkout Repo') {
      steps {
        git credentialsId: 'github-access', url: 'https://github.com/algodatta/AlgoDatta.git', branch: 'main'
      }
    }

    stage('Install Docker') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
            ssh -o StrictHostKeyChecking=no $REMOTE_HOST '
              if ! command -v docker >/dev/null 2>&1; then
                echo "Installing Docker..."
                curl -fsSL https://get.docker.com | sh
              else
                echo "Docker is already installed"
              fi
            '
          '''
        }
      }
    }

    stage('Build and Deploy') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
            ssh -o StrictHostKeyChecking=no $REMOTE_HOST '
              if [ ! -d "AlgoDatta" ]; then
                git clone https://github.com/algodatta/AlgoDatta.git
              fi
              cd AlgoDatta
              git reset --hard
              git clean -fd
              git pull origin main
              docker compose -f docker-compose.yml up -d --build --remove-orphans
            '
          '''
        }
      }
    }
  }
}
