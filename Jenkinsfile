pipeline {
    
    agent any

    environment {
        PACKAGE_NAME = "package_${BUILD_ID}.tar.gz"
        BASE_DIR = "/var/www/node/"
        ENV_STORE = "fabien@petitbilly:/home/fabien/env/"
    }

    stages {
        
        stage('Test') {
            steps {
                echo 'Retreive env file'
                sh "scp -BCp -P 979 ${env.ENV_STORE}/node_petitbilly_test.env ${WORKSPACE}/.env"
                echo 'Install modules'
                sh "npm install"
                echo 'Launch test'
                sh 'mocha'
            }
        }

        stage('Empaquetar') {

            when {
                env.BRANCH == 'master'
            }

            steps {
                echo 'Remove module files'
                sh 'rm -df node_modules .env'
                echo 'Retreive production env file'
                sh "scp -BCp -P 979 ${env.ENV_STORE}/node_petitbilly_pro.env ${WORKSPACE}/.env"
                echo "Packaging... ${env.PACKAGE_NAME}"
                sh "tar -czvf ${env.PACKAGE_NAME} *"
            }
        }

        stage('Deploy') {

            when {
                env.BRANCH == 'master'
            }
            
            steps {
                echo "Sending package to ${env.BASE_DIR}/dist/"
                sh "scp -BCp -P 979 ${env.PACKAGE_NAME} fabien@petitbilly:${env.BASE_DIR}/dist/ && rm -f ${env.PACKAGE_NAME}"
                echo "Deflate ${env.BASE_DIR}/dist/${env.PACKAGE_NAME}"
                sh "ssh -l fabien -p 979 petitbilly \"tar -xzvf ${env.BASE_DIR}/dist/${env.PACKAGE_NAME} -C ${env.BASE_DIR}/dist/ && rm -f ${env.BASE_DIR}dist/${env.PACKAGE_NAME}\""
                echo "Install ${env.BASE_DIR}/dist/${env.PACKAGE_NAME}"
                sh "ssh -l fabien -p 979 petitbilly \"cd ${env.BASE_DIR}/dist && npm install\""
                echo "Exchange ${env.BASE_DIR}/dist/ and ${env.BASE_DIR}/monitor/"
                sh "ssh -l fabien -p 979 petitbilly \" \
                        sudo systemctl stop node-monitor \
                        && rm -rf ${env.BASE_DIR}/monitor_old \
                        && mv ${env.BASE_DIR}/monitor ${env.BASE_DIR}/monitor_old \
                        && mv ${env.BASE_DIR}/dist ${env.BASE_DIR}/monitor \
                        && sudo systemctl start node-monitor \""
                echo "Done."                    
            }
        }

        stage('HouseKeeping') {
            steps {
                echo 'Tidying up....'
                cleanWs()
            }
        }
    }
}