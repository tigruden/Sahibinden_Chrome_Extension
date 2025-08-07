class SahibindenHandler {
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
        console.log('Sahibinden.com crawl işlemi başladı');

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

        console.log('Tespit edilen kategoriler:', categories);

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

        console.log('Ana Kategori:', mainCategory);
        console.log('Alt Kategori:', subCategory);

        // Kategoriye göre uygun crawling metodunu çağıracağız
        if (mainCategory === this.CATEGORIES.KONUT.name) {
            console.log('Konut detay sayfası tespit edildi');
            return this.crawlKonut(subCategory);
        } else if (mainCategory === this.CATEGORIES.IS_YERI.name) {
            console.log('İş yeri detay sayfası tespit edildi');
            return this.crawlIsYeri(subCategory);
        } else if (mainCategory === this.CATEGORIES.ARSA.name) {
            console.log('Arsa detay sayfası tespit edildi');
            return this.crawlArsa(subCategory);
        } else if (mainCategory === this.CATEGORIES.BINA.name) {
            console.log('Bina detay sayfası tespit edildi');
            return this.crawlBina();
        } else {
            console.log('Bilinmeyen kategori');
            return null;
        }
    }

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

    static crawlBina() {
        console.log('Bina detayları çekiliyor');
        return this.parseBinaData();
    }

    // Bina veri modeli
    static BinaModel = {
        "Id": null,
        "Portföy Sahibi": null,
        "Kaynak": 'sahibinden.com',
        "Kategori": 'Bina',
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
        "Bina Yaşı": null,
        "Kat Sayısı": null,
        "Isıtma Tipi": null,
        "Banyo Sayısı": null,
        "Balkon": null,
        "Kullanım Durumu": null,
        "Tapu Durumu": null,
        "Kira Getirisi": null,
        "Ada No": null,
        "Parsel No": null,
        "Daire Sayısı": null,
        "Asansör": null,
        "Otopark": null
    };

    // Genel bina parsing fonksiyonu
    static parseBinaData() {
        const model = { ...this.BinaModel };

        try {
            // ID ve başlık bilgisi
            model["Id"] = window.location.pathname.split('/').pop().replace('detay', '').replace(/\//g, '');
            model["Başlık"] = document.querySelector('h1.classifiedDetailTitle h1')?.textContent.trim();

            // Fiyat bilgisi
            model["Fiyat"] = document.querySelector('.classifiedInfo > h3')?.textContent.trim();

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
                    case 'Bina Yaşı':
                        model["Bina Yaşı"] = value;
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
                    case 'Kullanım Durumu':
                        model["Kullanım Durumu"] = value;
                        break;
                    case 'Tapu Durumu':
                        model["Tapu Durumu"] = value;
                        break;
                    case 'Kira Getirisi':
                        model["Kira Getirisi"] = value;
                        break;
                    case 'Ada No':
                        model["Ada No"] = value;
                        break;
                    case 'Parsel No':
                        model["Parsel No"] = value;
                        break;
                    case 'Daire Sayısı':
                        model["Daire Sayısı"] = value;
                        break;
                    case 'Asansör':
                        model["Asansör"] = value === 'Var';
                        break;
                    case 'Otopark':
                        model["Otopark"] = value === 'Var';
                        break;
                    case 'Krediye Uygun':
                        model["Krediye Uygun mu?"] = value === 'Evet';
                        break;
                }
            }

            // Lokasyon bilgisi
            const locationElement = document.querySelector('.classifiedInfo .cityArea');
            if (locationElement) {
                const locationParts = locationElement.textContent.trim().split('/');
                model["İl"] = locationParts[0]?.trim();
                model["İlçe"] = locationParts[1]?.trim();
            }

            // Harita koordinatları
            const mapElement = document.querySelector('#gmap');
            if (mapElement) {
                model["Harita Konumu"] = {
                    lat: mapElement.getAttribute('data-lat'),
                    lng: mapElement.getAttribute('data-lon')
                };
            }

            // İlan tarihi
            const dateElement = document.querySelector('.classifiedInfo .date');
            if (dateElement) {
                model["İlan Tarihi"] = dateElement.textContent.trim();
            }

            // Açıklama
            const descElement = document.querySelector('#classifiedDescription');
            if (descElement) {
                model["Açıklama"] = descElement.textContent.trim();
            }

            console.log('Parsed Bina Data:', model);
            return model;

        } catch (error) {
            console.error('Veri parsing hatası:', error);
            return null;
        }
    }

    // Konut için veri modeli
    static KonutModel = {
        "Id": null,
        "Portföy Sahibi": null,
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
        "Otopark": null
    };

    // Genel konut parsing fonksiyonu
    static parseKonutData() {
        const model = { ...this.KonutModel };

        try {
            // ID ve başlık bilgisi
            model["Id"] = window.location.pathname.split('/').pop().replace('detay', '').replace(/\//g, '');
            model["Başlık"] = document.querySelector('h1.classifiedDetailTitle h1')?.textContent.trim();

            // Fiyat bilgisi
            model["Fiyat"] = document.querySelector('.classifiedInfo > h3')?.textContent.trim();

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
                        model["Krediye Uygun mu?"] = value === 'Evet';
                        break;
                    case 'Ada No':
                        model["Ada No"] = value;
                        break;
                    case 'Parsel No':
                        model["Parsel No"] = value;
                        break;
                }
            }

            // Lokasyon bilgisi
            const locationElement = document.querySelector('.classifiedInfo .cityArea');
            if (locationElement) {
                const locationParts = locationElement.textContent.trim().split('/');
                model["İl"] = locationParts[0]?.trim();
                model["İlçe"] = locationParts[1]?.trim();
            }

            // Harita koordinatları
            const mapElement = document.querySelector('#gmap');
            if (mapElement) {
                model["Harita Konumu"] = {
                    lat: mapElement.getAttribute('data-lat'),
                    lng: mapElement.getAttribute('data-lon')
                };
            }

            // İlan tarihi
            const dateElement = document.querySelector('.classifiedInfo .date');
            if (dateElement) {
                model["İlan Tarihi"] = dateElement.textContent.trim();
            }

            // Açıklama
            const descElement = document.querySelector('#classifiedDescription');
            if (descElement) {
                model["Açıklama"] = descElement.textContent.trim();
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

    // İş yeri veri modeli
    static IsYeriModel = {
        "Id": null,
        "Portföy Sahibi": null,
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
        "Otopark": null
    };

    // Genel iş yeri parsing fonksiyonu
    static parseIsYeriData(subCategory) {
        const model = { ...this.IsYeriModel };

        try {
            // ID ve başlık bilgisi
            model["Id"] = window.location.pathname.split('/').pop().replace('detay', '').replace(/\//g, '');
            model["Başlık"] = document.querySelector('h1.classifiedDetailTitle h1')?.textContent.trim();

            // Fiyat bilgisi
            model["Fiyat"] = document.querySelector('.classifiedInfo > h3')?.textContent.trim();

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
                        model["Krediye Uygun mu?"] = value === 'Evet';
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

            // Lokasyon bilgisi
            const locationElement = document.querySelector('.classifiedInfo .cityArea');
            if (locationElement) {
                const locationParts = locationElement.textContent.trim().split('/');
                model["İl"] = locationParts[0]?.trim();
                model["İlçe"] = locationParts[1]?.trim();
            }

            // Harita koordinatları
            const mapElement = document.querySelector('#gmap');
            if (mapElement) {
                model["Harita Konumu"] = {
                    lat: mapElement.getAttribute('data-lat'),
                    lng: mapElement.getAttribute('data-lon')
                };
            }

            // İlan tarihi
            const dateElement = document.querySelector('.classifiedInfo .date');
            if (dateElement) {
                model["İlan Tarihi"] = dateElement.textContent.trim();
            }

            // Açıklama
            const descElement = document.querySelector('#classifiedDescription');
            if (descElement) {
                model["Açıklama"] = descElement.textContent.trim();
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
        "Portföy Sahibi": null,
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
        "Krediye Uygun mu?": null,
        "Notlar": null,
        "Tapu Durumu": null,
        "Arsa Tipi": null,
        "Ada No": null,
        "Parsel No": null,
        "İmar Durumu": null,
        "Kat Karşılığı mı?": null,
        "Kaks / Emsal": null,
        "Üretilebilecek konut sayısı": null
    };

    // Genel arsa parsing fonksiyonu
    static parseArsaData(subCategory) {
        const model = { ...this.ArsaModel };

        try {
            // ID ve başlık bilgisi
            model["Id"] = window.location.pathname.split('/').pop().replace('detay', '').replace(/\//g, '');
            model["Başlık"] = document.querySelector('h1.classifiedDetailTitle h1')?.textContent.trim();

            // Fiyat bilgisi
            model["Fiyat"] = document.querySelector('.classifiedInfo > h3')?.textContent.trim();

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
                    case 'm²':
                    case 'Brüt m²':
                        model["m² (Brüt)"] = value;
                        break;
                    case 'Arsa Tipi':
                        model["Arsa Tipi"] = value;
                        break;
                    case 'İmar Durumu':
                        model["İmar Durumu"] = value;
                        break;
                    case 'Tapu Durumu':
                        model["Tapu Durumu"] = value;
                        break;
                    case 'Kat Karşılığı':
                        model["Kat Karşılığı mı?"] = value === 'Evet';
                        break;
                    case 'Krediye Uygun':
                        model["Krediye Uygun mu?"] = value === 'Evet';
                        break;
                    case 'Ada No':
                        model["Ada No"] = value;
                        break;
                    case 'Parsel No':
                        model["Parsel No"] = value;
                        break;
                    case 'Kaks (Emsal)':
                    case 'Emsal':
                        model["Kaks / Emsal"] = value;
                        break;
                    case 'Üretilebilecek Konut Sayısı':
                        model["Üretilebilecek konut sayısı"] = value;
                        break;
                }
            }

            // Lokasyon bilgisi
            const locationElement = document.querySelector('.classifiedInfo .cityArea');
            if (locationElement) {
                const locationParts = locationElement.textContent.trim().split('/');
                model["İl"] = locationParts[0]?.trim();
                model["İlçe"] = locationParts[1]?.trim();
            }

            // Harita koordinatları
            const mapElement = document.querySelector('#gmap');
            if (mapElement) {
                model["Harita Konumu"] = {
                    lat: mapElement.getAttribute('data-lat'),
                    lng: mapElement.getAttribute('data-lon')
                };
            }

            // İlan tarihi
            const dateElement = document.querySelector('.classifiedInfo .date');
            if (dateElement) {
                model["İlan Tarihi"] = dateElement.textContent.trim();
            }

            // Açıklama
            const descElement = document.querySelector('#classifiedDescription');
            if (descElement) {
                model["Açıklama"] = descElement.textContent.trim();
            }

            // Alt kategoriyi set et
            model["Alt Kategori"] = subCategory;

            console.log('Parsed Arsa Data:', model);
            return model;

        } catch (error) {
            console.error('Veri parsing hatası:', error);
            return null;
        }
    }
}
