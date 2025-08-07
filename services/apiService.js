class ApiService {
    static BASE_URL = 'https://api.example.com'; // API'nizin gerçek URL'si ile değiştirin
    
    static async sendData(data) {
        try {
            const response = await fetch(`${this.BASE_URL}/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Gerekli diğer headerlar (örn: Authorization) buraya eklenebilir
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Veri başarıyla gönderildi:', result);
            return result;
        } catch (error) {
            console.error('API hatası:', error);
            throw error;
        }
    }

    static async sendBatchData(dataArray) {
        try {
            const response = await fetch(`${this.BASE_URL}/properties/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ properties: dataArray })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Toplu veri başarıyla gönderildi:', result);
            return result;
        } catch (error) {
            console.error('Toplu veri gönderme hatası:', error);
            throw error;
        }
    }

    static async checkApiStatus() {
        try {
            const response = await fetch(`${this.BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            console.error('API erişim hatası:', error);
            return false;
        }
    }

    // Rate limiting ve yeniden deneme mantığı
    static async sendDataWithRetry(data, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this.sendData(data);
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                if (error.message.includes('429')) { // Rate limit aşıldı
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                    continue;
                }
                throw error;
            }
        }
    }
}
