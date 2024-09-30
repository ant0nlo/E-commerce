pipeline {
    agent any

    environment {
        // Set environment variables like Docker Hub credentials and repository names
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials' 
        DOCKERHUB_USERNAME = 'ant0nlo'
        
        // Docker images for frontend, backend, and microservices
        FRONTEND_IMAGE = 'ant0nlo/frontend'
        BACKEND_IMAGE = 'ant0nlo/backend'
        PAYMENT_IMAGE = 'ant0nlo/payment-service'
        ORDER_IMAGE = 'ant0nlo/order-service'
        SHIPMENT_IMAGE = 'ant0nlo/shipment-service'
        NOTIFICATION_IMAGE = 'ant0nlo/notification-service'
    }

    stages {
        stage('Checkout') {
            steps {
                // Clone the repository from GitHub (your GitHub URL)
                git 'https://github.com/your-repo/e-commerce-app.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    // Build the backend Docker image
                    dir('backend') { // Navigate to the backend folder
                        sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .'
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    // Build the frontend Docker image
                    dir('frontend') { // Navigate to the frontend folder
                        sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .'
                    }
                }
            }
        }

        stage('Build Payment Service Image') {
            steps {
                script {
                    // Build the payment service Docker image
                    dir('backend/payment-service') { // Navigate to the payment service folder
                        sh 'docker build -t ${PAYMENT_IMAGE}:${BUILD_NUMBER} .'
                    }
                }
            }
        }

        stage('Build Order Service Image') {
            steps {
                script {
                    // Build the order service Docker image
                    dir('backend/order-service') { // Navigate to the order service folder
                        sh 'docker build -t ${ORDER_IMAGE}:${BUILD_NUMBER} .'
                    }
                }
            }
        }

        stage('Build Shipment Service Image') {
            steps {
                script {
                    // Build the shipment service Docker image
                    dir('backend/shipment-service') { // Navigate to the shipment service folder
                        sh 'docker build -t ${SHIPMENT_IMAGE}:${BUILD_NUMBER} .'
                    }
                }
            }
        }

        stage('Build Notification Service Image') {
            steps {
                script {
                    // Build the notification service Docker image
                    dir('backend/notification-service') { // Navigate to the notification service folder
                        sh 'docker build -t ${NOTIFICATION_IMAGE}:${BUILD_NUMBER} .'
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    // Log in to Docker Hub using credentials from Jenkins
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        echo 'Logged in to Docker Hub'
                    }
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                script {
                    // Push the backend Docker image to Docker Hub
                    sh 'docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}'
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                script {
                    // Push the frontend Docker image to Docker Hub
                    sh 'docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}'
                }
            }
        }

        stage('Push Payment Service Image') {
            steps {
                script {
                    // Push the payment service Docker image to Docker Hub
                    sh 'docker push ${PAYMENT_IMAGE}:${BUILD_NUMBER}'
                }
            }
        }

        stage('Push Order Service Image') {
            steps {
                script {
                    // Push the order service Docker image to Docker Hub
                    sh 'docker push ${ORDER_IMAGE}:${BUILD_NUMBER}'
                }
            }
        }

        stage('Push Shipment Service Image') {
            steps {
                script {
                    // Push the shipment service Docker image to Docker Hub
                    sh 'docker push ${SHIPMENT_IMAGE}:${BUILD_NUMBER}'
                }
            }
        }

        stage('Push Notification Service Image') {
            steps {
                script {
                    // Push the notification service Docker image to Docker Hub
                    sh 'docker push ${NOTIFICATION_IMAGE}:${BUILD_NUMBER}'
                }
            }
        }

        stage('Deploy to Cloud') {
            steps {
                script {
                    //commands to deploy your containers.
                    echo "Deploying all services to cloud"
                    sh 'kubectl apply -f k8s/deployment.yaml'
                }
            }
        }
    }

    post {
        always {
            // Clean up any resources
            script {
                sh 'docker system prune -f'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
