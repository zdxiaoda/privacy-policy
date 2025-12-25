# privacy-policy

适用于 xiaoda.fun 的隐私策略

## 多语言支持 / Multi-language Support / 多言語対応

本隐私政策现已支持中文、英文和日文三种语言，并可轻松扩展至其他语言。

This privacy policy now supports Chinese, English, and Japanese, and can be easily extended to other languages.

このプライバシーポリシーは現在、中国語、英語、日本語をサポートしており、他の言語にも簡単に拡張できます。

### 语言切换 / Language Switching / 言語切り替え

- 访问网站时，系统会根据浏览器语言自动选择合适的语言
- 可以通过页面顶部的语言选择器手动切换语言
- 语言偏好会保存在浏览器本地存储中

### 技术实现 / Technical Implementation / 技術実装

- **i18n/**: 多语言翻译文件目录
  - `zh.json`: 简体中文
  - `en.json`: English
  - `ja.json`: 日本語
- **i18n.js**: 国际化处理脚本，支持：
  - 自动检测浏览器语言
  - 从 URL 参数读取语言设置 (`?lang=en`)
  - LocalStorage 语言偏好存储
  - 动态语言切换

### 添加新语言 / Adding New Languages / 新しい言語の追加

1. 在 `i18n/` 目录下创建新的语言文件（如 `fr.json`）
2. 在 `i18n.js` 中的 `AVAILABLE_LANGUAGES` 数组添加新语言代码
3. 在 `LANGUAGE_NAMES` 对象中添加语言显示名称

