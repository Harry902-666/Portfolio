# 陈俊蓉作品集

这是一个无需构建步骤的静态作品集网站。入口为 index.html，项目资料集中维护在 src/projects.js。

## 本地预览

直接打开 index.html，或使用任意静态文件服务器预览。

## 更新作品

在 src/projects.js 中维护分类、介绍、职责、工具与展示链接。图片放在 assets/ 下并使用相对路径引用。视频使用 B 站嵌入播放器，页面不会自动播放。

## 发布

仓库通过 GitHub Pages workflow 部署。将修改推送到 main 分支后会自动发布；视频托管在 B 站，避免将大视频文件提交进 GitHub。作品图片经过压缩后保存在 assets/visual/。
