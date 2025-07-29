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

    stage('Install Docker + Reboot') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
          ssh -o StrictHostKeyChecking=no $REMOTE_HOST << 'EOF'
            curl -fsSL https://get.docker.com | sh
            sudo reboot
          EOF
          '''
        }
      }
    }

    stage('Wait for Reboot and Reconnect') {
      steps {
        script {
          timeout(time: 2, unit: 'MINUTES') {
            waitUntil {
              sleep time: 10, unit: 'SECONDS'
              return sh(script: "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $REMOTE_HOST 'echo OK' || exit 1", returnStatus: true) == 0
            }
          }
        }
      }
    }

    stage('Build and Deploy') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
          ssh -o StrictHostKeyChecking=no $REMOTE_HOST << 'EOF'
            cd AlgoDatta || git clone https://github.com/algodatta/AlgoDatta.git && cd AlgoDatta
            git stash || true
            git pull origin main
            docker compose up -d --build --remove-orphans
          EOF
          '''
        }
      }
    }
  }
}
