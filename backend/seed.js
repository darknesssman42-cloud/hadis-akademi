const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hadith = require('./models/Hadith');
const Badge = require('./models/Badge');
const User = require('./models/User');

dotenv.config();

const hadiths = [
    {
        number: 1,
        arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
        turkish: 'Ameller niyetlere göredir. Herkes niyet ettiğinin karşılığını alır.',
        narrator: 'Hz. Ömer (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Niyet',
        dailyExample: 'Sabah okula giderken "bugün derslerimi iyi çalışacağım" diye niyet etmek, tüm gününü anlamlı kılar. Niyet, bir işin ruhudur.',
        difficulty: 'kolay'
    },
    {
        number: 2,
        arabic: 'الدِّينُ النَّصِيحَةُ',
        turkish: 'Din, samimi öğüt vermek (nasihattır).',
        narrator: 'Temim ed-Darî (r.a.)',
        source: 'Müslim',
        topic: 'Nasihat ve Dürüstlük',
        dailyExample: 'Bir arkadaşın yanlış bir yol seçmek üzereyken ona dürüstçe doğruyu söylemek, bu hadisin pratiğe yansımasıdır.',
        difficulty: 'kolay'
    },
    {
        number: 3,
        arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
        turkish: 'Allah\'a ve ahiret gününe inanan ya hayır söylesin ya da sussun.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Dil ve Konuşma',
        dailyExample: 'Sosyal medyada bir paylaşım yapmadan önce "bu faydalı mı, zararlı mı?" diye düşünmek bu hadisi yaşatmaktır.',
        difficulty: 'orta'
    },
    {
        number: 4,
        arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        turkish: 'Sizden biriniz, kardeşi için de kendisi için istediğini istemedikçe (gerçek manada) iman etmiş olmaz.',
        narrator: 'Enes b. Mâlik (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Kardeşlik ve Empati',
        dailyExample: 'Sınav sonuçları açıklandığında, kendi başarın kadar arkadaşının başarısına da sevinmek bu hadisin güzel bir yansımasıdır.',
        difficulty: 'orta'
    },
    {
        number: 5,
        arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        turkish: 'Müslüman, diğer Müslümanların elinden ve dilinden emin olduğu kişidir.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî',
        topic: 'İyi Ahlak',
        dailyExample: 'İnsanlara hakaret etmemek, dedikodu yapmamak ve onlara zarar vermemek bu hadisin özüdür.',
        difficulty: 'kolay'
    },
    {
        number: 6,
        arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
        turkish: 'Nerede olursan ol Allah\'tan kork, kötülüğün ardından iyilik yap ki o iyilik kötülüğü silsin ve insanlara güzel ahlakla muamele et.',
        narrator: 'Muâz b. Cebel (r.a.)',
        source: 'Ahmed b. Hanbel',
        topic: 'Takva ve Ahlak',
        dailyExample: 'Birine kaba davrandıktan sonra özür dileyip iyi davranmak, hatanı güzel bir şekilde telafi etmektir.',
        difficulty: 'zor'
    },
    {
        number: 7,
        arabic: 'الطَّهُورُ شَطْرُ الْإِيمَانِ',
        turkish: 'Temizlik imanın yarısıdır.',
        narrator: 'Ebû Mâlik el-Eş\'arî (r.a.)',
        source: 'Müslim',
        topic: 'Temizlik',
        dailyExample: 'Her sabah dişlerini fırçalamak, üstünü temiz tutmak; hem sağlık hem de imanın gereğidir.',
        difficulty: 'kolay'
    },
    {
        number: 8,
        arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        turkish: 'En hayırlınız Kur\'an\'ı öğrenen ve öğretendir.',
        narrator: 'Hz. Osman (r.a.)',
        source: 'Buhârî',
        topic: 'Kur\'an Öğrenimi',
        dailyExample: 'Kardeşine Kur\'an okumayı öğretmek veya öğrenmek, bu hadise göre en hayırlı işlerden biridir.',
        difficulty: 'kolay'
    },
    {
        number: 9,
        arabic: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ',
        turkish: 'Allah, sizden biriniz bir iş yaptığında onu sağlam ve güzel yapmasını sever.',
        narrator: 'Hz. Aişe (r.a.)',
        source: 'Taberânî',
        topic: 'Çalışkanlık ve İtkan',
        dailyExample: 'Ödevini aceleyle değil, dikkatli ve özenli yaparak teslim etmek; ihsan (mükemmellik) anlayışının göstergesidir.',
        difficulty: 'orta'
    },
    {
        number: 10,
        arabic: 'ابْدَأْ بِنَفْسِكَ',
        turkish: 'Kendinle başla (önce kendini ıslah et).',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Müslim',
        topic: 'Nefis Terbiyesi',
        dailyExample: 'Başkalarını değiştirmeye çalışmadan önce kendi hatalarını görmek ve düzeltmek bu hadisin özüdür.',
        difficulty: 'kolay'
    },
    {
        number: 11,
        arabic: 'اسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ',
        turkish: 'Allah\'tan yardım dile ve aciz kalma.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Müslim',
        topic: 'Tevekkül ve Azim',
        dailyExample: 'Zor bir sınava çalışırken önce dua edip sonra çalışmaya başlamak, tevekkülü işe yansıtmaktır.',
        difficulty: 'kolay'
    },
    {
        number: 12,
        arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
        turkish: 'Mümin, müminin binaya (taşları) birbirini destekleyen) gibidir.',
        narrator: 'Ebû Mûsa el-Eş\'arî (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Birlik ve Dayanışma',
        dailyExample: 'Sınıfta zorlanan bir arkadaşına ders çalışmada yardım etmek, bu hadisin güzel bir örneğidir.',
        difficulty: 'orta'
    }
];

const badges = [
    { name: 'Hadis Öğrencisi', icon: '📚', color: '#4CAF50', description: 'İlk quizi tamamladın!', requirement: { type: 'quizzes', value: 1 } },
    { name: 'Meraklı Talip', icon: '🔍', color: '#2196F3', description: '5 quiz tamamladın', requirement: { type: 'quizzes', value: 5 } },
    { name: 'Hadis Aşığı', icon: '❤️', color: '#E91E63', description: 'İlk hadisi ezberledin', requirement: { type: 'memorized', value: 1 } },
    { name: 'Hafız Adayı', icon: '🌙', color: '#9C27B0', description: '5 hadis ezberledin', requirement: { type: 'memorized', value: 5 } },
    { name: 'Hadis Hafızı', icon: '⭐', color: '#FF9800', description: '10 hadis ezberledin!', requirement: { type: 'memorized', value: 10 } },
    { name: 'Puan Avcısı', icon: '🎯', color: '#00BCD4', description: '100 puana ulaştın', requirement: { type: 'points', value: 100 } },
    { name: 'Yıldız Öğrenci', icon: '🌟', color: '#FFD700', description: '500 puana ulaştın', requirement: { type: 'points', value: 500 } },
    { name: 'Şampiyon', icon: '🏆', color: '#FF5722', description: '1000 puana ulaştın!', requirement: { type: 'points', value: 1000 } },
    { name: 'Azimli Talip', icon: '🔥', color: '#F44336', description: '7 günlük seri!', requirement: { type: 'streak', value: 7 } },
    { name: 'Keskin Akıl', icon: '🧠', color: '#607D8B', description: '50 soruyu doğru yanıtladın', requirement: { type: 'correct', value: 50 } }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlandı');

        await Hadith.deleteMany({});
        await Badge.deleteMany({});
        await User.deleteMany({ email: { $in: ['ogretmen@demo.com', 'ogrenci@demo.com'] } });

        await Hadith.insertMany(hadiths);
        console.log(`✅ ${hadiths.length} hadis eklendi`);

        await Badge.insertMany(badges);
        console.log(`✅ ${badges.length} rozet eklendi`);

        // Demo kullanıcıları
        await User.create({
            name: 'Ahmet Öğretmen',
            email: 'ogretmen@demo.com',
            password: '123456',
            role: 'teacher',
            class: '10-A'
        });
        await User.create({
            name: 'Fatma Öğrenci',
            email: 'ogrenci@demo.com',
            password: '123456',
            role: 'student',
            class: '10-A'
        });
        console.log('✅ Demo kullanıcılar eklendi');
        console.log('');
        console.log('🎓 Demo Giriş Bilgileri:');
        console.log('   Öğrenci: ogrenci@demo.com / 123456');
        console.log('   Öğretmen: ogretmen@demo.com / 123456');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed hatası:', err.message);
        process.exit(1);
    }
}

seed();
