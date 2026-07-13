// Playwright Demo —— Jenkins Pipeline as Code
// 触发方式：在 Jenkins 中新建 Pipeline 任务，指向本文件（或仓库根目录自动识别）
// 流程：拉代码(GitHub 公开仓库) → 装依赖 → 装浏览器 → 跑测试 → 归档 HTML 报告

pipeline {
    agent any

    environment {
        // 用本机系统级 Node（Apple Silicon 上 Homebrew 装在 /opt/homebrew/bin）
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
        CI   = 'true'   // 让 Playwright 走 CI 模式，不弹交互提示
    }

    stages {
        stage('Checkout') {
            steps {
                // 公开仓库，无需凭据即可 clone
                git branch: 'main',
                    url: 'https://github.com/jinzhang-wendy/playwright-demo.git'
                sh 'echo "== 拉取完成，工作区内容：==" && ls -la'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node -v && npm -v'
                // ci 严格按 lock 文件安装，保证可复现
                sh 'npm ci'
            }
        }

        stage('Install Playwright Browser') {
            steps {
                // 安装 Chromium；macOS 上 --with-deps 会顺带装系统依赖
                sh 'npx playwright install --with-deps chromium'
            }
        }

        stage('Run E2E Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            // 把 Playwright 的 HTML 报告挂到 Jenkins 构建页面
            publishHTML(target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
            // 失败截图 / trace 也一并留存
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**',
                             allowEmptyArchive: true
        }
    }
}
