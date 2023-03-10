pipeline {
  agent any
  tools { nodejs "nodejs-13" }
  stages {
    stage('Build') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm install'
        script {
          if (env.BRANCH_NAME == "release") {
            sh 'npm run build-prod'
            env.BUCKET_NAME = 'explorer.tillit.world'
          } else if(env.BRANCH_NAME == "qa") {
            sh 'npm run build-qa'
            env.BUCKET_NAME = 'qa.explorer.tillit.world'
          } else if (env.BRANCH_NAME == "staging") {
            sh 'npm run build-staging'
            env.BUCKET_NAME = 'staging.explorer.tillit.world'
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
    stage('Deploy') {
      when {
        anyOf {
          branch 'staging'
          branch 'qa'
          branch 'release'
        }
      }
      steps {
        s3Upload(
          consoleLogLevel: 'INFO',
          dontWaitForConcurrentBuildCompletion: false,
          entries: [[
            bucket: env.BUCKET_NAME,
            excludedFile: '',
            flatten: false,
            gzipFiles: false,
            keepForever: false,
            managedArtifacts: false,
            noUploadOnFailure: true,
            selectedRegion: 'ap-south-1',
            showDirectlyInBrowser: false,
            sourceFile: 'dist/Tillit-Explorer/**',
            storageClass: 'STANDARD',
            uploadFromSlave: false,
            useServerSideEncryption: false
          ]],
          pluginFailureResultConstraint: 'FAILURE',
          profileName: 'tracified-admin-frontend-jenkins-deployer',
          userMetadata: [],
          dontSetBuildResultOnFailure: false
        )
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
