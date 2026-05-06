import { getIni } from './API.js';
const NOVEL_API_URL = "";
const SERVICE_API_URL = ""; 

let allNotices = [];

async function initApp() {
	try {
		const config = await utils.getIni(iniPath);
		NOVEL_API_URL = config.NOVEL_API_URL; 
		SERVICE_API_URL = config.SERVICE_API_URL;
		fetchData();
		console.log("✅ 系統設定載入成功");
	} catch (e) {
		console.error("❌ 初始化失敗:", e);
	}
}
async function fetchData() {
	// 抓取公告
	try {
		const NOVEL_API_URL_REAL = atob(NOVEL_API_URL);
		const response = await fetch(NOVEL_API_URL_REAL);
		if (!response.ok) throw new Error('連線失敗');
		const data = await response.json();
		
		// 修正點：確保欄位名稱 "標題" 完全匹配，並過濾資料
		allNotices = data.filter(item => item["標題"] === "【公告】" || item["標題"] === "公告");
		
		// 排序
		allNotices.sort((a, b) => new Date(b["發佈日期"]) - new Date(a["發佈日期"]));
		
		renderNotices();
	} catch (e) {
		console.error("公告讀取出錯:", e);
		document.getElementById('announcement-content').innerText = "公告加載失敗，請檢查 API 權限。";
	}

	// 抓取服務項目
	try {
		const SERVICE_API_URL_REAL = atob(SERVICE_API_URL);
		const serviceRes = await fetch(SERVICE_API_URL_REAL);
		const serviceData = await serviceRes.json();
		
		const container = document.getElementById('services-container');
		container.innerHTML = ''; 

		// 過濾掉公告標籤的內容
		const filteredServices = serviceData.filter(item => item["標題"] !== "【公告】" && item["標題"] !== "公告");

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
		document.getElementById('services-container').innerHTML = "<p style='text-align:center;'>服務項目載入失敗。</p>";
	}
}

function renderNotices() {
	const content = document.getElementById('announcement-content');
	
	if (allNotices.length === 0) {
		content.innerText = "目前暫無公告。";
		return;
	}

	// 僅在首頁顯示最新 5 筆，且限制字數避免撐開版面
	const displayList = allNotices.slice(0, 5);
	
	content.innerHTML = displayList.map(item => {
		const rawContent = item["貼文內容"] || "";
		// 截斷過長的內容（首頁只看摘要）
		const summary = rawContent.length > 50 ? rawContent.substring(0, 50) + "..." : rawContent;
		const date = item["發佈日期"] ? new Date(item["發佈日期"]).toLocaleDateString() : "未知日期";
		
		return `
			<div class="notice-item">
				<span class="notice-date">[${date}]</span>
				<span>${summary}</span>
			</div>
		`;
	}).join('');
}

initApp();
