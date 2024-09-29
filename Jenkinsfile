pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/ant0nlo/E-commerce.git', branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    def node = tool name: 'NodeJS', type: 'NodeJSInstallation'
                    env.PATH = "${node}/bin:${env.PATH}"
                }
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    // save the results
                    junit '**/test-results/*.xml'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                // Docker image
                sh 'docker build -t rabbitmq:latest .'
            }
        }
    }

    post {
        success {
            echo 'Build and tests successful!'
        }
        failure {
            echo 'Build or tests failed.'
        }
    }
}
