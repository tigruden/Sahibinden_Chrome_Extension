// Airtable ayarlarının kontrolü
async function checkAirtableSettings() {
    try {
        const result = await chrome.storage.local.get('airtableSettings');
        const settings = result.airtableSettings || {};
        return settings.apiKey && settings.baseId && settings.portfolioTable && settings.customersTable;
    } catch (error) {
        console.error('Ayarlar kontrol edilirken hata:', error);
        return false;
    }
}

// Veri çekme butonu işleyicisi
document.getElementById('startButton').addEventListener('click', async function() {
    const statusDiv = document.getElementById('status');
    
    try {
        // Önce Airtable ayarlarını kontrol et
        const hasSettings = await checkAirtableSettings();
        if (!hasSettings) {
            statusDiv.textContent = 'Lütfen önce Airtable ayarlarını yapılandırın!';
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.color = '#856404';
            return;
        }

        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: [
                'handlers/sahibindenHandler.js',
                'handlers/hepsiEmlakHandler.js',
                'handlers/emlakjetHandler.js',
                'crawlManager.js'
            ]
        });

        const results = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: () => {
                return CrawlManager.startCrawling();
            }
        });

        const result = results[0].result;
        
        if (result && !result.success) {
            statusDiv.textContent = `${result.message} (Site: ${result.site})`;
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.color = '#856404';
            return;
        }

        statusDiv.textContent = 'İşlem başarıyla tamamlandı!';
        statusDiv.style.backgroundColor = '#dff0d8';
        statusDiv.style.color = '#3c763d';
    } catch (error) {
        statusDiv.textContent = 'Hata: ' + error.message;
        statusDiv.style.backgroundColor = '#f2dede';
        statusDiv.style.color = '#a94442';
    }
});

// CSV'ye dönüştürme fonksiyonu
function convertToCSV(properties) {
    // CSV başlıkları
    const headers = [
        'İlan ID',
        'Site',
        'Başlık',
        'Fiyat',
        'Konum',
        'İlan Tarihi',
        'Metrekare',
        'Oda Sayısı',
        'İlan Linki',
        'Açıklama',
        'Özellikler',
        'Oluşturulma Tarihi',
        'Güncellenme Tarihi'
    ];

    // CSV satırları
    const rows = properties.map(property => [
        property.id || '',
        property.source || '',
        property.title || '',
        property.price || '',
        property.location || '',
        property.listingDate || '',
        property.squareMeters || '',
        property.rooms || '',
        property.url || '',
        `"${(property.description || '').replace(/"/g, '""')}"`, // Açıklamadaki tırnak işaretlerini escape et
        `"${(property.features || []).join(', ')}"`,
        property.createdAt || '',
        property.updatedAt || ''
    ]);

    // Başlıkları ve satırları birleştir
    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

// CSV dosyasını indirme fonksiyonu
async function downloadCSV() {
    const statusDiv = document.getElementById('status');
    
    try {
        // Storage'dan verileri al
        const properties = await StorageService.getAllProperties();
        
        if (properties.length === 0) {
            statusDiv.textContent = 'İndirilecek veri bulunamadı!';
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.color = '#856404';
            return;
        }

        // Verileri CSV'ye dönüştür
        const csv = convertToCSV(properties);
        
        // Blob oluştur
        const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        
        // İndirme bağlantısı oluştur ve tıkla
        const downloadLink = document.createElement('a');
        const date = new Date().toISOString().slice(0,10);
        downloadLink.href = url;
        downloadLink.download = `emlak_verileri_${date}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // URL'i temizle
        window.URL.revokeObjectURL(url);
        
        statusDiv.textContent = 'CSV dosyası başarıyla indirildi!';
        statusDiv.style.backgroundColor = '#dff0d8';
        statusDiv.style.color = '#3c763d';

        // 3 saniye sonra mesajı temizle
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.style.backgroundColor = '';
            statusDiv.style.color = '';
        }, 3000);
    } catch (error) {
        statusDiv.textContent = 'Hata: ' + error.message;
        statusDiv.style.backgroundColor = '#f2dede';
        statusDiv.style.color = '#a94442';
    }
}

// Export butonu işleyicisi
document.getElementById('exportButton').addEventListener('click', downloadCSV);

// Ayarlar butonu işleyicisi
document.getElementById('settingsButton').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});
