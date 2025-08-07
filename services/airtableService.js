class AirtableService {
    static API_VERSION = 'v0';
    static SETTINGS_KEY = 'airtableSettings';
    static TABLES = {
        PORTFOLIO: 'Portföy',
        CUSTOMERS: 'Müşteriler'
    };

    static async getSettings() {
        const result = await chrome.storage.local.get(this.SETTINGS_KEY);
        const settings = result[this.SETTINGS_KEY] || {};

        // Önce default ayarları dene
        const finalSettings = {
            apiKey: settings.apiKey || 'pateCb86i3ECLdXbk.56ca1f9cc255f51705f5b7622714c0c9e2dd9058b70b70e0435e12e32d61abf1',
            baseId: settings.baseId || 'appTw5ZE3aCLCG0Jj',
            portfolioTable: settings.portfolioTable || 'Portföy',
            customersTable: settings.customersTable || 'Müşteriler'
        };

        // Tüm gerekli ayarların var olduğunu kontrol et
        if (!finalSettings.apiKey || !finalSettings.baseId || !finalSettings.portfolioTable || !finalSettings.customersTable) {
            throw new Error('Airtable ayarları eksik. Lütfen önce ayarları yapılandırın.');
        }

        return finalSettings;
    }

    static async getBaseUrl(tableName) {
        const settings = await this.getSettings();
        return `https://api.airtable.com/${this.API_VERSION}/${settings.baseId}/${tableName}`;
    }

    static async getHeaders() {
        const settings = await this.getSettings();
        return {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json'
        };
    }
    
    // Portföy tablosu için veri dönüşümü
    static convertToPortfolioFormat(property) {
        return {
            'İlan ID': property.id,
            'Site': property.source,
            'Başlık': property.title,
            'Fiyat': property.price,
            'Konum': property.location,
            'İlan Tarihi': property.listingDate,
            'Metrekare': property.squareMeters,
            'Oda Sayısı': property.rooms,
            'İlan Linki': property.url,
            'Açıklama': property.description,
            'Özellikler': property.features ? property.features.join(', ') : '',
            'Durum': property.status || 'Aktif',
            'Son Kontrol': new Date().toISOString(),
            'Oluşturulma Tarihi': property.createdAt,
            'Güncellenme Tarihi': property.updatedAt
        };
    }

    // Müşteri tablosu için veri dönüşümü
    static convertToCustomerFormat(customer) {
        return {
            'Müşteri ID': customer.id,
            'Ad Soyad': customer.fullName,
            'Telefon': customer.phone,
            'Email': customer.email,
            'İlgilendiği Bölge': customer.interestedLocation,
            'Minimum Fiyat': customer.minPrice,
            'Maksimum Fiyat': customer.maxPrice,
            'İstenen Özellikler': customer.requirements ? customer.requirements.join(', ') : '',
            'Notlar': customer.notes,
            'Son İletişim': customer.lastContact,
            'Durum': customer.status || 'Aktif',
            'Oluşturulma Tarihi': customer.createdAt,
            'Güncellenme Tarihi': customer.updatedAt
        };
    }

    // Portföye kayıt ekleme
    static async createPortfolioRecord(property) {
        try {
            const fields = this.convertToPortfolioFormat(property);
            const baseUrl = await this.getBaseUrl(this.TABLES.PORTFOLIO);
            const headers = await this.getHeaders();

            const response = await fetch(baseUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    records: [{
                        fields
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Airtable error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Kayıt başarıyla oluşturuldu:', result);
            return result.records[0];
        } catch (error) {
            console.error('Airtable kayıt hatası:', error);
            throw error;
        }
    }

    // Portföye toplu kayıt ekleme
    static async createBatchPortfolioRecords(properties) {
        try {
            const chunks = this.chunkArray(properties, 10);
            const allResults = [];
            const baseUrl = await this.getBaseUrl(this.TABLES.PORTFOLIO);
            const headers = await this.getHeaders();

            for (const chunk of chunks) {
                const records = chunk.map(property => ({
                    fields: this.convertToPortfolioFormat(property)
                }));

                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ records })
                });

                if (!response.ok) {
                    throw new Error(`Airtable error! status: ${response.status}`);
                }

                const result = await response.json();
                allResults.push(...result.records);
            }

            console.log('Toplu kayıt başarıyla oluşturuldu:', allResults);
            return allResults;
        } catch (error) {
            console.error('Airtable toplu kayıt hatası:', error);
            throw error;
        }
    }

    // Kayıt güncelleme
    static async updateRecord(recordId, property) {
        try {
            const fields = this.convertToAirtableFormat(property);

            const response = await fetch(`${this.BASE_URL}/${recordId}`, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify({ fields })
            });

            if (!response.ok) {
                throw new Error(`Airtable error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Kayıt başarıyla güncellendi:', result);
            return result;
        } catch (error) {
            console.error('Airtable güncelleme hatası:', error);
            throw error;
        }
    }

    // Kayıt silme
    static async deleteRecord(recordId) {
        try {
            const response = await fetch(`${this.BASE_URL}/${recordId}`, {
                method: 'DELETE',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Airtable error! status: ${response.status}`);
            }

            console.log('Kayıt başarıyla silindi:', recordId);
            return true;
        } catch (error) {
            console.error('Airtable silme hatası:', error);
            throw error;
        }
    }

    // Kayıtları sorgulama
    static async queryRecords(filterFormula = '') {
        try {
            let url = this.BASE_URL;
            if (filterFormula) {
                url += `?filterByFormula=${encodeURIComponent(filterFormula)}`;
            }

            const response = await fetch(url, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Airtable error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.records;
        } catch (error) {
            console.error('Airtable sorgulama hatası:', error);
            throw error;
        }
    }

    // Property objemizi Airtable formatına dönüştürme
    static convertToAirtableFormat(property) {
        // Örnek dönüşüm - projenize göre özelleştirin
        return {
            'İlan ID': property.id,
            'Site': property.source,
            'Başlık': property.title,
            'Fiyat': property.price,
            'Konum': property.location,
            'İlan Tarihi': property.listingDate,
            'Metrekare': property.squareMeters,
            'Oda Sayısı': property.rooms,
            'İlan Linki': property.url,
            'Açıklama': property.description,
            'Özellikler': property.features ? property.features.join(', ') : '',
            'Oluşturulma Tarihi': property.createdAt,
            'Güncellenme Tarihi': property.updatedAt
        };
    }

    // Diziyi belirli boyutta parçalara ayırma
    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Airtable bağlantı testi
    static async checkConnection() {
        try {
            const portfolioUrl = await this.getBaseUrl(this.TABLES.PORTFOLIO);
            const customersUrl = await this.getBaseUrl(this.TABLES.CUSTOMERS);
            const headers = await this.getHeaders();

            // Her iki tabloya da bağlantıyı test et
            const [portfolioResponse, customersResponse] = await Promise.all([
                fetch(portfolioUrl, { 
                    method: 'GET',
                    headers 
                }),
                fetch(customersUrl, { 
                    method: 'GET',
                    headers 
                })
            ]);

            // Her iki tablo da erişilebilir olmalı
            const isConnected = portfolioResponse.ok && customersResponse.ok;
            
            if (!isConnected) {
                const errorMessages = [];
                if (!portfolioResponse.ok) {
                    errorMessages.push(`Portföy tablosu hatası: ${portfolioResponse.status}`);
                }
                if (!customersResponse.ok) {
                    errorMessages.push(`Müşteriler tablosu hatası: ${customersResponse.status}`);
                }
                throw new Error(errorMessages.join(', '));
            }

            return true;
        } catch (error) {
            console.error('Airtable bağlantı hatası:', error);
            throw error; // Hatayı fırlat ki UI'da gösterebilelim
        }
    }
}
