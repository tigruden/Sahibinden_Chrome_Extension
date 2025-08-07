class StorageService {
    static STORAGE_KEY = 'emlakCrawler';
    
    static async saveProperty(property) {
        try {
            // Mevcut verileri al
            const data = await this.getAllProperties();
            
            // Yeni property'i ekle
            property.id = this.generateId();
            property.createdAt = new Date().toISOString();
            data.push(property);
            
            // Local storage'a kaydet
            await chrome.storage.local.set({ [this.STORAGE_KEY]: data });
            
            console.log('Property başarıyla kaydedildi:', property);
            return property;
        } catch (error) {
            console.error('Storage kayıt hatası:', error);
            throw error;
        }
    }

    static async getAllProperties() {
        try {
            const result = await chrome.storage.local.get(this.STORAGE_KEY);
            return result[this.STORAGE_KEY] || [];
        } catch (error) {
            console.error('Storage okuma hatası:', error);
            throw error;
        }
    }

    static async getPropertyById(id) {
        try {
            const data = await this.getAllProperties();
            return data.find(property => property.id === id);
        } catch (error) {
            console.error('Property bulma hatası:', error);
            throw error;
        }
    }

    static async deleteProperty(id) {
        try {
            const data = await this.getAllProperties();
            const filteredData = data.filter(property => property.id !== id);
            await chrome.storage.local.set({ [this.STORAGE_KEY]: filteredData });
            console.log('Property başarıyla silindi:', id);
        } catch (error) {
            console.error('Property silme hatası:', error);
            throw error;
        }
    }

    static async updateProperty(id, updates) {
        try {
            const data = await this.getAllProperties();
            const index = data.findIndex(property => property.id === id);
            
            if (index === -1) {
                throw new Error('Property bulunamadı');
            }

            data[index] = {
                ...data[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await chrome.storage.local.set({ [this.STORAGE_KEY]: data });
            console.log('Property başarıyla güncellendi:', data[index]);
            return data[index];
        } catch (error) {
            console.error('Property güncelleme hatası:', error);
            throw error;
        }
    }

    static async clearAllData() {
        try {
            await chrome.storage.local.remove(this.STORAGE_KEY);
            console.log('Tüm veriler başarıyla silindi');
        } catch (error) {
            console.error('Veri temizleme hatası:', error);
            throw error;
        }
    }

    static async getStorageUsage() {
        try {
            const data = await this.getAllProperties();
            const usage = new Blob([JSON.stringify(data)]).size;
            return {
                items: data.length,
                sizeInBytes: usage,
                sizeInKB: Math.round(usage / 1024 * 100) / 100
            };
        } catch (error) {
            console.error('Storage kullanım bilgisi hatası:', error);
            throw error;
        }
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Verileri dışa aktarma
    static async exportData() {
        try {
            const data = await this.getAllProperties();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Veri dışa aktarma hatası:', error);
            throw error;
        }
    }

    // Verileri içe aktarma
    static async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (!Array.isArray(data)) {
                throw new Error('Geçersiz veri formatı');
            }
            
            await chrome.storage.local.set({ [this.STORAGE_KEY]: data });
            console.log('Veriler başarıyla içe aktarıldı');
            return data;
        } catch (error) {
            console.error('Veri içe aktarma hatası:', error);
            throw error;
        }
    }
}
