# 🕷️ Web Crawler - Smart Data Extraction Browser Extension

> **Extract data from any website with precision and ease**

A powerful Chrome browser extension built with React and Vite that transforms web browsing into intelligent data harvesting. Whether you're conducting research, monitoring competitors, or gathering market intelligence, this tool automates the tedious process of manual data collection.

## ✨ Features

### 🎯 **Intelligent Web Crawling**

- **Automatic Link Discovery**: Intelligently maps and crawls through internal website links
- **Smart Navigation**: Follows website structure while respecting boundaries
- **Real-time Progress Tracking**: Monitor crawling progress with live updates

### 🔍 **Precision Data Extraction**

- **Custom CSS Selectors**: Target exactly the data you need with flexible CSS selectors
- **Structured Data Output**: Extract titles, descriptions, headings, and custom content
- **Batch Processing**: Process multiple pages efficiently in the background

### 🎛️ **Advanced Filtering Controls**

- **Path Filters**: Focus on specific sections of websites (e.g., `/blog/`, `/products/`)
- **Scope Management**: Control crawling depth and breadth
- **Smart Duplicate Prevention**: Avoid processing the same content twice

### 📊 **Comprehensive Reporting**

- **Visual Progress Dashboard**: Track extraction status in real-time
- **Detailed Reports**: Analyze extracted data with built-in reporting tools
- **Export Capabilities**: Download your data in various formats
- **Storage Management**: Monitor and manage local data storage

### 🌍 **Global Ready**

- **Multi-language Support**: Available in English, Spanish, and Portuguese
- **Responsive Design**: Works seamlessly across different screen sizes
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Chrome Browser (Manifest V3 compatible)
- Node.js 16+ and npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/web-crawler.git
   cd web-crawler
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## 🎮 How to Use

1. **📍 Navigate** to any website you want to extract data from
2. **⚙️ Configure** your CSS selectors to target specific content (optional)
3. **🎯 Set** path filters to control which pages to crawl (optional)
4. **🚀 Start** the extraction and watch the magic happen
5. **📈 View** results in the Reports section
6. **💾 Export** your data when complete

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Icons**: React Icons
- **Extension**: Chrome Extension API (Manifest V3)
- **Build**: Vite with optimized bundling

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── pages/              # Application pages/routes
├── services/           # Business logic and APIs
└── utils/              # Helper functions and utilities
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Use Cases

- **📊 Market Research**: Extract product information, pricing, and reviews
- **📰 Content Aggregation**: Gather articles, blog posts, and news content
- **🏢 Lead Generation**: Collect contact information and business details
- **📈 SEO Analysis**: Extract meta tags, headings, and page structure
- **🔍 Competitive Intelligence**: Monitor competitor websites and changes

---

**Ready to transform your web browsing into powerful data collection?** 🚀

_Built with ❤️ by a dev who understands the value of efficient data extraction_
