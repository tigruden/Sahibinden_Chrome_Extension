class SahibindenHandler {
    // Türkiye'deki iller
    static ILLER = [
        'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
        'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
        'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
        'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
        'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
        'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
        'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
        'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye',
        'Düzce'
    ];

    // Ortak yardımcı fonksiyonlar
    static parseCommonData(model) {
        try {
            //#region ID bilgisi
            model["Id"] = window.location.pathname.split('/').pop().replace('detay', '').replace(/\//g, '');
            //#endregion

            //#region Başlık bilgisi
            // Başlık bilgisi
            const titleElement = document.evaluate(
                '//*[@id="classifiedDetail"]/div/div[1]/h1',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            model["Başlık"] = titleElement?.textContent.trim();

            // Açıklama Bilgisi
            const descElement = document.querySelector('#classifiedDescription');
            if (descElement) {
                model["Açıklama"] = descElement.textContent.trim();
            }
            //#endregion

            //#region Portföy Sahibi bilgileri
            // Ad Soyad
            const ownerElement = document.querySelector('.username-info-area h5 span');
            if (ownerElement) {
                // Style elementi içindeki CSS kuralını bulalım
                const styles = document.querySelectorAll('style');
                for (const style of styles) {
                    const styleContent = style.textContent;
                    const classMatch = styleContent.match(/\.([^:]+):before\s*{\s*content:\s*['"]([^'"]+)['"]\s*;?\s*}/);
                    if (classMatch && ownerElement.classList.contains(classMatch[1])) {
                        model["Portföy Sahibi"]["Ad Soyad"] = classMatch[2];
                        break;
                    }
                }
            }
            //#endregion

            //#region Telefon
            const phoneElement = document.querySelector('.pretty-phone-part.show-part span[data-content]');
            if (phoneElement) {
                model["Portföy Sahibi"]["Telefon"] = phoneElement.getAttribute('data-content');
            }
            //#endregion

            //#region Fiyat bilgisi
            if (model["Alt Kategori"] !== "Kat Karşılığı Satılık") {
                let price = document.querySelector('.classifiedInfo > h3 > .classified-price-wrapper')?.textContent.trim();
                price = price.replace(/\./g, '').replace(/,/g, '.').replace(' TL', ''); // Noktaları kaldır, virgülü nokta yap
                model["Fiyat"] = parseInt(price);
            }
            //#endregion

            //#region Harita koordinatları
            const mapElement = document.evaluate(
                '//*[@id="classified-location"]/div[2]/div[2]/a',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;

            if (mapElement) {
                const href = mapElement.getAttribute('href');
                const cbllMatch = href.match(/cbll=([^&]+)/);
                if (cbllMatch) {
                    const coordinates = cbllMatch[1];
                    model["Harita Konumu"] = `${coordinates.split(',')[0]},${coordinates.split(',')[1]}`;
                }
            }
            //#endregion

            //#region  Lokasyon bilgisi
            // Breadcrumb itemlarını bulalım
            const breadcrumbItems = document.evaluate(
                '//*[@id="container"]/div[2]/ul/li[@class="bc-item"]/a',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

            // Breadcrumb'daki tüm metinleri toplayalım
            const items = [];
            for (let i = 0; i < breadcrumbItems.snapshotLength; i++) {
                const item = breadcrumbItems.snapshotItem(i);
                const text = item.textContent.trim();
                items.push(text);
            }

            // İlleri kontrol ederek il ve ilçeyi bulalım
            for (let i = 0; i < items.length; i++) {
                if (this.ILLER.includes(items[i]) && i + 1 < items.length) {
                    model["İl"] = items[i];
                    model["İlçe"] = items[i + 1];
                    break;
                }
            }
            //#endregion
        } catch (error) {
            console.error('Ortak veriler parse edilirken hata:', error);
        }
    }

    // Ana kategoriler
    static CATEGORIES = {
        KONUT: {
            name: 'Konut',
            subCategories: ['Daire', 'Rezidans', 'Müstakil Ev', 'Villa', 'Çiftlik Evi',
                'Köşk & Konak', 'Yalı', 'Yalı Dairesi', 'Yazlık', 'Kooperatif']
        },
        IS_YERI: {
            name: 'İş Yeri',
            subCategories: ['Akaryakıt İstasyonu', 'Apartman Dairesi', 'Atölye', 'AVM', 'Büfe',
                'Büro & Ofis', 'Cafe & Bar', 'Çiftlik', 'Depo & Antrepo', 'Düğün Salonu',
                'Dükkan & Mağaza', 'Enerji Santrali', 'Fabrika & Üretim Tesisi',
                'Garaj & Park Yeri', 'İmalathane', 'İş Hanı Katı & Ofisi', 'Kantin',
                'Kır & Kahvaltı Bahçesi', 'Kıraathane', 'Komple Bina', 'Maden Ocağı',
                'Otopark / Garaj', 'Oto Yıkama & Kuaför', 'Pastane, Fırın & Tatlıcı',
                'Pazar Yeri', 'Plaza', 'Plaza Katı & Ofisi', 'Radyo İstasyonu & TV Kanalı',
                'Restoran & Lokanta', 'Rezidans Katı & Ofisi', 'Sağlık Merkezi',
                'Sinema & Konferans Salonu', 'SPA, Hamam & Sauna', 'Spor Tesisi',
                'Villa', 'Yurt']
        },
        ARSA: {
            name: 'Arsa',
            subCategories: ['Kat Karşılığı Satılık', 'Satılık', 'Kiralık']
        },
        BINA: {
            name: 'Bina',
            subCategories: []
        }
    };

    static crawl() {
        // Breadcrumb itemlarını bulalım
        const breadcrumbItems = document.evaluate(
            '//*[@id="container"]/div[2]/ul/li[@class="bc-item"]/a',
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        // Breadcrumb yolundaki tüm kategorileri toplayalım
        const categories = [];
        for (let i = 0; i < breadcrumbItems.snapshotLength; i++) {
            const item = breadcrumbItems.snapshotItem(i);
            const categoryText = item.textContent.trim();
            categories.push(categoryText);
        }

        // Ana kategoriyi ve alt kategoriyi belirleyelim
        let mainCategory = null;
        let subCategory = null;

        // Ana kategoriyi bul
        for (const category of categories) {
            if (Object.values(this.CATEGORIES).some(c => c.name === category)) {
                mainCategory = category;
            }
        }

        // Alt kategoriyi bul
        if (mainCategory) {
            const categoryData = Object.values(this.CATEGORIES).find(c => c.name === mainCategory);
            for (const category of categories) {
                if (categoryData.subCategories.includes(category)) {
                    subCategory = category;
                    break;
                }
            }
        }

        // Kategoriye göre uygun crawling metodunu çağıracağız
        if (mainCategory === this.CATEGORIES.KONUT.name) {
            return this.crawlKonut(subCategory);
        } else if (mainCategory === this.CATEGORIES.IS_YERI.name) {
            return this.crawlIsYeri(subCategory);
        } else if (mainCategory === this.CATEGORIES.ARSA.name) {
            return this.crawlArsa(subCategory);
        } else if (mainCategory === this.CATEGORIES.BINA.name) {
            return this.crawlBina();
        } else {
            console.log('Bilinmeyen kategori');
            return null;
        }
    }

    //#region Bina Kategorisi Metodları
    static crawlBina() {
        return this.parseBinaData();
    }
    // Bina veri modeli
    static BinaModel = {
        "Id": null,
        "İlan Tarihi": null,
        "Portföy Sahibi": {
            "Ad Soyad": null,
            "Telefon": null
        },
        "Kaynak": 'sahibinden.com',
        "Kategori": 'Bina',
        "Kiralık / Satılık": null,
        "Başlık": null,
        "Açıklama": null,
        "Fiyat": null,
        "m² (Brüt)": null,
        "İl": null,
        "İlçe": null,
        "Harita Konumu": null,
        "Krediye Uygun mu?": null,
        "Bina Yaşı": null,
        "Kat Sayısı": null,
        "Isıtma Tipi": null,
        "Tapu Durumu": null,
        "Asansör": null,
        "Otopark": null,
        "Emlak Tipi": null
    };
    // Genel bina parsing fonksiyonu
    static parseBinaData() {
        const model = { ...this.BinaModel };

        try {
            this.parseCommonData(model);

            // İlan detaylarını XPath ile alalım
            const detailItems = document.evaluate(
                '//*[@id="classifiedDetail"]/div/div[2]/div[2]/ul/li',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );
            // Her bir detay öğesini işleyelim
            for (let i = 0; i < detailItems.snapshotLength; i++) {
                const item = detailItems.snapshotItem(i);
                const strong = item.querySelector('strong');
                const span = item.querySelector('span');
                if (strong && span) {
                    const key = strong.textContent.trim();
                    const value = span.textContent.trim();

                    //model[key] = value;
                    switch (key) {
                        case 'İlan No':
                            model["Id"] = value;
                            break;
                        case 'İlan Tarihi':
                            model["İlan Tarihi"] = value;
                            break;
                        case 'Emlak Tipi':
                            if (value.includes('Satılık')) {
                                model["Kiralık / Satılık"] = 'Satılık';
                            }
                            else if (value.includes('Kiralık')) {
                                model["Kiralık / Satılık"] = 'Kiralık';
                            }
                            model["Emlak Tipi"] = value;
                            break;
                        case 'Kat Sayısı':
                            model["Kat Sayısı"] = value;
                            break;
                        case 'Bir Kattaki Daire':
                            model["Bir Kattaki Daire"] = value;
                            break;
                        case 'Isıtma tipi':
                            model["Isıtma Tipi"] = value;
                            break;
                        case 'm²':
                            model["m² (Brüt)"] = value;
                            break;
                        case 'Bina Yaşı':
                            model["Bina Yaşı"] = value;
                            break;
                        case 'Asansör':
                            model["Asansör"] = value;
                            break;
                        case 'Otopark':
                            model["Otopark"] = value;
                            break;
                        case 'Krediye Uygun':
                            model["Krediye Uygun mu?"] = value;
                            break;
                        case 'Tapu Durumu':
                            model["Tapu Durumu"] = value;
                            break;
                    }
                }
            }
            console.log('Parsed Bina Data:', model);
        } catch (error) {
            console.error('Veri parsing hatası:', error);
            return null;
        }
    }
    //#endregion

    //#region Konut Kategorisi Metodları
    static crawlKonut(subCategory) {
        console.log(`Konut alt kategorisi: ${subCategory}`);

        switch (subCategory) {
            case 'Daire':
                return this.crawlKonutDaire();
            case 'Rezidans':
                return this.crawlKonutRezidans();
            case 'Müstakil Ev':
                return this.crawlKonutMustakilEv();
            case 'Villa':
                return this.crawlKonutVilla();
            case 'Çiftlik Evi':
                return this.crawlKonutCiftlikEvi();
            case 'Köşk & Konak':
                return this.crawlKonutKoskKonak();
            case 'Yalı':
                return this.crawlKonutYali();
            case 'Yalı Dairesi':
                return this.crawlKonutYaliDairesi();
            case 'Yazlık':
                return this.crawlKonutYazlik();
            case 'Kooperatif':
                return this.crawlKonutKooperatif();
            default:
                console.log('Bilinmeyen konut alt kategorisi');
                return null;
        }
    }
    // Konut için veri modeli
    static KonutModel = {
        "Id": null,
        "Portföy Sahibi": {
            "Ad Soyad": null,
            "Telefon": null
        },
        "Kaynak": 'sahibinden.com',
        "Kategori": 'Konut',
        "Alt Kategori": null,
        "Kiralık / Satılık": null,
        "Başlık": null,
        "Açıklama": null,
        "Fiyat": null,
        "m² (Brüt)": null,
        "m² (Net)": null,
        "İl": null,
        "İlçe": null,
        "Harita Konumu": null,
        "İlan Tarihi": null,
        "Krediye Uygun mu?": null,
        "Notlar": null,
        "Oda Sayısı": null,
        "Bina Yaşı": null,
        "Bulunduğu Kat": null,
        "Kat Sayısı": null,
        "Isıtma Tipi": null,
        "Banyo Sayısı": null,
        "Balkon": null,
        "Eşyalı mı?": null,
        "Kullanım Durumu": null,
        "Site İçinde mi?": null,
        "Aidat": null,
        "Tapu Durumu": null,
        "Kira Getirisi": null,
        "Ada No": null,
        "Parsel No": null,
        "Asansör": null,
        "Otopark": null,
        "Emlak Tipi": null
    };

    // Genel konut parsing fonksiyonu
    static parseKonutData() {
        const model = { ...this.KonutModel };

        try {
            // Ortak verileri parse et
            this.parseCommonData(model);

            // İlan tipi (Satılık/Kiralık)
            const breadcrumbs = document.querySelectorAll('.breadcrumb li');
            for (const crumb of breadcrumbs) {
                const text = crumb.textContent.trim();
                if (text.includes('Satılık') || text.includes('Kiralık')) {
                    model["Kiralık / Satılık"] = text;
                    break;
                }
            }

            // İlan detayları
            const detailRows = document.querySelectorAll('.classifiedInfoList .classifiedInfo');
            for (const row of detailRows) {
                const label = row.querySelector('.label')?.textContent.trim();
                const value = row.querySelector('.value')?.textContent.trim();

                switch (label) {
                    case 'Brüt m²':
                        model["m² (Brüt)"] = value;
                        break;
                    case 'Emlak Tipi':
                        if (value.includes('Satılık')) {
                            model["Kiralık / Satılık"] = 'Satılık';
                        }
                        else if (value.includes('Kiralık')) {
                            model["Kiralık / Satılık"] = 'Kiralık';
                        }
                        model["Emlak Tipi"] = value;
                        break;
                    case 'Net m²':
                        model["m² (Net)"] = value;
                        break;
                    case 'Oda Sayısı':
                        model["Oda Sayısı"] = value;
                        break;
                    case 'Bina Yaşı':
                        model["Bina Yaşı"] = value;
                        break;
                    case 'Bulunduğu Kat':
                        model["Bulunduğu Kat"] = value;
                        break;
                    case 'Kat Sayısı':
                        model["Kat Sayısı"] = value;
                        break;
                    case 'Isıtma':
                        model["Isıtma Tipi"] = value;
                        break;
                    case 'Banyo Sayısı':
                        model["Banyo Sayısı"] = value;
                        break;
                    case 'Balkon':
                        model["Balkon"] = value !== 'Yok';
                        break;
                    case 'Eşyalı':
                        model["Eşyalı mı?"] = value === 'Evet';
                        break;
                    case 'Kullanım Durumu':
                        model["Kullanım Durumu"] = value;
                        break;
                    case 'Site İçerisinde':
                        model["Site İçinde mi?"] = value === 'Evet';
                        break;
                    case 'Aidat (TL)':
                        model["Aidat"] = value;
                        break;
                    case 'Tapu Durumu':
                        model["Tapu Durumu"] = value;
                        break;
                    case 'Krediye Uygun':
                        model["Krediye Uygun mu?"] = value;
                        break;
                    case 'Ada No':
                        model["Ada No"] = value;
                        break;
                    case 'Parsel No':
                        model["Parsel No"] = value;
                        break;
                }
            }

            // İlan tarihi
            const dateElement = document.querySelector('.classifiedInfo .date');
            if (dateElement) {
                model["İlan Tarihi"] = dateElement.textContent.trim();
            }

            // Alt kategoriyi set et
            model["Alt Kategori"] = subCategory;

            console.log('Parsed Konut Data:', model);
            return model;

        } catch (error) {
            console.error('Veri parsing hatası:', error);
            return null;
        }
    }

    // Konut alt kategori metodları - Hepsi aynı parser'ı kullanıyor
    static crawlKonutDaire() {
        console.log('Daire detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutRezidans() {
        console.log('Rezidans detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutMustakilEv() {
        console.log('Müstakil Ev detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutVilla() {
        console.log('Villa detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutCiftlikEvi() {
        console.log('Çiftlik Evi detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutKoskKonak() {
        console.log('Köşk & Konak detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutYali() {
        console.log('Yalı detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutYaliDairesi() {
        console.log('Yalı Dairesi detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutYazlik() {
        console.log('Yazlık detayları çekiliyor');
        return this.parseKonutData();
    }

    static crawlKonutKooperatif() {
        console.log('Kooperatif detayları çekiliyor');
        return this.parseKonutData();
    }
    //#endregion

    //#region İş Yeri Kategorisi Metodları
    static crawlIsYeri(subCategory) {
        console.log(`İş yeri alt kategorisi: ${subCategory}`);

        switch (subCategory) {
            case 'Akaryakıt İstasyonu':
                return this.crawlIsYeriAkaryakitIstasyonu();
            case 'Apartman Dairesi':
                return this.crawlIsYeriApartmanDairesi();
            case 'Atölye':
                return this.crawlIsYeriAtolye();
            case 'AVM':
                return this.crawlIsYeriAVM();
            case 'Büfe':
                return this.crawlIsYeriBufe();
            case 'Büro & Ofis':
                return this.crawlIsYeriBuroOfis();
            case 'Cafe & Bar':
                return this.crawlIsYeriCafeBar();
            case 'Çiftlik':
                return this.crawlIsYeriCiftlik();
            case 'Depo & Antrepo':
                return this.crawlIsYeriDepoAntrepo();
            case 'Düğün Salonu':
                return this.crawlIsYeriDugunSalonu();
            case 'Dükkan & Mağaza':
                return this.crawlIsYeriDukkanMagaza();
            case 'Enerji Santrali':
                return this.crawlIsYeriEnerjiSantrali();
            case 'Fabrika & Üretim Tesisi':
                return this.crawlIsYeriFabrikaUretimTesisi();
            case 'Garaj & Park Yeri':
                return this.crawlIsYeriGarajParkYeri();
            case 'İmalathane':
                return this.crawlIsYeriImalathane();
            case 'İş Hanı Katı & Ofisi':
                return this.crawlIsYeriIsHaniKatiOfisi();
            case 'Kantin':
                return this.crawlIsYeriKantin();
            case 'Kır & Kahvaltı Bahçesi':
                return this.crawlIsYeriKirKahvaltiBahcesi();
            case 'Kıraathane':
                return this.crawlIsYeriKiraathane();
            case 'Komple Bina':
                return this.crawlIsYeriKompleBina();
            case 'Maden Ocağı':
                return this.crawlIsYeriMadenOcagi();
            case 'Otopark / Garaj':
                return this.crawlIsYeriOtoparkGaraj();
            case 'Oto Yıkama & Kuaför':
                return this.crawlIsYeriOtoYikamaKuafor();
            case 'Pastane, Fırın & Tatlıcı':
                return this.crawlIsYeriPastaneFirinTatlici();
            case 'Pazar Yeri':
                return this.crawlIsYeriPazarYeri();
            case 'Plaza':
                return this.crawlIsYeriPlaza();
            case 'Plaza Katı & Ofisi':
                return this.crawlIsYeriPlazaKatiOfisi();
            case 'Radyo İstasyonu & TV Kanalı':
                return this.crawlIsYeriRadyoTVKanali();
            case 'Restoran & Lokanta':
                return this.crawlIsYeriRestoranLokanta();
            case 'Rezidans Katı & Ofisi':
                return this.crawlIsYeriRezidansKatiOfisi();
            case 'Sağlık Merkezi':
                return this.crawlIsYeriSaglikMerkezi();
            case 'Sinema & Konferans Salonu':
                return this.crawlIsYeriSinemaKonferansSalonu();
            case 'SPA, Hamam & Sauna':
                return this.crawlIsYeriSPAHamamSauna();
            case 'Spor Tesisi':
                return this.crawlIsYeriSporTesisi();
            case 'Villa':
                return this.crawlIsYeriVilla();
            case 'Yurt':
                return this.crawlIsYeriYurt();
            default:
                console.log('Bilinmeyen iş yeri alt kategorisi');
                return null;
        }
    }
    // İş yeri veri modeli
    static IsYeriModel = {
        "Id": null,
        "Portföy Sahibi": {
            "Ad Soyad": null,
            "Telefon": null
        },
        "Kaynak": 'sahibinden.com',
        "Kategori": 'İş Yeri',
        "Alt Kategori": null,
        "Kiralık / Satılık": null,
        "Başlık": null,
        "Açıklama": null,
        "Fiyat": null,
        "m² (Brüt)": null,
        "m² (Net)": null,
        "İl": null,
        "İlçe": null,
        "Harita Konumu": null,
        "İlan Tarihi": null,
        "Krediye Uygun mu?": null,
        "Notlar": null,
        "Oda Sayısı": null,
        "Bina Yaşı": null,
        "Bulunduğu Kat": null,
        "Kat Sayısı": null,
        "Isıtma Tipi": null,
        "Banyo Sayısı": null,
        "Kullanım Durumu": null,
        "Aidat": null,
        "Tapu Durumu": null,
        "Kira Getirisi": null,
        "Vitrin / Cephe": null,
        "Ada No": null,
        "Parsel No": null,
        "Otopark": null,
        "Emlak Tipi": null
    };

    // Genel iş yeri parsing fonksiyonu
    static parseIsYeriData(subCategory) {
        const model = { ...this.IsYeriModel };

        try {
            // Ortak verileri parse et
            this.parseCommonData(model);

            // İlan tipi (Satılık/Kiralık)
            const breadcrumbs = document.querySelectorAll('.breadcrumb li');
            for (const crumb of breadcrumbs) {
                const text = crumb.textContent.trim();
                if (text.includes('Satılık') || text.includes('Kiralık')) {
                    model["Kiralık / Satılık"] = text;
                    break;
                }
            }

            // İlan detayları
            const detailRows = document.querySelectorAll('.classifiedInfoList .classifiedInfo');
            for (const row of detailRows) {
                const label = row.querySelector('.label')?.textContent.trim();
                const value = row.querySelector('.value')?.textContent.trim();

                switch (label) {
                    case 'Brüt m²':
                        model["m² (Brüt)"] = value;
                        break;
                    case 'Net m²':
                        model["m² (Net)"] = value;
                        break;
                    case 'Oda Sayısı':
                        model["Oda Sayısı"] = value;
                        break;
                    case 'Bina Yaşı':
                        model["Bina Yaşı"] = value;
                        break;
                    case 'Bulunduğu Kat':
                        model["Bulunduğu Kat"] = value;
                        break;
                    case 'Kat Sayısı':
                        model["Kat Sayısı"] = value;
                        break;
                    case 'Isıtma':
                        model["Isıtma Tipi"] = value;
                        break;
                    case 'Banyo Sayısı':
                        model["Banyo Sayısı"] = value;
                        break;
                    case 'Kullanım Durumu':
                        model["Kullanım Durumu"] = value;
                        break;
                    case 'Aidat (TL)':
                        model["Aidat"] = value;
                        break;
                    case 'Tapu Durumu':
                        model["Tapu Durumu"] = value;
                        break;
                    case 'Krediye Uygun':
                        model["Krediye Uygun mu?"] = value;
                        break;
                    case 'Emlak Tipi':
                        if (value.includes('Satılık')) {
                            model["Kiralık / Satılık"] = 'Satılık';
                        }
                        else if (value.includes('Kiralık')) {
                            model["Kiralık / Satılık"] = 'Kiralık';
                        }
                        model["Emlak Tipi"] = value;
                        break;
                    case 'Vitrin':
                    case 'Cephe':
                        model["Vitrin / Cephe"] = value;
                        break;
                    case 'Ada No':
                        model["Ada No"] = value;
                        break;
                    case 'Parsel No':
                        model["Parsel No"] = value;
                        break;
                    case 'Otopark':
                        model["Otopark"] = value === 'Var';
                        break;
                }
            }

            // İlan tarihi
            const dateElement = document.querySelector('.classifiedInfo .date');
            if (dateElement) {
                model["İlan Tarihi"] = dateElement.textContent.trim();
            }

            // Alt kategoriyi set et
            model["Alt Kategori"] = subCategory;

            console.log('Parsed İş Yeri Data:', model);
            return model;

        } catch (error) {
            console.error('Veri parsing hatası:', error);
            return null;
        }
    }

    // İş yeri alt kategori metodları - Tüm metodlar eklendi
    static crawlIsYeriAkaryakitIstasyonu() {
        console.log('Akaryakıt İstasyonu detayları çekiliyor');
        return this.parseIsYeriData('Akaryakıt İstasyonu');
    }

    static crawlIsYeriBuroOfis() {
        console.log('Büro & Ofis detayları çekiliyor');
        return this.parseIsYeriData('Büro & Ofis');
    }

    static crawlIsYeriYurt() {
        console.log('Yurt detayları çekiliyor');
        return this.parseIsYeriData('Yurt');
    }

    static crawlIsYeriBufe() {
        console.log('Büfe detayları çekiliyor');
        return this.parseIsYeriData('Büfe');
    }

    static crawlIsYeriAVM() {
        console.log('AVM detayları çekiliyor');
        // TODO: AVM için özel parsing
    }

    static crawlIsYeriAtolye() {
        console.log('Atölye detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriApartmanDairesi() {
        console.log('Apartman Dairesi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriCafeBar() {
        console.log('Cafe & Bar detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriCiftlik() {
        console.log('Çiftlik detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriDepoAntrepo() {
        console.log('Depo & Antrepo detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriDugunSalonu() {
        console.log('Düğün Salonu detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriDukkanMagaza() {
        console.log('Dükkan & Mağaza detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriEnerjiSantrali() {
        console.log('Enerji Santrali detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriFabrikaUretimTesisi() {
        console.log('Fabrika & Üretim Tesisi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriGarajParkYeri() {
        console.log('Garaj & Park Yeri detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriImalathane() {
        console.log('İmalathane detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriIsHaniKatiOfisi() {
        console.log('İş Hanı Katı / Ofisi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriKantin() {
        console.log('Kantin detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriKirKahvaltiBahcesi() {
        console.log('Kır & Kahvaltı Bahçesi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriKiraathane() {
        console.log('Kıraathane detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriKompleBina() {
        console.log('Komple Bina detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriMadenOcagi() {
        console.log('Maden Ocağı detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriOtoparkGaraj() {
        console.log('Otopark / Garaj detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriOtoYikamaKuafor() {
        console.log('Oto Yıkama & Kuaför detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriPastaneFirinTatlici() {
        console.log('Pastane & Fırın detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriPazarYeri() {
        console.log('Pazar Yeri detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriPlaza() {
        console.log('Plaza detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriPlazaKatiOfisi() {
        console.log('Plaza Katı & Ofisi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriRadyoTVKanali() {
        console.log('Radyo İstasyonu & TV Kanalı detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriRestoranLokanta() {
        console.log('Restoran & LOkanta detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriRezidansKatiOfisi() {
        console.log('Rezidans Katı & Ofisi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriSaglikMerkezi() {
        console.log('Sağlık Merkezi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriSinemaKonferansSalonu() {
        console.log('Sinema & Konferans Salonu detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriSPAHamamSauna() {
        console.log('Spa, Hamam & Sauna detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriSporTesisi() {
        console.log('Spor Tesisi detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }

    static crawlIsYeriVilla() {
        console.log('İşyeri - Villa detayları çekiliyor');
        // TODO: Büro & Ofis için özel parsing
    }
    //#endregion

    //#region Arsa Kategorisi Metodları
    static crawlArsa(subCategory) {
        console.log(`Arsa alt kategorisi: ${subCategory}`);

        switch (subCategory) {
            case 'Satılık':
                return this.crawlArsaSatilik();
            case 'Kiralık':
                return this.crawlArsaKiralik();
            case 'Kat Karşılığı Satılık':
                return this.crawlArsaKatKarsiligi();
            default:
                console.log('Bilinmeyen arsa alt kategorisi');
                return null;
        }
    }
    // Arsa alt kategori metodları
    static crawlArsaSatilik() {
        console.log('Satılık arsa detayları çekiliyor');
        return this.parseArsaData('Satılık');
    }

    static crawlArsaKiralik() {
        console.log('Kiralık arsa detayları çekiliyor');
        return this.parseArsaData('Kiralık');
    }

    static crawlArsaKatKarsiligi() {
        console.log('Kat karşılığı arsa detayları çekiliyor');
        return this.parseArsaData('Kat Karşılığı Satılık');
    }

    // Arsa veri modeli
    static ArsaModel = {
        "Id": null,
        "Portföy Sahibi": {
            "Ad Soyad": null,
            "Telefon": null
        },
        "Kaynak": 'sahibinden.com',
        "Kategori": 'Arsa',
        "Alt Kategori": null,
        "Kiralık / Satılık": null,
        "Başlık": null,
        "Açıklama": null,
        "Fiyat": null,
        "m² (Brüt)": null,
        "İl": null,
        "İlçe": null,
        "Harita Konumu": null,
        "İlan Tarihi": null,
        "Tapu Durumu": null,
        "Ada No": null,
        "Parsel No": null,
        "İmar Durumu": null,
        "Kat Karşılığı mı?": null,
        "Kaks / Emsal": null,
        "Emlak Tipi": null
    };

    // Genel arsa parsing fonksiyonu
    static parseArsaData(subCategory) {
        const model = { ...this.ArsaModel };
        if (subCategory === "Kat Karşılığı Satılık") {
            model["Kat Karşılığı mı?"] = 'Evet';
        }
        else {
            model["Kat Karşılığı mı?"] = 'Hayır';
        }
        try {
            // Alt kategoriyi set et
            model["Alt Kategori"] = subCategory;
            // Ortak verileri parse et
            this.parseCommonData(model);

            // İlan detaylarını XPath ile alalım
            const detailItems = document.evaluate(
                '//*[@id="classifiedDetail"]/div/div[2]/div[2]/ul/li',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

            // Her bir detay öğesini işleyelim
            for (let i = 0; i < detailItems.snapshotLength; i++) {
                const item = detailItems.snapshotItem(i);
                const strong = item.querySelector('strong');
                const span = item.querySelector('span');

                if (strong && span) {
                    const key = strong.textContent.trim();
                    const value = span.textContent.trim();
                    //console.log(`Key: ${key}, Value: ${value}`);
                    switch (key) {
                        case 'İlan No':
                            model["Id"] = value;
                            break;
                        case 'İlan Tarihi':
                            model["İlan Tarihi"] = value;
                            break;
                        case 'Türü':
                        case 'Emlak Tipi':
                            if (value.includes('Satılık')) {
                                model["Kiralık / Satılık"] = 'Satılık';
                            }
                            else if (value.includes('Kiralık')) {
                                model["Kiralık / Satılık"] = 'Kiralık';
                            }
                            model["Emlak Tipi"] = value;
                            break;
                        case 'm²':
                            model["m² (Brüt)"] = value;
                            break;
                        case 'Tapu Durumu':
                            model["Tapu Durumu"] = value;
                            break;
                        case 'Ada No':
                            model["Ada No"] = value;
                            break;
                        case 'Parsel No':
                            model["Parsel No"] = value;
                            break;
                        case 'İmar Durumu':
                            model["İmar Durumu"] = value;
                            break;
                        case 'KAKS (Emsal)':
                        case 'Kaks (Emsal)':
                        case 'Emsal':
                            console.log('Kaks / Emsal:', value);
                            model["Kaks / Emsal"] = value;
                            break;
                        case 'Üretilebilecek Konut Sayısı':
                            model["Üretilebilecek konut sayısı"] = value;
                            break;
                    }
                }
            }


            console.log('Parsed Arsa Data:', model);
        } catch (error) {
            console.error('Arsa data parsing error:', error);
        }

        return model;
    }
    //#endregion
}
