pipeline {
  agent { label 'linux-slave' }
  tools {nodejs "nodejs-13.11.0"}
  stages {
    stage('Build') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm install'
        script {
          if (env.BRANCH_NAME == "release") {
            sh 'npm run build-prod'
          } else if(env.BRANCH_NAME == "qa") {
            sh 'npm run build-qa'
          } else if (env.BRANCH_NAME == "staging") {
            sh 'npm run build-staging'
          } else {
            sh 'npm run build'
          }
        }
      }
    }
    stage('Test') {
      steps {
        sh 'echo test-step'
      }
    }
    stage('Analysis') {
      steps {
        sh 'echo analysis-step'
      }
    }
    stage('Deploy to Staging') {
      when { branch 'staging' }
      steps {
        s3Upload consoleLogLevel: 'INFO', dontWaitForConcurrentBuildCompletion: false, entries: [[bucket: 'staging.explorer.tillit.world', excludedFile: '', flatten: false, gzipFiles: false, keepForever: false, managedArtifacts: false, noUploadOnFailure: true, selectedRegion: 'ap-south-1', showDirectlyInBrowser: false, sourceFile: 'dist/Tillit-Explorer/**', storageClass: 'STANDARD', uploadFromSlave: false, useServerSideEncryption: false]], pluginFailureResultConstraint: 'FAILURE', profileName: 'tracified-admin-frontend-jenkins-deployer', userMetadata: []

      }
    }
    stage('Deploy to QA') {
      when { branch 'qa' }
      steps {
        s3Upload consoleLogLevel: 'INFO', dontWaitForConcurrentBuildCompletion: false, entries: [[bucket: 'qa.explorer.tillit.world', excludedFile: '', flatten: false, gzipFiles: false, keepForever: false, managedArtifacts: false, noUploadOnFailure: true, selectedRegion: 'ap-south-1', showDirectlyInBrowser: false, sourceFile: 'dist/Tillit-Explorer/**', storageClass: 'STANDARD', uploadFromSlave: false, useServerSideEncryption: false]], pluginFailureResultConstraint: 'FAILURE', profileName: 'tracified-admin-frontend-jenkins-deployer', userMetadata: []

      }
    }
    stage('Deploy to Production') {
      when { branch 'release' }
      steps {
        s3Upload consoleLogLevel: 'INFO', dontWaitForConcurrentBuildCompletion: false, entries: [[bucket: 'explorer.tillit.world', excludedFile: '', flatten: false, gzipFiles: false, keepForever: false, managedArtifacts: false, noUploadOnFailure: true, selectedRegion: 'ap-south-1', showDirectlyInBrowser: false, sourceFile: 'dist/Tillit-Explorer/**', storageClass: 'STANDARD', uploadFromSlave: false, useServerSideEncryption: false]], pluginFailureResultConstraint: 'FAILURE', profileName: 'tracified-admin-frontend-jenkins-deployer', userMetadata: []

      }
    }
  }
  post {
    always {
      echo 'Process finished'
      deleteDir()
    }
  }
}