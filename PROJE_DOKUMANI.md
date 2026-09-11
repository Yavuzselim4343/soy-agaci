# PROJE: Gelişmiş Aile Ağacı ve Aile İlişkileri Web Uygulaması

Sen kıdemli bir full-stack web geliştiricisin. Sıfırdan, modern, kullanışlı, responsive ve profesyonel görünümlü bir **Aile Ağacı / Aile İlişkileri Görselleştirme Web Uygulaması** geliştirmeni istiyorum.

Bu uygulama klasik soy ağacı sitelerinden farklı olacak.

Kullanıcı kişileri kendisi oluşturacak, her kişiye bilgiler verecek ve kişiler arasındaki ilişkileri kendisi tanımlayacak. Uygulama bu ilişkileri görsel bir grafik üzerinde gösterecek.

Amaç, kullanıcının çok büyük ve karmaşık aileleri bile kolayca oluşturabilmesi, düzenleyebilmesi ve görüntüleyebilmesidir.

---

# 1. TEMEL MANTIK

Uygulamanın temelinde iki ana kavram olacak:

1. KİŞİ
2. İLİŞKİ

Örneğin kullanıcı:

Kişi:

- İsim: Zekiye
- Soyisim: Yılmaz
- Rol/Görev: 3 çocuk annesi

oluşturabilir.

Sonra başka bir kişi:

- İsim: Ahmet
- Soyisim: Yılmaz
- Rol/Görev: Baba

oluşturabilir.

Ardından:

Zekiye → Eş → Ahmet

ilişkisini oluşturabilir.

Daha sonra:

Zekiye → Çocuk → Ayşe
Ahmet → Çocuk → Ayşe

gibi ilişkiler eklenebilir.

Grafik otomatik olarak düzenlenmelidir.

---

# 2. ANA EKRAN

Ana ekranın merkezinde büyük bir aile ağacı çalışma alanı bulunmalı.

Örneğin:
```
                     ┌─────────────┐
                     │   ZEKİYE    │
                     │             │
                     │ 3 çocuk     │
                     │ annesi      │
                     └──────┬──────┘
                            │
                           EŞİ
                            │
                     ┌──────┴──────┐
                     │    AHMET    │
                     │             │
                     │    Baba     │
                     └──────┬──────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
             ┌──┴───┐   ┌──┴────┐  ┌───┴──┐
             │ AYŞE │   │MEHMET │  │HASAN │
             └──────┘   └───────┘  └──────┘
```

Bu yapı gerçek web arayüzünde kutular ve SVG/canvas bağlantılarıyla oluşturulmalıdır.

---

# 3. KİŞİ KARTLARI

Her kişi grafik üzerinde bir kart/node olarak gösterilmeli.

Kartta en az:

- İsim
- Soyisim
- Rol/Görev

gösterilebilmeli.

Örneğin:

┌────────────────────┐
│      ZEKİYE        │
│      YILMAZ        │
│                    │
│  3 çocuk annesi    │
└────────────────────┘

İsim büyük ve okunaklı olmalı.

Rol/görev daha küçük yazılmalı.

---

# 4. KİŞİ EKLEME

Ana ekranda belirgin bir:

"+ Kişi Ekle"

butonu bulunmalı.

Tıklandığında bir modal/pencere açılmalı.

Form:

- İsim
- Soyisim
- Lakap
- Doğum tarihi
- Ölüm tarihi
- Rol/Görev
- Açıklama
- Fotoğraf
- Renk
- Notlar

alanlarını içerebilir.

İlk sürümde temel alanlar zorunlu olabilir:

İsim
Soyisim
Rol/Görev

Diğer alanlar isteğe bağlı olmalı.

Kullanıcı:

İsim: Zekiye
Soyisim: Yılmaz
Rol: 3 çocuk annesi

yazıp:

"Kişiyi Ekle"

butonuna basınca kişi grafik üzerinde oluşturulmalı.

---

# 5. KİŞİ DÜZENLEME

Kullanıcı bir kişinin kartına tıkladığında sağ tarafta bir bilgi paneli açılmalı.

Örneğin:

---

Zekiye Yılmaz

Rol:
3 çocuk annesi

Eşi:
Ahmet Yılmaz

Çocukları:
Ayşe
Mehmet
Hasan

Kardeşleri:
Fatma

[ Düzenle ]

[ İlişki Ekle ]

## [ Sil ]

Düzenle butonuna basınca kişinin bilgileri düzenlenebilmeli.

---

# 6. İLİŞKİ SİSTEMİ

Uygulamanın en önemli bölümlerinden biri ilişki sistemidir.

En az şu ilişki türleri bulunmalı:

- Eş
- Çocuk
- Anne
- Baba
- Kardeş
- Dede
- Nine
- Torun
- Amca
- Dayı
- Hala
- Teyze
- Yeğen

Fakat sistem sadece bunlarla sınırlı olmamalı.

Kullanıcı daha sonra özel ilişki türleri de oluşturabilmeli.

---

# 7. İLİŞKİ EKLEME

Bir kişiye tıklandıktan sonra:

"İlişki Ekle"

butonu bulunmalı.

Örneğin:

Kişi:
[ Zekiye Yılmaz ]

İlişki:
[ Eş ▼ ]

Diğer kişi:
[ Ahmet Yılmaz ▼ ]

[ İlişkiyi Oluştur ]

butonu.

İlişki oluşturulduğunda grafik otomatik güncellenmeli.

---

# 8. EŞLERİN YAN YANA OLMASI

BU ÖZELLİK ÇOK ÖNEMLİDİR.

Birbirine "Eş" ilişkisiyle bağlı kişiler grafik üzerinde varsayılan olarak YAN YANA gösterilmelidir.

Örneğin:

┌──────────┐     ┌──────────┐
│ ZEKİYE   │─────│ AHMET    │
└──────────┘ EŞ  └──────────┘

Eşlerden biri yukarıda, diğeri aşağıda olmamalıdır.

Eş ilişkisi oluşturulduğunda layout algoritması bu iki kişiyi aynı yatay seviyede tutmalıdır.

---

# 9. ÇOCUKLARIN YERLEŞİMİ

Eşlerin çocukları varsa çocuklar çiftin altında gösterilmelidir.

Örneğin:
```
                ZEKİYE ─── AHMET
                         │
             ┌───────────┼───────────┐
             │           │           │
           AYŞE        MEHMET       HASAN
```

Çocuklar mümkün olduğunca yatay olarak dengeli dağıtılmalı.

Çocuk sayısı arttığında grafik otomatik genişleyebilmeli.

Örneğin 10 çocuk varsa bütün kartlar üst üste binmemeli.

---

# 10. KARDEŞLER

Kardeşler aynı nesil seviyesinde gösterilmeli.

Örneğin:
```
                     ANNE ─── BABA
                           │
                ┌──────────┼──────────┐
                │          │          │
              ALİ        AYŞE       MEHMET
```

Kardeşlerin aynı yatay seviyede olması tercih edilmeli.

---

# 11. İLİŞKİ ÇİZGİLERİ

İlişki çizgileri birbirinden ayırt edilebilir olmalı.

Örneğin:

Eş:
────────────

Çocuk:
│

Kardeş:

---

Ancak sadece çizgi tipi değil, çizgi RENGİ de değiştirilebilir olmalı.

---

# 12. İLİŞKİ RENKLERİ

Ayarlar bölümünde kullanıcı her ilişki türünün rengini değiştirebilmeli.

Örneğin:

İlişki Renkleri

Eş:
[ Renk seçici ]

Çocuk:
[ Renk seçici ]

Kardeş:
[ Renk seçici ]

Anne:
[ Renk seçici ]

Baba:
[ Renk seçici ]

Dede:
[ Renk seçici ]

Nine:
[ Renk seçici ]

Diğer:
[ Renk seçici ]

Kullanıcı renk seçtiğinde grafik anında güncellenmeli.

---

# 13. İLİŞKİ ÇİZGİSİ AYARLARI

Sadece renk değil:

- Çizgi rengi
- Çizgi kalınlığı
- Çizgi tipi
- Opaklık

ayarlanabilmeli.

Çizgi tipi:

- Düz
- Kesikli
- Noktalı

olabilir.

---

# 14. KİŞİ KARTI RENKLERİ

Kullanıcı isterse kişi kartının rengini de değiştirebilmeli.

Örneğin:

Kart arka planı:
[ Renk seç ]

Kenarlık:
[ Renk seç ]

Metin:
[ Renk seç ]

Ancak varsayılan tasarım sade ve profesyonel olmalı.

---

# 15. GRAFİK HAREKETLERİ

Aile ağacı çalışma alanı:

- Mouse ile sürüklenebilmeli
- Zoom yapılabilmeli
- Zoom out yapılabilmeli
- Ortalanabilmeli
- "Ağacı Ortala" butonu bulunmalı
- "Tümünü Gör" butonu bulunmalı

Büyük ailelerde kullanıcı rahatça gezinmeli.

---

# 16. KİŞİ SÜRÜKLEME

Kullanıcı kişi kartlarını mouse ile sürükleyebilmelidir.

Örneğin:

Zekiye'yi biraz sağa sürüklerse kart oraya taşınmalı.

Bağlantı çizgileri yeni konuma otomatik olarak bağlanmalıdır.

Ancak otomatik yerleşim sistemi kişilerin konumunu sürekli zorla değiştirmemeli.

Kullanıcı elle düzenleme yaptığında bu konum kaydedilmelidir.

---

# 17. OTOMATİK YERLEŞİM

Yeni kişiler ve ilişkiler oluşturulduğunda otomatik layout sistemi kullanılmalı.

Layout şu kurallara mümkün olduğunca uymalı:

1. Eşler yan yana.
2. Çocuklar ebeveynlerin altında.
3. Kardeşler aynı seviyede.
4. Nesiller mümkün olduğunca yatay hizalı.
5. Kartlar üst üste gelmemeli.
6. Çizgiler mümkün olduğunca kesişmemeli.
7. Çok büyük ailelerde bile düzen korunmalı.

Uygun bir graph layout kütüphanesi kullanılabilir.

---

# 18. ARAMA

Üst bölümde arama kutusu bulunmalı.

Örneğin:

[ 🔍 Zekiye ]

yazıldığında Zekiye isimli kişiler bulunmalı.

Sonuçlardan birine tıklandığında grafik o kişiye odaklanmalı.

---

# 19. KİŞİLER LİSTESİ

İstenirse sağ veya sol panel açılabilmeli.

Örneğin:

KİŞİLER

🔍 Ara...

- Ahmet Yılmaz
- Ayşe Yılmaz
- Fatma Yılmaz
- Hasan Yılmaz
- Mehmet Yılmaz
- Zekiye Yılmaz

Bir kişiye tıklanınca grafik o kişiye odaklanmalı.

---

# 20. İLİŞKİLERİN ÇİFT TARAFLI MANTIĞI

İlişkiler mantıksal olarak doğru çalışmalı.

Örneğin:

Zekiye → Eş → Ahmet

eklendiğinde sistem otomatik olarak:

Ahmet → Eş → Zekiye

ilişkisini de kabul etmeli.

Aynı şekilde:

Ahmet → Çocuk → Mehmet

oluşturulursa Mehmet'in ebeveyni olarak Ahmet gösterilebilmeli.

Veritabanında ilişkiyi tek yönlü veya çift kayıt şeklinde nasıl saklayacağın konusunda doğru veri modeli kullanılmalı.

---

# 21. VERİ MODELİ

Temel veri yapısı şu mantığa sahip olabilir:

Person:

id
firstName
lastName
role
nickname
birthDate
deathDate
description
photo
cardColor
positionX
positionY
createdAt
updatedAt

Relationship:

id
sourcePersonId
targetPersonId
type
color
lineStyle
lineWidth
createdAt

RelationshipType:

id
name
color
lineStyle
lineWidth

Bu yapı ileride yeni ilişki türleri eklenmesine izin vermeli.

---

# 22. VERİLERİN KAYDEDİLMESİ

Sayfa yenilendiğinde bilgiler kaybolmamalı.

İlk sürümde localStorage kullanılabilir.

Fakat mimari ileride gerçek veritabanına geçmeye uygun hazırlanmalı.

Örneğin ileride:

PostgreSQL / SQLite / Supabase

gibi bir sistem eklenebilmeli.

Şimdilik gereksiz yere backend karmaşıklığı oluşturma.

Önce sağlam çalışan frontend uygulamasını oluştur.

---

# 23. DOSYA / VERİ AKTARIMI

İleride kullanılabilecek şekilde:

"Verileri dışa aktar"

özelliği eklenebilir.

JSON formatında dışa aktarılabilmeli.

Örneğin:

aile.json

Dosya tekrar içeri aktarılabilmeli.

"İçe Aktar"

butonuyla eski aile ağacı geri yüklenebilmeli.

---

# 24. GERİ AL / YİNELE

Kullanıcı yanlışlıkla:

- kişi silerse
- ilişki silerse
- kişi taşısa
- bilgi değiştirse

CTRL + Z ile geri alabilmesi çok faydalı olur.

Mümkünse Undo / Redo sistemi ekle.

---

# 25. KİŞİ SİLME

Bir kişi silinirken kullanıcıdan onay istenmeli.

Örneğin:

"Zekiye Yılmaz kişisini silmek istediğinize emin misiniz?"

[ Vazgeç ]

[ Sil ]

Kişi silindiğinde o kişiye bağlı ilişkiler de düzgün şekilde temizlenmeli.

---

# 26. İLİŞKİ SİLME

Kullanıcı iki kişi arasındaki çizgiye tıklayarak ilişkiyi seçebilmeli.

Bir bilgi panelinde:

İlişki:
Zekiye → Eş → Ahmet

[ İlişkiyi Düzenle ]

[ İlişkiyi Sil ]

butonları bulunabilir.

---

# 27. MOBİL UYUMLULUK

Web sitesi responsive olmalı.

Masaüstünde:

Sol panel | Grafik | Sağ panel

şeklinde kullanılabilir.

Mobilde:

Grafik tam ekran olmalı.

Paneller drawer/modal şeklinde açılmalı.

Touch ile:

- sürükleme
- zoom
- seçim

desteklenmeli.

---

# 28. TASARIM

Tasarım modern ve sade olmalı.

Aşırı renkli ve karmaşık bir arayüz istemiyorum.

Modern SaaS uygulamalarına benzeyen temiz bir tasarım istiyorum.

Örneğin:

- Yuvarlatılmış kartlar
- Hafif gölgeler
- Temiz typography
- Açık arka plan
- Net butonlar
- Modern modal pencereler
- Tutarlı spacing

kullanılabilir.

---

# 29. DARK MODE

Ayarlar bölümünden:

Açık Tema
Koyu Tema
Sistem Teması

seçilebilmesi iyi olur.

Tema tercihi kaydedilmeli.

---

# 30. AYARLAR

Ayarlar sayfası/paneli bulunmalı.

İçinde:

GENEL

- Tema
- Dil
- Varsayılan zoom

AĞAÇ

- Otomatik yerleşim
- Kart boyutu
- Yazı boyutu
- Nesiller arası mesafe
- Kişiler arası mesafe

İLİŞKİLER

- Eş çizgi rengi
- Çocuk çizgi rengi
- Kardeş çizgi rengi
- Anne çizgi rengi
- Baba çizgi rengi
- Diğer ilişki renkleri
- Çizgi kalınlığı
- Çizgi tipi

olabilir.

---

# 31. ÖZEL İLİŞKİ TÜRLERİ

Kullanıcı yeni ilişki türü oluşturabilmeli.

Örneğin:

"İlk eşi"

"Üvey çocuk"

"Evlatlık"

"Bakımını üstlenen"

gibi.

Form:

İlişki adı:
[ Üvey çocuk ]

Renk:
[ renk seç ]

Çizgi tipi:
[ Kesikli ]

[ Oluştur ]

Bu ilişki daha sonra ilişki ekleme menüsünde görünmeli.

---

# 32. KİŞİ GÖREV / ROL SİSTEMİ

Kişinin rolü ilişkiden bağımsız olmalı.

Örneğin:

Zekiye

Rol:
"3 çocuk annesi"

Ahmet

Rol:
"Ailenin büyüğü"

Ayşe

Rol:
"Doktor"

gibi.

Bir kişinin birden fazla rolü olabilmesi daha sonra eklenebilir.

Örneğin:

- Anne
- Öğretmen
- Ailenin en büyük kızı

---

# 33. ÖNEMLİ: "GÖREV" İLE "İLİŞKİ" AYRI OLMALI

Bu ayrımı özellikle koru.

"3 çocuk annesi" bir ilişki değildir.

Bu kişinin rol/açıklama bilgisidir.

"Eşi Ahmet" ise ilişkidir.

Bu nedenle veri modelinde bunları birbirine karıştırma.

---

# 34. BÜYÜK AİLELER

Sistem 10-20 kişilik küçük ailelerle sınırlı kalmamalı.

100+ kişinin bulunduğu ailelerde de çalışabilecek şekilde tasarlanmalı.

Grafik performansına dikkat et.

Gereksiz React render işlemlerinden kaçın.

---

# 35. TEK BİR AİLE AĞACI

İlk versiyonda kullanıcı tek bir aile ağacı üzerinde çalışabilir.

Fakat mimari ileride kullanıcının:

- Yeni aile oluşturması
- Aile ağacını isimlendirmesi
- Birden fazla aile kaydetmesi

gibi özellikleri eklenebilecek şekilde hazırlanmalı.

---

# 36. KAYDETME

Ana ekranda:

[ Kaydet ]

butonu olabilir.

Ancak localStorage kullanılıyorsa değişiklikleri otomatik kaydetmek daha iyi olabilir.

Kullanıcı sayfayı kapatıp tekrar açtığında aile ağacı kaldığı yerden gelmeli.

---

# 37. KOD KALİTESİ

Kod kesinlikle tek bir devasa dosyadan oluşmamalı.

Component'lere ayır.

Örneğin:

components/
PersonNode
RelationshipEdge
PersonForm
RelationshipForm
PersonPanel
SettingsPanel
SearchBar
PeopleList
Toolbar
FamilyTreeCanvas

hooks/
useFamilyTree
useLocalStorage
useHistory

utils/
layout
relationships
exportImport

types/
familyTree

gibi mantıklı bir yapı kullanılabilir.

---

# 38. TEKNOLOJİ SEÇİMİ

Modern ve sürdürülebilir teknolojiler kullan.

Tercihim:

React
TypeScript
React Flow
Tailwind CSS

Kullanılan kütüphanelerin güncel ve birbiriyle uyumlu sürümlerini seç.

Eğer daha iyi bir alternatif olduğunu düşünüyorsan, nedenini açıklayarak kullanabilirsin.

---

# 39. REACT FLOW

Grafik sistemi için mümkünse React Flow / güncel React Flow ekosistemini kullan.

Node'lar:

PersonNode

Edge'ler:

RelationshipEdge

olabilir.

Custom node ve custom edge kullanarak:

- kişi kartı
- ilişki etiketi
- renkli çizgi
- çizgi tipi
- çizgi kalınlığı

özelliklerini kontrol et.

---

# 40. İLİŞKİ ETİKETLERİ

Çizgilerin üzerinde ilişki adı gösterilebilmeli.

Örneğin:

Zekiye ─── EŞİ ─── Ahmet

veya:

Zekiye
│
ÇOCUĞU
│
Ayşe

Kullanıcı ayarlardan ilişki isimlerinin çizgi üzerinde gösterilip gösterilmeyeceğini seçebilmeli.

---

# 41. GÖRSEL HİYERARŞİ

Grafik şu mantığa sahip olmalı:

Üst nesil
↓
Anne/Baba
↓
Çocuklar
↓
Torunlar

Ama eşler aynı nesil seviyesinde yan yana olmalı.

Örneğin:
```
          DEDE ─── NİNE
                   │
            ┌──────┴──────┐
            │             │
         AHMET          FATMA
            │
         ZEKİYE
            │
      ┌─────┼─────┐
      │     │     │
    AYŞE  MEHMET HASAN
```

Ancak Zekiye ve Ahmet eş ise:
```
         AHMET ─── ZEKİYE
                   │
            ┌──────┼──────┐
            │      │      │
          AYŞE   MEHMET  HASAN
```

şeklinde olmalı.

---

# 42. KULLANICI DENEYİMİ

Uygulama ilk açıldığında boş bir ekran yerine kullanıcıya:

"Ailenizi oluşturmaya başlayın"

mesajı göster.

[ İlk Kişiyi Ekle ]

butonu koy.

İlk kişi oluşturulduktan sonra kullanıcıya ilişki eklemeyi kolaylaştır.

---

# 43. HIZLI İLİŞKİ EKLEME

Kişi kartına sağ tıklandığında veya küçük bir "+" butonuna basıldığında:

- Eş Ekle
- Çocuk Ekle
- Kardeş Ekle
- Anne Ekle
- Baba Ekle
- İlişki Ekle

menüsü açılabilir.

Örneğin:

Zekiye kartındaki "+" → "Eş Ekle"

seçildiğinde:

"Yeni kişi oluştur"

veya

"Mevcut kişiyi seç"

seçenekleri gösterilebilir.

---

# 44. YENİ KİŞİ OLUŞTURARAK İLİŞKİ EKLEME

Örneğin Zekiye'ye eş eklerken:

[ Eş Ekle ]

açılır.

İki seçenek:

( ) Mevcut kişiyi seç
( ) Yeni kişi oluştur

"Yeni kişi oluştur" seçilirse:

İsim: Ahmet
Soyisim: Yılmaz
Rol: Baba

girilebilir.

Kaydedildiğinde:

Zekiye ─── Ahmet

otomatik oluşturulmalı.

---

# 45. HATA KONTROLLERİ

Şunları engelle:

- Aynı kişiyi kendisiyle eş yapma.
- Aynı ilişkiyi tekrar tekrar oluşturma.
- Boş isimle kişi oluşturma.
- Geçersiz veri.
- Silinen kişinin ilişkilerinin sistemde kalması.
- Grafik üzerinde node çakışmaları.

Hata mesajları kullanıcı dostu olmalı.

---

# 46. KODU YAZMADAN ÖNCE

Önce mevcut proje klasörünü analiz et.

Eğer proje boşsa uygun bir proje yapısı oluştur.

Var olan dosyaları gereksiz yere silme.

Mevcut kod varsa önce incele.

Çalışan özellikleri bozma.

---

# 47. GELİŞTİRME SÜRECİ

Projeyi tek seferde kontrolsüz şekilde yazma.

Şu sırayla ilerle:

1. Proje kurulumu
2. Temel layout
3. Person veri modeli
4. Person ekleme
5. Person node
6. İlişki veri modeli
7. İlişki ekleme
8. React Flow entegrasyonu
9. Eşlerin yan yana layout sistemi
10. Çocukların aşağı yerleşmesi
11. Kardeşlerin hizalanması
12. Renk sistemi
13. Ayarlar
14. Arama
15. Düzenleme
16. Silme
17. LocalStorage
18. Undo/Redo
19. Import/Export
20. Responsive tasarım
21. Test
22. Son hata düzeltmeleri

Her aşamadan sonra uygulamanın gerçekten çalıştığını kontrol et.

---

# 48. TEST

Özellikle aşağıdaki senaryoları test et.

TEST 1:

Zekiye oluştur.

Ahmet oluştur.

Zekiye → Eş → Ahmet.

Beklenen:

Zekiye ve Ahmet yan yana.

TEST 2:

Ayşe oluştur.

Zekiye → Çocuk → Ayşe.

Ahmet → Çocuk → Ayşe.

Beklenen:

Ayşe çiftin altında.

TEST 3:

Mehmet ve Hasan ekle.

Üç çocuk aynı seviyede.

TEST 4:

Ahmet'in kardeşi Mehmet olsun.

Kardeş ilişkisi doğru gösterilsin.

TEST 5:

Eş ilişkisinin rengini değiştir.

Beklenen:

Sadece eş çizgisinin rengi değişsin.

TEST 6:

Çocuk ilişkisinin rengini değiştir.

Beklenen:

Çocuk bağlantılarının rengi değişsin.

TEST 7:

Bir kişiyi sürükle.

Beklenen:

İlişki çizgileri kişiyi takip etsin.

TEST 8:

Sayfayı yenile.

Beklenen:

Veriler kaybolmasın.

TEST 9:

Kişi sil.

Beklenen:

Kişi ve ilişkileri düzgün şekilde silinsin.

TEST 10:

100 kişilik büyük bir örnek aile oluştur.

Beklenen:

Uygulama kullanılabilir durumda kalsın.

---

# 49. ÖNEMLİ TASARIM KURALI

Kullanıcıya mümkün olduğunca fazla kontrol ver.

Ancak arayüzü karmaşıklaştırma.

Basit işlemler basit olmalı.

Örneğin kişi eklemek 10 farklı ekran gerektirmemeli.

---

# 50. SON HEDEF

Sonuçta elimde şu özelliklere sahip profesyonel bir web uygulaması olmasını istiyorum:

- Kişi ekleme
- Kişi düzenleme
- Kişi silme
- Rol/Görev ekleme
- Açıklama ekleme
- Eş ekleme
- Çocuk ekleme
- Kardeş ekleme
- Anne/Baba ekleme
- Diğer ilişkiler
- Özel ilişki oluşturma
- Eşleri otomatik yan yana yerleştirme
- Çocukları ebeveynlerin altına yerleştirme
- Kardeşleri aynı seviyede gösterme
- Otomatik grafik düzeni
- Manuel sürükleme
- Zoom
- Pan
- Arama
- Kişi bilgi paneli
- İlişki renklerini değiştirme
- İlişki çizgi tiplerini değiştirme
- Çizgi kalınlığını değiştirme
- Kişi kartı renklerini değiştirme
- Dark mode
- Responsive tasarım
- LocalStorage
- JSON dışa aktarma
- JSON içe aktarma
- Undo / Redo
- Büyük ailelerde performans
- Modern kullanıcı arayüzü

İlk hedef çalışan ve temiz bir MVP oluşturmak.

Sonrasında özellikleri genişletebiliriz.

---

# 51. ÇALIŞMA ŞEKLİ

Ben senden sadece kod yazmanı değil, aynı zamanda projenin gerçekten çalışmasını sağlamanı istiyorum.

Kod yazdıktan sonra:

- build çalıştır
- lint çalıştır
- varsa testleri çalıştır
- TypeScript hatalarını düzelt
- console hatalarını kontrol et
- UI'da oluşabilecek hataları düzelt
- responsive sorunlarını kontrol et

Hata varsa kendin düzelt ve tekrar test et.

Benim onayımı beklemeden, açıkça tanımladığım gereksinimleri mümkün olduğunca tamamla.

Herhangi bir teknik karar verirken basit, sürdürülebilir ve ileride genişletilebilir bir mimari tercih et.

Kodu gereksiz şekilde karmaşıklaştırma.

Öncelik:

1. Çalışması
2. Kullanışlı olması
3. Temiz görünmesi
4. Genişletilebilir olması
5. Performans

Bu proje sadece basit bir çizim aracı değil; ileride gerçek kullanıcıların aile bilgilerini oluşturup yönetebileceği ciddi bir web uygulamasının temeli olarak hazırlanmalıdır.

