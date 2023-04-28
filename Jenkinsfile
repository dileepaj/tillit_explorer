pipeline {
  agent any
  tools { nodejs "nodejs-13" }
  stages {
    stage('Build') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm ci'
        sh 'npm run build'
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
          branch 'master'
        }
      }
      steps {
        script {
          def buckets = ['qa.explorer.tillit.world', 'staging.explorer.tillit.world']
          def scripts = ['npm run build -- -c qa --aot', 'npm run build -- -c staging --aot']
          for (int i = 0; i < buckets.size(); ++i) {
            echo 'Uploading to ' + buckets[i]
            sh scripts[i]
            s3Upload(
              consoleLogLevel: 'INFO',
              dontWaitForConcurrentBuildCompletion: false,
              entries: [[
                bucket: buckets[i],
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
    }
  }
  post {
    always {
      echo 'Process finished'
      deleteDir()
    }
  }
}
