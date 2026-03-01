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
        dailyExample: 'Sabah okula giderken "bugün derslerimi iyi çalışacağım" diye niyet etmek, tüm gününü anlamlı kılar.',
        difficulty: 'kolay'
    },
    {
        number: 2,
        arabic: 'الدِّينُ النَّصِيحَةُ',
        turkish: 'Din, samimi öğüt vermek (nasihattır).',
        narrator: 'Temim ed-Darî (r.a.)',
        source: 'Müslim',
        topic: 'Nasihat ve Dürüstlük',
        dailyExample: 'Bir arkadaşın yanlış bir yol seçmek üzereyken ona dürüstçe doğruyu söylemek.',
        difficulty: 'kolay'
    },
    {
        number: 3,
        arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
        turkish: 'Allah\'a ve ahiret gününe inanan ya hayır söylesin ya da sussun.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Dil ve Konuşma',
        dailyExample: 'Sosyal medyada bir paylaşım yapmadan önce "bu faydalı mı?" diye düşünmek.',
        difficulty: 'orta'
    },
    {
        number: 4,
        arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        turkish: 'Sizden biriniz, kardeşi için de kendisi için istediğini istemedikçe iman etmiş olmaz.',
        narrator: 'Enes b. Mâlik (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Kardeşlik ve Empati',
        dailyExample: 'Sınav sonuçlarında arkadaşının başarısına da sevinmek.',
        difficulty: 'orta'
    },
    {
        number: 5,
        arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        turkish: 'Müslüman, diğer Müslümanların elinden ve dilinden emin olduğu kişidir.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî',
        topic: 'İyi Ahlak',
        dailyExample: 'İnsanlara hakaret etmemek, dedikodu yapmamak ve zarar vermemek.',
        difficulty: 'kolay'
    },
    {
        number: 6,
        arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
        turkish: 'Nerede olursan ol Allah\'tan kork, kötülüğün ardından iyilik yap ve insanlara güzel ahlakla muamele et.',
        narrator: 'Muâz b. Cebel (r.a.)',
        source: 'Ahmed b. Hanbel',
        topic: 'Takva ve Ahlak',
        dailyExample: 'Birine kaba davrandıktan sonra özür dileyip iyi davranmak.',
        difficulty: 'zor'
    },
    {
        number: 7,
        arabic: 'الطَّهُورُ شَطْرُ الْإِيمَانِ',
        turkish: 'Temizlik imanın yarısıdır.',
        narrator: 'Ebû Mâlik el-Eş\'arî (r.a.)',
        source: 'Müslim',
        topic: 'Temizlik',
        dailyExample: 'Her sabah dişlerini fırçalamak, üstünü temiz tutmak.',
        difficulty: 'kolay'
    },
    {
        number: 8,
        arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        turkish: 'En hayırlınız Kur\'an\'ı öğrenen ve öğretendir.',
        narrator: 'Hz. Osman (r.a.)',
        source: 'Buhârî',
        topic: 'Kur\'an Öğrenimi',
        dailyExample: 'Kardeşine Kur\'an okumayı öğretmek.',
        difficulty: 'kolay'
    },
    {
        number: 9,
        arabic: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ',
        turkish: 'Allah, sizden biriniz bir iş yaptığında onu sağlam ve güzel yapmasını sever.',
        narrator: 'Hz. Aişe (r.a.)',
        source: 'Taberânî',
        topic: 'Çalışkanlık ve İtkan',
        dailyExample: 'Ödevini aceleyle değil, dikkatli ve özenli yaparak teslim etmek.',
        difficulty: 'orta'
    },
    {
        number: 10,
        arabic: 'ابْدَأْ بِنَفْسِكَ',
        turkish: 'Kendinle başla (önce kendini ıslah et).',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Müslim',
        topic: 'Nefis Terbiyesi',
        dailyExample: 'Başkalarını değiştirmeye çalışmadan önce kendi hatalarını görmek.',
        difficulty: 'kolay'
    },
    {
        number: 11,
        arabic: 'اسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ',
        turkish: 'Allah\'tan yardım dile ve aciz kalma.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Müslim',
        topic: 'Tevekkül ve Azim',
        dailyExample: 'Zor bir sınava çalışırken önce dua edip sonra çalışmaya başlamak.',
        difficulty: 'kolay'
    },
    {
        number: 12,
        arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
        turkish: 'Mümin, müminin birbirini destekleyen bina gibidir.',
        narrator: 'Ebû Mûsa el-Eş\'arî (r.a.)',
        source: 'Buhârî & Müslim',
        topic: 'Birlik ve Dayanışma',
        dailyExample: 'Sınıfta zorlanan bir arkadaşına ders çalışmada yardım etmek.',
        difficulty: 'orta'
    }
];

// 30 Rozet Tanımı
const badges = [
    // İlk rozet: Siftah
    { name: 'Siftah', icon: '🎉', color: '#4CAF50', description: 'İlk quizi tamamladın!', rarity: 'common', requirement: { type: 'quizzes', value: 1 } },
    { name: 'Meraklı Talip', icon: '🔍', color: '#2196F3', description: '5 quiz tamamladın', rarity: 'common', requirement: { type: 'quizzes', value: 5 } },
    { name: 'Quiz Ustası', icon: '🎓', color: '#673AB7', description: '20 quiz tamamladın', rarity: 'rare', requirement: { type: 'quizzes', value: 20 } },
    { name: 'Quiz Şampiyonu', icon: '🏅', color: '#FF5722', description: '50 quiz tamamladın', rarity: 'epic', requirement: { type: 'quizzes', value: 50 } },
    { name: 'Quiz Efsanesi', icon: '👑', color: '#FFD700', description: '100 quiz tamamladın!', rarity: 'legendary', requirement: { type: 'quizzes', value: 100 } },

    // Ezber rozetleri
    { name: 'Hadis Aşığı', icon: '❤️', color: '#E91E63', description: 'İlk hadisi ezberledin', rarity: 'common', requirement: { type: 'memorized', value: 1 } },
    { name: 'Hafız Adayı', icon: '🌙', color: '#9C27B0', description: '5 hadis ezberledin', rarity: 'common', requirement: { type: 'memorized', value: 5 } },
    { name: 'Hadis Hafızı', icon: '⭐', color: '#FF9800', description: '10 hadis ezberledin', rarity: 'rare', requirement: { type: 'memorized', value: 10 } },
    { name: 'Altın Hafız', icon: '🌟', color: '#FFC107', description: '25 hadis ezberledin', rarity: 'epic', requirement: { type: 'memorized', value: 25 } },
    { name: 'Hadis İmamı', icon: '📿', color: '#795548', description: '50 hadis ezberledin!', rarity: 'epic', requirement: { type: 'memorized', value: 50 } },
    { name: 'Hadis Alimi', icon: '📜', color: '#3F51B5', description: '100 hadis ezberledin!', rarity: 'legendary', requirement: { type: 'memorized', value: 100 } },
    { name: 'Büyük Hafız', icon: '🕌', color: '#009688', description: '200 hadis ezberledin!', rarity: 'legendary', difficultyBonus: 50, requirement: { type: 'memorized', value: 200 } },

    // Puan rozetleri
    { name: 'Puan Avcısı', icon: '🎯', color: '#00BCD4', description: '100 puana ulaştın', rarity: 'common', requirement: { type: 'points', value: 100 } },
    { name: 'Yıldız Öğrenci', icon: '💫', color: '#FFD700', description: '500 puana ulaştın', rarity: 'rare', requirement: { type: 'points', value: 500 } },
    { name: 'Elmas Akıl', icon: '💎', color: '#00E5FF', description: '1000 puana ulaştın!', rarity: 'epic', requirement: { type: 'points', value: 1000 } },
    { name: 'Altın Zirve', icon: '🏔️', color: '#FF6F00', description: '2500 puana ulaştın!', rarity: 'epic', requirement: { type: 'points', value: 2500 } },
    { name: 'Efsane Talip', icon: '🦅', color: '#D50000', description: '5000 puana ulaştın!', rarity: 'legendary', requirement: { type: 'points', value: 5000 } },
    { name: 'Hadis Sultanı', icon: '👸', color: '#AA00FF', description: '10000 puana ulaştın!', rarity: 'legendary', difficultyBonus: 100, requirement: { type: 'points', value: 10000 } },

    // Doğru cevap rozetleri
    { name: 'Keskin Akıl', icon: '🧠', color: '#607D8B', description: '25 soruyu doğru yanıtladın', rarity: 'common', requirement: { type: 'correct', value: 25 } },
    { name: 'Bilge Öğrenci', icon: '🦉', color: '#8D6E63', description: '100 doğru cevap', rarity: 'rare', requirement: { type: 'correct', value: 100 } },
    { name: 'Allame', icon: '📖', color: '#4E342E', description: '500 doğru cevap!', rarity: 'epic', requirement: { type: 'correct', value: 500 } },

    // Seri rozetleri
    { name: 'Azimli Talip', icon: '🔥', color: '#F44336', description: '3 günlük giriş serisi!', rarity: 'common', requirement: { type: 'streak', value: 3 } },
    { name: 'Kararlı Öğrenci', icon: '💪', color: '#E65100', description: '7 günlük seri!', rarity: 'rare', requirement: { type: 'streak', value: 7 } },
    { name: 'Demir İrade', icon: '⚔️', color: '#B71C1C', description: '14 günlük seri!', rarity: 'epic', requirement: { type: 'streak', value: 14 } },
    { name: 'Efsane Azim', icon: '🗡️', color: '#311B92', description: '30 günlük seri!', rarity: 'legendary', requirement: { type: 'streak', value: 30 } },

    // Özel rozetler
    { name: 'İlk Adım', icon: '👣', color: '#43A047', description: 'Platforma kayıt oldun', rarity: 'common', requirement: { type: 'points', value: 0 } },
    { name: 'Keşifçi', icon: '🧭', color: '#0288D1', description: 'Tüm sayfaları ziyaret ettin', rarity: 'common', requirement: { type: 'quizzes', value: 3 } },
    { name: 'Gece Kuşu', icon: '🌃', color: '#1A237E', description: '10 quiz tamamladın', rarity: 'rare', requirement: { type: 'quizzes', value: 10 } },
    { name: 'Muhaddis', icon: '🏛️', color: '#880E4F', description: '30 quiz + 30 ezber', rarity: 'epic', requirement: { type: 'quizzes', value: 30 } },

    // Haftalık 1. olana Kupa Rozeti — nadir, ezberle kazanılamaz
    { name: 'Kupa Rozeti', icon: '🏆', color: '#FFD700', description: 'Haftalık sıralamada 1. oldun! (Nadir rozet, sadece 1. sıraya verilir)', rarity: 'legendary', difficultyBonus: 200, requirement: { type: 'weekly_rank', value: 1 } }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlandı');

        await Hadith.deleteMany({});
        await Badge.deleteMany({});
        await User.deleteMany({ email: { $in: ['admin@hadis.com', 'ogretmen@demo.com', 'ogrenci@demo.com'] } });

        await Hadith.insertMany(hadiths);
        console.log(`✅ ${hadiths.length} hadis eklendi`);

        await Badge.insertMany(badges);
        console.log(`✅ ${badges.length} rozet eklendi`);

        // Admin kullanıcı
        await User.create({
            name: 'Admin',
            email: 'admin@hadis.com',
            password: '123456',
            role: 'admin',
            isApproved: true
        });

        // Demo öğretmen (onaylı)
        await User.create({
            name: 'Ahmet Öğretmen',
            email: 'ogretmen@demo.com',
            password: '123456',
            role: 'teacher',
            phone: '0555 555 5555',
            isApproved: true
        });

        // Demo öğrenci
        await User.create({
            name: 'Fatma Öğrenci',
            email: 'ogrenci@demo.com',
            password: '123456',
            role: 'student',
            class: '10-A',
            schoolNumber: '1234',
            isApproved: true
        });

        console.log('✅ Demo kullanıcılar eklendi');
        console.log('');
        console.log('🎓 Demo Giriş Bilgileri:');
        console.log('   Admin:    admin@hadis.com / 123456');
        console.log('   Öğretmen: ogretmen@demo.com / 123456');
        console.log('   Öğrenci:  ogrenci@demo.com / 123456');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed hatası:', err.message);
        process.exit(1);
    }
}

seed();
