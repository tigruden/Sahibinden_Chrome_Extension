// Airtable ayarlarını yöneten sınıf
class AirtableSettings {
    static SETTINGS_KEY = 'airtableSettings';
    
    // Default ayarlar
    static DEFAULT_SETTINGS = {
        apiKey: 'pateCb86i3ECLdXbk.56ca1f9cc255f51705f5b7622714c0c9e2dd9058b70b70e0435e12e32d61abf1',
        baseId: 'appTw5ZE3aCLCG0Jj',
        portfolioTable: 'Portföy',
        customersTable: 'Müşteriler'
    };

    // Ayarları storage'dan al, yoksa default değerleri kullan
    static async getSettings() {
        try {
            const result = await chrome.storage.local.get(this.SETTINGS_KEY);
            const savedSettings = result[this.SETTINGS_KEY] || {};
            
            // Kaydedilmiş ayarları default ayarlarla birleştir
            return {
                ...this.DEFAULT_SETTINGS,
                ...savedSettings
            };
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
            return this.DEFAULT_SETTINGS;
        }
    }

    // Ayarları storage'a kaydet
    static async saveSettings(settings) {
        try {
            await chrome.storage.local.set({
                [this.SETTINGS_KEY]: settings
            });
            return true;
        } catch (error) {
            console.error('Ayarlar kaydedilirken hata:', error);
            return false;
        }
    }

    // Bağlantıyı test etmek için AirtableService.checkConnection() kullanılıyor
}

// Sayfa yüklendiğinde mevcut ayarları yükle
document.addEventListener('DOMContentLoaded', async () => {
    const settings = await AirtableSettings.getSettings();
    
    // Form alanlarını doldur
    document.getElementById('apiKey').value = settings.apiKey || '';
    document.getElementById('baseId').value = settings.baseId || '';
    document.getElementById('portfolioTable').value = settings.portfolioTable || '';
    document.getElementById('customersTable').value = settings.customersTable || '';
});

// Kaydet butonu işleyicisi
document.getElementById('saveButton').addEventListener('click', async () => {
    const settings = {
        apiKey: document.getElementById('apiKey').value.trim(),
        baseId: document.getElementById('baseId').value.trim(),
        portfolioTable: document.getElementById('portfolioTable').value.trim(),
        customersTable: document.getElementById('customersTable').value.trim()
    };

    // Tüm alanların dolu olduğunu kontrol et
    if (!settings.apiKey || !settings.baseId || !settings.portfolioTable || !settings.customersTable) {
        showStatus('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    // Ayarları kaydet
    const saved = await AirtableSettings.saveSettings(settings);
    if (saved) {
        showStatus('Ayarlar başarıyla kaydedildi!', 'success');
    } else {
        showStatus('Ayarlar kaydedilirken bir hata oluştu!', 'error');
    }
});

// Test butonu işleyicisi
document.getElementById('testButton').addEventListener('click', async () => {
    try {
        const settings = {
            apiKey: document.getElementById('apiKey').value.trim(),
            baseId: document.getElementById('baseId').value.trim(),
            portfolioTable: document.getElementById('portfolioTable').value.trim(),
            customersTable: document.getElementById('customersTable').value.trim()
        };

        // Tüm alanların dolu olduğunu kontrol et
        if (!settings.apiKey || !settings.baseId || !settings.portfolioTable || !settings.customersTable) {
            showStatus('Lütfen tüm alanları doldurun!', 'error');
            return;
        }

        // Önce ayarları geçici olarak kaydet
        await chrome.storage.local.set({
            [AirtableSettings.SETTINGS_KEY]: settings
        });

        // Bağlantıyı test et
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = 'Bağlantı test ediliyor...';
        statusDiv.className = 'status';
        statusDiv.style.display = 'block';

        await AirtableService.checkConnection();
        showStatus('Bağlantı başarılı! Her iki tabloya da erişilebiliyor.', 'success');
        
    } catch (error) {
        showStatus('Bağlantı hatası: ' + error.message, 'error');
    }
});

// Durum mesajını göster
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}
