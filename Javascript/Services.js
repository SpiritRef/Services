import { getIni } from './API.js';

// 改用 let，因為之後要重新賦值
let NOVEL_API_URL = "";
let SERVICE_API_URL = ""; 
const iniPath = 'settings/Services.ini'; // 確保路徑正確

let allNotices = [];

async function initApp() {
    try {
        // 修正：直接使用 import 的 getIni，不要加 utils
        const config = await getIni(iniPath);
        
        if (config && config.NOVEL_API_URL && config.SERVICE_API_URL) {
            // 賦值
            NOVEL_API_URL = config.NOVEL_API_URL; 
            SERVICE_API_URL = config.SERVICE_API_URL;
            
            console.log("✅ 系統設定載入成功");
            
            // 確保設定載入後才執行 fetchData
            await fetchData();
        } else {
            throw new Error("INI 設定檔缺少 API 網址");
        }
    } catch (e) {
        console.error("❌ 初始化失敗:", e);
        document.getElementById('announcement-content').innerText = "系統初始化失敗。";
    }
}

async function fetchData() {
    // 抓取公告
    try {
        // 如果 INI 存的是 Base64 才需要 atob，否則直接用
        const NOVEL_API_URL_REAL = (NOVEL_API_URL.startsWith("http")) ? NOVEL_API_URL : atob(NOVEL_API_URL);
        
        const response = await fetch(NOVEL_API_URL_REAL);
        if (!response.ok) throw new Error('連線失敗');
        const data = await response.json();
        
        // 過濾標題
        allNotices = data.filter(item => {
            const title = String(item["標題"] || "");
            return title.includes("公告"); // 使用 includes 增加容錯率
        });
        
        allNotices.sort((a, b) => new Date(b["發佈日期"]) - new Date(a["發佈日期"]));
        renderNotices();
    } catch (e) {
        console.error("公告讀取出錯:", e);
        document.getElementById('announcement-content').innerText = "公告加載失敗。";
    }

    // 抓取服務項目
    try {
        const SERVICE_API_URL_REAL = (SERVICE_API_URL.startsWith("http")) ? SERVICE_API_URL : atob(SERVICE_API_URL);
        
        const serviceRes = await fetch(SERVICE_API_URL_REAL);
        const serviceData = await serviceRes.json();
        
        const container = document.getElementById('services-container');
        if (!container) return;
        
        container.innerHTML = ''; 

        const filteredServices = serviceData.filter(item => {
            const title = String(item["標題"] || "");
            return !title.includes("公告");
        });

        filteredServices.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${item["服務名稱"] || item["標題"] || '專業服務'}</h3>
                <p>${item["服務介紹"] || item["貼文內容"] || '歡迎洽詢。'}</p>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error("服務項目讀取出錯:", e);
        const container = document.getElementById('services-container');
        if (container) container.innerHTML = "<p style='text-align:center;'>服務項目載入失敗。</p>";
    }
}

// renderNotices 保持不變...

initApp();
