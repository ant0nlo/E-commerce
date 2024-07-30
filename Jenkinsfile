pipeline {
    agent {
        docker {
            image 'ecommbackend'
            args '--network e-comm-network'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // Deploy steps
                }
            }
        }
    }
}
