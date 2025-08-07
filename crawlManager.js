class CrawlManager {
    static identifySite() {
        const url = window.location.href;
        
        if (url.includes('sahibinden.com')) {
            return 'sahibinden';
        } else if (url.includes('hepsiemlak.com')) {
            return 'hepsiemlak';
        } else if (url.includes('emlakjet.com')) {
            return 'emlakjet';
        }
        return null;
    }

    static isDetailPage() {
        const url = window.location.href;
        
        // Her site için detay sayfası kontrolleri
        switch(this.identifySite()) {
            case 'sahibinden':
                // Detay sayfası kontrolü - URL'in sonunda /detay veya /detay/ var mı?
                return url.endsWith('/detay') || url.endsWith('/detay/');
            
            case 'hepsiemlak':
                // Detay sayfası kontrolü - Başlık elementi var mı?
                const titleElement = document.evaluate(
                    '//*[@id="__layout"]/div/div/section[3]/div[2]/h1',
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                return titleElement !== null;
            
            case 'emlakjet':
                // Detay sayfası kontrolü - Başlık elementi var mı?
                const emlakjetTitleElement = document.evaluate(
                    '//*[@id="content-wrapper"]/div[2]/div[1]/div[1]/h1',
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                return emlakjetTitleElement !== null;
            
            default:
                return false;
        }
    }

    static startCrawling() {
        // Önce hangi sitede olduğumuzu tespit edelim
        const site = this.identifySite();

        // Eğer detay sayfasında değilsek işlem yapmayalım
        if (!this.isDetailPage()) {
            console.log('Bu bir detay sayfası değil');
            return {
                success: false,
                message: 'Bu bir detay sayfası değil',
                site: site
            };
        }
        
        switch(site) {
            case 'sahibinden':
                SahibindenHandler.crawl();
                break;
            
            case 'hepsiemlak':
                console.log('Hepsiemlak.com handler çalıştırılıyor...');
                HepsiEmlakHandler.crawl();
                break;
            
            case 'emlakjet':
                console.log('Emlakjet.com handler çalıştırılıyor...');
                EmlakjetHandler.crawl();
                break;
            
            default:
                console.log('Desteklenmeyen site');
                return {
                    success: false,
                    message: 'Desteklenmeyen site',
                    site: site
                };
        }
    }
}
