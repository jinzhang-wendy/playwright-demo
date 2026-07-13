// Playwright Demo —— Jenkins Pipeline as Code
// 触发方式：在 Jenkins 中新建 Pipeline 任务，指向本文件（或仓库根目录自动识别）
// 流程：拉代码(GitHub 公开仓库) → 装依赖 → 装浏览器 → 跑测试 → 归档 HTML 报告

pipeline {
    agent any

    // 触发器（Pipeline as Code）：
    // cron —— 每天凌晨 2 点自动跑一遍 E2E 回归（H=哈希分钟，避免整点洪峰）
    // 说明：GitHub push 自动触发（webhook）暂未启用——
    //       本地 Jenkins 在 localhost，暴露到公网有安全风险；
    //       等有服务器 / 稳定公网环境再上。如需"push 即构建"且不暴露，
    //       可在 triggers 改用 pollSCM('H/5 * * * *')（Jenkins 每5分钟主动轮询，零暴露）。
    triggers {
        cron('H 2 * * *')
    }

    environment {
        // 用本机系统级 Node（Apple Silicon 上 Homebrew 装在 /opt/homebrew/bin）
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
        CI   = 'true'   // 让 Playwright 走 CI 模式，不弹交互提示
    }

    stages {
        stage('Checkout') {
            steps {
                // 用 SSH 拉取（凭据 github-ssh 已在 Jenkins 中配置）
                git branch: 'main',
                    url: 'git@github.com:jinzhang-wendy/playwright-demo.git',
                    credentialsId: 'github-ssh'
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
            echo '== 构建结束，归档报告与失败截图（Jenkins 内置步骤，无需额外插件）=='
            // 内置归档，把报告和失败截图留存在构建页 Artifacts 里
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**',
                             allowEmptyArchive: true
        }
        success {
            echo '✅ 全部 E2E 测试通过'
        }
    }
}
