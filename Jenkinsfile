pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Клонирайте вашето репо
                git 'https://github.com/your-repo.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Инсталирайте зависимости
                script {
                    def node = tool name: 'NodeJS', type: 'NodeJSInstallation'
                    env.PATH = "${node}/bin:${env.PATH}"
                }
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Стартирайте тестовете
                sh 'npm test'
            }
            post {
                always {
                    // Записва тестовите резултати
                    junit 'test-results/*.xml'
                }
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
