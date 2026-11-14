// 1. Theme Colors (20 Colors)
const themeColors = [
    '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
    '#EF4444', '#14B8A6', '#06B6D4', '#84CC16', '#EAB308',
    '#F97316', '#6366F1', '#A855F7', '#D946EF', '#F43F5E',
    '#22C55E', '#0EA5E9', '#38BDF8', '#FB923C', '#E2E8F0'
];

const colorsGrid = document.getElementById('colors-grid');

const applyThemeColor = (color) => {
    document.documentElement.style.setProperty('--main-color', color);
    localStorage.setItem('ramadan-theme-color', color);

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
};

themeColors.forEach(color => {
    const btn = document.createElement('button');
    btn.classList.add('color-btn');
    btn.style.backgroundColor = color;
    btn.dataset.color = color;
    btn.title = color;

    btn.addEventListener('click', () => applyThemeColor(color));
    colorsGrid.appendChild(btn);
});

const savedColor = localStorage.getItem('ramadan-theme-color') || themeColors[0];
applyThemeColor(savedColor);


// 2. Navigation Between Sections
const navLinks = document.querySelectorAll('.nav-links a');
const contentSections = document.querySelectorAll('.content-section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        navLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');

        const targetId = link.dataset.target;
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});


// 3. Global Click Sound Effect
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playClickSound = () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.04);
};

document.addEventListener('pointerdown', playClickSound);


// 4. Today Date (Hijri & Gregorian)
const displayTodayDate = () => {
    const dateBadge = document.querySelector('#today-date span');
    if (!dateBadge) return;
    const today = new Date();

    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(today);

    const gregorianDate = new Intl.DateTimeFormat('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(today);

    dateBadge.textContent = hijriDate + '  |  ' + gregorianDate;
};

displayTodayDate();


// 5. Ramadan Countdown Timer
const ramadanDate = new Date('February 8, 2027 00:00:00').getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = ramadanDate - now;

    if (distance <= 0) {
        const titleEl = document.querySelector('.countdown-info h2');
        if (titleEl) titleEl.textContent = 'مبارك عليكم الشهر الفضيل 🌙✨';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const formatNum = (num) => (num < 10 ? '0' + num : num);

    const daysEl = document.getElementById('days');
    if (daysEl) {
        daysEl.textContent = formatNum(days);
        document.getElementById('hours').textContent = formatNum(hours);
        document.getElementById('minutes').textContent = formatNum(minutes);
        document.getElementById('seconds').textContent = formatNum(seconds);
    }
};

updateCountdown();
setInterval(updateCountdown, 1000);


// 6. Five Daily Prayers & Sunnah Section
const prayerCards = document.querySelectorAll('.prayer-card[data-prayer]');
const sunnahCards = document.querySelectorAll('.prayer-card[data-sunnah]');
const resetPrayersBtn = document.getElementById('reset-prayers-btn');
const prayerProgressFill = document.getElementById('prayer-progress-fill');
const prayerPercentageText = document.getElementById('prayer-percentage');
const homePrayersCount = document.getElementById('home-prayers-count');

let prayersState = JSON.parse(localStorage.getItem('ramadan-prayers')) || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    rawatib: false,
    duha: false,
    witr: false
};

const updatePrayersUI = () => {
    let completedFard = 0;

    prayerCards.forEach(card => {
        const prayerName = card.dataset.prayer;
        if (prayersState[prayerName]) {
            card.classList.add('completed');
            completedFard++;
        } else {
            card.classList.remove('completed');
        }
    });

    sunnahCards.forEach(card => {
        const sunnahName = card.dataset.sunnah;
        if (prayersState[sunnahName]) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
    });

    const percentage = Math.round((completedFard / 5) * 100);
    if (prayerProgressFill) {
        prayerProgressFill.style.width = percentage + '%';
        prayerPercentageText.textContent = percentage + '% (' + completedFard + ' / 5)';
    }

    if (homePrayersCount) {
        homePrayersCount.textContent = completedFard + ' / 5';
    }

    localStorage.setItem('ramadan-prayers', JSON.stringify(prayersState));
};

prayerCards.forEach(card => {
    card.addEventListener('click', () => {
        const prayerName = card.dataset.prayer;
        prayersState[prayerName] = !prayersState[prayerName];
        updatePrayersUI();
    });
});

sunnahCards.forEach(card => {
    card.addEventListener('click', () => {
        const sunnahName = card.dataset.sunnah;
        prayersState[sunnahName] = !prayersState[sunnahName];
        updatePrayersUI();
    });
});

if (resetPrayersBtn) {
    resetPrayersBtn.addEventListener('click', () => {
        Object.keys(prayersState).forEach(key => {
            prayersState[key] = false;
        });
        updatePrayersUI();
    });
}

updatePrayersUI();


// 7. Quran & Khatmah Section
const BASE_URL = 'https://api.alquran.cloud/v1';

const surahsGrid = document.getElementById('surahs-grid');
const surahSearchInput = document.getElementById('surah-search-input');
const surahsListView = document.getElementById('surahs-list-view');
const surahReaderView = document.getElementById('surah-reader-view');
const backToSurahsBtn = document.getElementById('back-to-surahs-btn');
const toggleSurahReadBtn = document.getElementById('toggle-surah-read-btn');
const resetQuranBtn = document.getElementById('reset-quran-btn');

const quranProgressFill = document.getElementById('quran-progress-fill');
const quranPercentageText = document.getElementById('quran-percentage');
const homeQuranProgress = document.getElementById('home-quran-progress');

let allSurahs = [];
let currentSurahNumber = null;
let readSurahs = JSON.parse(localStorage.getItem('ramadan-read-surahs')) || [];

const updateQuranProgress = () => {
    const count = readSurahs.length;
    const percentage = Math.round((count / 114) * 100);

    if (quranProgressFill) {
        quranProgressFill.style.width = percentage + '%';
        quranPercentageText.textContent = percentage + '% (' + count + ' / 114 سورة)';
    }

    if (homeQuranProgress) {
        homeQuranProgress.textContent = percentage + '%';
    }

    localStorage.setItem('ramadan-read-surahs', JSON.stringify(readSurahs));
};

// === Reciters & Audio Setup (جلب الروابط الفعلية من API mp3quran الرسمي مع كلمات بحث دقيقة) ===
const reciterSelect = document.getElementById('reciter-select');
const surahAudio = document.getElementById('surah-audio');

const targetReciters = [
    { display: 'عبد الرحمن السديس', keywords: ['السديس'], fallback: 'https://server11.mp3quran.net/sds/' },
    { display: 'ماهر المعيقلي', keywords: ['المعيقلي'], fallback: 'https://server12.mp3quran.net/maher/' },
    { display: 'بندر بن عبد العزيز بليلة', keywords: ['بندر بليلة', 'بليلة'], fallback: 'https://server6.mp3quran.net/balilah/' },
    { display: 'علي الحذيفي', keywords: ['علي الحذيفي', 'الحذيفي'], fallback: 'https://server9.mp3quran.net/hthfi/' },
    { display: 'ياسر الدوسري', keywords: ['ياسر الدوسري'], fallback: 'https://server11.mp3quran.net/yasser/' },
    { display: 'صالح بن عبد الله ابن حميد', keywords: ['صالح بن حميد', 'ابن حميد', 'حميد'], fallback: 'https://server6.mp3quran.net/humaid/' },
    { display: 'عبد الله الخلف', keywords: ['عبدالله الخلف', 'عبد الله الخلف', 'الخلف'], fallback: 'https://server14.mp3quran.net/khalf/' },
    { display: 'صالح الصاهود', keywords: ['الصاهود'], fallback: 'https://server10.mp3quran.net/sahood/' },
    { display: 'رعد الكردي', keywords: ['رعد محمد الكردي', 'رعد الكردي', 'الكردي'], fallback: 'https://server6.mp3quran.net/kurdi/' },
    { display: 'ناصر القطامي', keywords: ['ناصر القطامي', 'القطامي'], fallback: 'https://server6.mp3quran.net/qtm/' },
    { display: 'عبد الله غيلان', keywords: ['غيلان'], fallback: 'https://server8.mp3quran.net/ghilan/' },
    { display: 'إسلام صبحي', keywords: ['إسلام صبحي', 'اسلام صبحي'], fallback: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/' },
    { display: 'محمد اللحيدان', keywords: ['اللحيدان'], fallback: 'https://server8.mp3quran.net/lhdan/' },
    { display: 'صابر عبد الحكم', keywords: ['صابر عبدالحكم', 'صابر عبد الحكم', 'عبدالحكم'], fallback: 'https://server12.mp3quran.net/hkm/' },
    { display: 'عبد المحسن بن محمد القاسم', keywords: ['عبدالمحسن القاسم', 'عبد المحسن القاسم', 'القاسم'], fallback: 'https://server8.mp3quran.net/qasm/' },
    { display: 'علي بن عبد الله جابر (رحمه الله)', keywords: ['علي جابر'], fallback: 'https://server11.mp3quran.net/a_jbr/' },
    { display: 'عبد الباري بن عواض الثبيتي', keywords: ['الثبيتي'], fallback: 'https://server6.mp3quran.net/thubti/' },
    { display: 'عبد العزيز سحيم', keywords: ['سحيم'], fallback: 'https://server16.mp3quran.net/a_sheim/Rewayat-Hafs-A-n-Assem/' },
    { display: 'عبد الله بن عبد الرحمن البعيجان', keywords: ['البعيجان'], fallback: 'https://server8.mp3quran.net/buaijan/' },
    { display: 'بدر التركي', keywords: ['بدر التركي', 'التركي'], fallback: 'https://server10.mp3quran.net/badr/' }
];

const normalizeArabic = (str) => str.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();

const populateRecitersDropdown = (allApiReciters = []) => {
    if (!reciterSelect) return;
    const currentSelectedText = reciterSelect.options[reciterSelect.selectedIndex]?.textContent;
    reciterSelect.innerHTML = '';

    targetReciters.forEach(target => {
        let serverUrl = target.fallback;

        if (allApiReciters.length > 0) {
            const match = allApiReciters.find(r =>
                target.keywords.some(kw => normalizeArabic(r.name).includes(normalizeArabic(kw)))
            );

            if (match && match.moshaf && match.moshaf.length > 0) {
                // نفضل رواية حفص أو المصحف اللي فيه أكبر عدد سور
                const hafsMoshaf = match.moshaf.filter(m => m.name && m.name.includes('حفص'));
                const candidates = hafsMoshaf.length > 0 ? hafsMoshaf : match.moshaf;
                const bestMoshaf = candidates.reduce((prev, curr) =>
                    (curr.surah_total > prev.surah_total) ? curr : prev
                );

                if (bestMoshaf && bestMoshaf.server) {
                    serverUrl = bestMoshaf.server;
                }
            }
        }

        const option = document.createElement('option');
        option.value = serverUrl;
        option.textContent = 'القارئ: ' + target.display;
        reciterSelect.appendChild(option);
    });

    const savedServer = localStorage.getItem('ramadan-selected-reciter');
    if (savedServer && [...reciterSelect.options].some(o => o.value === savedServer)) {
        reciterSelect.value = savedServer;
    } else if (currentSelectedText) {
        const matchingOption = [...reciterSelect.options].find(o => o.textContent === currentSelectedText);
        if (matchingOption) reciterSelect.value = matchingOption.value;
    }
};

const loadRecitersServers = async () => {
    if (!reciterSelect) return;
    populateRecitersDropdown([]);

    try {
        const cached = localStorage.getItem('ramadan-reciters-v3');
        let allApiReciters = [];

        if (cached) {
            allApiReciters = JSON.parse(cached);
        } else {
            const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
            const data = await res.json();
            allApiReciters = data.reciters || [];
            if (allApiReciters.length > 0) {
                localStorage.setItem('ramadan-reciters-v3', JSON.stringify(allApiReciters));
            }
        }

        if (allApiReciters.length > 0) {
            populateRecitersDropdown(allApiReciters);
            updateAudioSource();
        }
    } catch (err) {
        console.log('تم التحميل من الروابط الاحتياطية');
    }
};

const updateAudioSource = () => {
    if (!surahAudio || !reciterSelect || !currentSurahNumber) return;
    const server = reciterSelect.value || targetReciters[0].fallback;
    const cleanServer = server.endsWith('/') ? server : server + '/';
    const paddedSurah = String(currentSurahNumber).padStart(3, '0');
    surahAudio.src = cleanServer + paddedSurah + '.mp3';
    surahAudio.load();
};

if (reciterSelect) {
    reciterSelect.addEventListener('change', () => {
        localStorage.setItem('ramadan-selected-reciter', reciterSelect.value);
        const wasPlaying = surahAudio && !surahAudio.paused;
        updateAudioSource();
        if (wasPlaying && surahAudio) {
            surahAudio.play().catch(() => {});
        }
    });
}

loadRecitersServers();

const renderSurahs = (surahsToRender) => {
    if (!surahsGrid) return;
    surahsGrid.innerHTML = '';

    surahsToRender.forEach(surah => {
        const isRead = readSurahs.includes(surah.number);
        const typeText = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';

        const card = document.createElement('div');
        card.className = 'surah-card ' + (isRead ? 'read' : '');
        card.innerHTML =
            '<div class="surah-card-right">' +
            '<div class="surah-number">' + surah.number + '</div>' +
            '<div class="surah-meta">' +
            '<h3>' + surah.name + '</h3>' +
            '<span>' + typeText + ' • ' + surah.numberOfAyahs + ' آية</span>' +
            '</div>' +
            '</div>' +
            '<i class="bx ' + (isRead ? 'bxs-check-circle' : 'bx-circle') + ' surah-status-icon"></i>';

        card.addEventListener('click', () => openSurahReader(surah));
        surahsGrid.appendChild(card);
    });
};

const fetchAllSurahs = async () => {
    const cachedSurahs = localStorage.getItem('ramadan-surahs-cache');
    if (cachedSurahs) {
        allSurahs = JSON.parse(cachedSurahs);
        renderSurahs(allSurahs);
        return;
    }

    try {
        const res = await fetch(BASE_URL + '/surah');
        const json = await res.json();
        allSurahs = json.data;
        localStorage.setItem('ramadan-surahs-cache', JSON.stringify(allSurahs));
        renderSurahs(allSurahs);
    } catch (error) {
        if (surahsGrid) {
            surahsGrid.innerHTML = '<p class="loading-text">تأكد من اتصالك بالإنترنت أو حاول تحديث الصفحة.</p>';
        }
    }
};

const openSurahReader = async (surah) => {
    currentSurahNumber = surah.number;
    const typeText = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';

    document.getElementById('reader-surah-name').textContent = surah.name;
    document.getElementById('reader-surah-info').textContent = typeText + ' • ' + surah.numberOfAyahs + ' آية';

    const bismillahEl = document.getElementById('bismillah-header');
    bismillahEl.style.display = (surah.number === 1 || surah.number === 9) ? 'none' : 'block';

    updateMarkReadButton();
    updateAudioSource();

    surahsListView.style.display = 'none';
    surahReaderView.style.display = 'block';

    const ayahsContainer = document.getElementById('ayahs-container');
    ayahsContainer.innerHTML = '<p class="loading-text">جاري تحميل الآيات الكريمة...</p>';

    try {
        const res = await fetch(BASE_URL + '/surah/' + surah.number + '/quran-simple');
        const json = await res.json();
        const ayahs = json.data.ayahs;

        ayahsContainer.innerHTML = ayahs.map(ayah => {
            let text = ayah.text;
            if (surah.number !== 1 && ayah.numberInSurah === 1) {
                text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
            }
            return text + ' <span class="ayah-number">' + ayah.numberInSurah + '</span>';
        }).join(' ');
    } catch (error) {
        ayahsContainer.innerHTML = 'حدث خطأ أثناء تحميل الآيات، حاول مرة أخرى.';
    }
};

const updateMarkReadButton = () => {
    const isRead = readSurahs.includes(currentSurahNumber);
    if (isRead) {
        toggleSurahReadBtn.classList.add('completed');
        toggleSurahReadBtn.innerHTML = '<i class="bx bxs-check-circle"></i> تمت قراءة السورة';
    } else {
        toggleSurahReadBtn.classList.remove('completed');
        toggleSurahReadBtn.innerHTML = '<i class="bx bx-check-circle"></i> تحديد كمقروءة';
    }
};

if (toggleSurahReadBtn) {
    toggleSurahReadBtn.addEventListener('click', () => {
        if (readSurahs.includes(currentSurahNumber)) {
            readSurahs = readSurahs.filter(num => num !== currentSurahNumber);
        } else {
            readSurahs.push(currentSurahNumber);
        }
        updateMarkReadButton();
        updateQuranProgress();
        renderSurahs(allSurahs);
    });
}

if (backToSurahsBtn) {
    backToSurahsBtn.addEventListener('click', () => {
        if (surahAudio) surahAudio.pause();
        surahReaderView.style.display = 'none';
        surahsListView.style.display = 'block';
    });
}

const removeTashkeel = (text) => text.replace(/[\u064B-\u065F\u0670]/g, '');

if (surahSearchInput) {
    surahSearchInput.addEventListener('input', (e) => {
        const query = removeTashkeel(e.target.value.trim());
        const filtered = allSurahs.filter(surah => removeTashkeel(surah.name).includes(query));
        renderSurahs(filtered);
    });
}

if (resetQuranBtn) {
    resetQuranBtn.addEventListener('click', () => {
        readSurahs = [];
        updateQuranProgress();
        renderSurahs(allSurahs);
    });
}

updateQuranProgress();
fetchAllSurahs();


// 8. Athkar & Tasbih Section
const dhikrSelect = document.getElementById('dhikr-select');
const currentDhikrText = document.getElementById('current-dhikr-text');
const tasbihCountEl = document.getElementById('tasbih-count');
const athkarDailyTotalEl = document.getElementById('athkar-daily-total');
const tasbihIncrementBtn = document.getElementById('tasbih-increment-btn');
const tasbihResetBtn = document.getElementById('tasbih-reset-btn');
const resetAllAthkarBtn = document.getElementById('reset-all-athkar-btn');
const athkarCardsGrid = document.getElementById('athkar-cards-grid');
const homeAthkarCount = document.getElementById('home-athkar-count');

let currentTasbihCount = 0;
let dailyTotalAthkar = parseInt(localStorage.getItem('ramadan-daily-athkar')) || 0;
const dailyAthkarList = [
    { id: 1, text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ.', target: 1 },
    { id: 2, text: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ.', target: 1 },
    { id: 3, text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ.', target: 3 },
    { id: 4, text: 'رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسْلَامِ دِينَاً، وَبِمُحَمَّدٍ نَبِيَّاً.', target: 3 },
    { id: 5, text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ.', target: 3 },
    { id: 6, text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ.', target: 10 }
];
let athkarProgress = JSON.parse(localStorage.getItem('ramadan-athkar-cards')) || {};

const updateAthkarUI = () => {
    if (tasbihCountEl) tasbihCountEl.textContent = currentTasbihCount;
    if (athkarDailyTotalEl) athkarDailyTotalEl.textContent = dailyTotalAthkar;
    if (homeAthkarCount) homeAthkarCount.textContent = dailyTotalAthkar;
    localStorage.setItem('ramadan-daily-athkar', dailyTotalAthkar);
};

if (dhikrSelect) {
    dhikrSelect.addEventListener('change', (e) => {
        if (currentDhikrText) currentDhikrText.textContent = e.target.value;
        currentTasbihCount = 0;
        updateAthkarUI();
    });
}

if (tasbihIncrementBtn) {
    tasbihIncrementBtn.addEventListener('click', () => {
        currentTasbihCount++;
        dailyTotalAthkar++;
        updateAthkarUI();
    });
}

if (tasbihResetBtn) {
    tasbihResetBtn.addEventListener('click', () => {
        currentTasbihCount = 0;
        updateAthkarUI();
    });
}

const renderAthkarCards = () => {
    if (!athkarCardsGrid) return;
    athkarCardsGrid.innerHTML = '';
    dailyAthkarList.forEach(item => {
        const remaining = athkarProgress[item.id] !== undefined ? athkarProgress[item.id] : item.target;
        const isDone = remaining === 0;
        const card = document.createElement('div');
        card.className = 'dhikr-item-card ' + (isDone ? 'done' : '');
        card.innerHTML =
            '<p>' + item.text + '</p>' +
            '<div class="dhikr-card-footer">' +
            '<span>التكرار المطلوب: ' + item.target + '</span>' +
            '<span class="dhikr-count-badge">' + (isDone ? 'تم بحمد الله ✓' : 'المتبقي: ' + remaining) + '</span>' +
            '</div>';
        card.addEventListener('click', () => {
            if (remaining > 0) {
                athkarProgress[item.id] = remaining - 1;
                dailyTotalAthkar++;
                localStorage.setItem('ramadan-athkar-cards', JSON.stringify(athkarProgress));
                updateAthkarUI();
                renderAthkarCards();
            }
        });
        athkarCardsGrid.appendChild(card);
    });
};

if (resetAllAthkarBtn) {
    resetAllAthkarBtn.addEventListener('click', () => {
        currentTasbihCount = 0;
        dailyTotalAthkar = 0;
        athkarProgress = {};
        localStorage.removeItem('ramadan-athkar-cards');
        updateAthkarUI();
        renderAthkarCards();
    });
}

updateAthkarUI();
renderAthkarCards();


// 9. Daily Tasks Section (To-Do List)
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const tasksListEl = document.getElementById('tasks-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-tasks-btn');
const countAllEl = document.getElementById('count-all');
const countPendingEl = document.getElementById('count-pending');
const countCompletedEl = document.getElementById('count-completed');
const homeTasksCount = document.getElementById('home-tasks-count');

let tasksList = JSON.parse(localStorage.getItem('ramadan-tasks')) || [];
let currentFilter = 'all';

const updateTasksStats = () => {
    const total = tasksList.length;
    const completed = tasksList.filter(t => t.completed).length;
    const pending = total - completed;
    if (countAllEl) countAllEl.textContent = total;
    if (countPendingEl) countPendingEl.textContent = pending;
    if (countCompletedEl) countCompletedEl.textContent = completed;
    if (homeTasksCount) {
        homeTasksCount.textContent = completed + ' / ' + total;
    }
    localStorage.setItem('ramadan-tasks', JSON.stringify(tasksList));
};

const renderTasks = () => {
    if (!tasksListEl) return;
    tasksListEl.innerHTML = '';
    const filteredTasks = tasksList.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        tasksListEl.innerHTML = '<p class="empty-tasks-msg">لا توجد مهام في هذه القائمة حالياً.. أضف مهمتك الأولى فوق! ✨</p>';
        updateTasksStats();
        return;
    }

    filteredTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item ' + (task.completed ? 'completed' : '');
        item.innerHTML =
            '<div class="task-right">' +
            '<div class="task-checkbox"><i class="bx bx-check"></i></div>' +
            '<span class="task-text">' + task.text + '</span>' +
            '</div>' +
            '<div class="task-left">' +
            '<span class="task-badge">' + task.category + '</span>' +
            '<button class="delete-task-btn" title="حذف"><i class="bx bx-trash"></i></button>' +
            '</div>';

        item.querySelector('.task-right').addEventListener('click', () => {
            task.completed = !task.completed;
            renderTasks();
        });
        item.querySelector('.delete-task-btn').addEventListener('click', () => {
            tasksList = tasksList.filter(t => t.id !== task.id);
            renderTasks();
        });
        tasksListEl.appendChild(item);
    });
    updateTasksStats();
};

if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;
        const newTask = {
            id: Date.now(),
            text: text,
            category: taskCategory.value,
            completed: false
        };
        tasksList.unshift(newTask);
        taskInput.value = '';
        renderTasks();
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
        tasksList = tasksList.filter(t => !t.completed);
        renderTasks();
    });
}

renderTasks();


// 10. Habits Challenge Section (30 Days)
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsContainer = document.getElementById('habits-container');
const resetHabitsBtn = document.getElementById('reset-habits-btn');

let habitsList = JSON.parse(localStorage.getItem('ramadan-habits')) || [
    { id: 1, name: 'بر الوالدة وإدخال السرور عليها', days: Array(30).fill(false) },
    { id: 2, name: 'قراءة الورد اليومي من القرآن', days: Array(30).fill(false) },
    { id: 3, name: 'صلاة التراويح / قيام الليل', days: Array(30).fill(false) },
    { id: 4, name: 'شرب 8 أكواب ماء بعد الإفطار', days: Array(30).fill(false) }
];

const saveHabits = () => {
    localStorage.setItem('ramadan-habits', JSON.stringify(habitsList));
};

const renderHabits = () => {
    if (!habitsContainer) return;
    habitsContainer.innerHTML = '';
    if (habitsList.length === 0) {
        habitsContainer.innerHTML = '<p class="loading-text">لا توجد عادات حالياً.. أضف عادتك الأولى لتحدي الـ 30 يوم! 🔥</p>';
        return;
    }
    habitsList.forEach(habit => {
        const completedDays = habit.days.filter(Boolean).length;
        const card = document.createElement('div');
        card.className = 'habit-card';
        let daysHTML = '';
        habit.days.forEach((isChecked, dayIndex) => {
            daysHTML += '<div class="day-box ' + (isChecked ? 'checked' : '') + '" data-day="' + dayIndex + '">' + (dayIndex + 1) + '</div>';
        });
        card.innerHTML =
            '<div class="habit-header">' +
            '<div class="habit-title-box">' +
            '<h3>' + habit.name + '</h3>' +
            '<span class="habit-streak-badge">' + completedDays + ' / 30 يوم</span>' +
            '</div>' +
            '<button class="delete-task-btn" title="حذف العادة"><i class="bx bx-trash"></i></button>' +
            '</div>' +
            '<div class="days-grid">' + daysHTML + '</div>';

        card.querySelectorAll('.day-box').forEach(box => {
            box.addEventListener('click', () => {
                const dayIdx = parseInt(box.dataset.day);
                habit.days[dayIdx] = !habit.days[dayIdx];
                saveHabits();
                renderHabits();
            });
        });
        card.querySelector('.delete-task-btn').addEventListener('click', () => {
            habitsList = habitsList.filter(h => h.id !== habit.id);
            saveHabits();
            renderHabits();
        });
        habitsContainer.appendChild(card);
    });
};

if (habitForm) {
    habitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = habitInput.value.trim();
        if (!name) return;
        habitsList.push({
            id: Date.now(),
            name: name,
            days: Array(30).fill(false)
        });
        habitInput.value = '';
        saveHabits();
        renderHabits();
    });
}

if (resetHabitsBtn) {
    resetHabitsBtn.addEventListener('click', () => {
        habitsList.forEach(habit => {
            habit.days = Array(30).fill(false);
        });
        saveHabits();
        renderHabits();
    });
}

renderHabits();


// 11. Duaa & Wishes Section
const duaaForm = document.getElementById('duaa-form');
const duaaInput = document.getElementById('duaa-input');
const duaaCategory = document.getElementById('duaa-category');
const duaaGrid = document.getElementById('duaa-grid');

let duaaList = JSON.parse(localStorage.getItem('ramadan-duaa')) || [
    { id: 1, text: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا.', category: 'للوالدين والأهل', count: 0, answered: false },
    { id: 2, text: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.', category: 'جوامع الدعاء', count: 0, answered: false }
];

const saveDuaa = () => {
    localStorage.setItem('ramadan-duaa', JSON.stringify(duaaList));
};

const renderDuaa = () => {
    if (!duaaGrid) return;
    duaaGrid.innerHTML = '';
    if (duaaList.length === 0) {
        duaaGrid.innerHTML = '<p class="loading-text">قائمة الأدعية فارغة حالياً.. اكتب أول دعاء أو أمنية لك فوق! 🤲</p>';
        return;
    }
    duaaList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'duaa-card ' + (item.answered ? 'answered' : '');
        card.innerHTML =
            '<div class="duaa-card-top">' +
            '<span class="task-badge">' + item.category + '</span>' +
            '<button class="delete-task-btn" title="حذف"><i class="bx bx-trash"></i></button>' +
            '</div>' +
            '<p class="duaa-text">' + item.text + '</p>' +
            '<div class="duaa-card-actions">' +
            '<button class="pray-count-btn"><i class="bx bx-heart"></i> دعوت به (' + item.count + ')</button>' +
            '<button class="answered-btn">' + (item.answered ? 'تحقق بفضل الله ✨' : 'تحديد كمستجاب') + '</button>' +
            '</div>';

        card.querySelector('.pray-count-btn').addEventListener('click', () => {
            item.count++;
            saveDuaa();
            renderDuaa();
        });
        card.querySelector('.answered-btn').addEventListener('click', () => {
            item.answered = !item.answered;
            saveDuaa();
            renderDuaa();
        });
        card.querySelector('.delete-task-btn').addEventListener('click', () => {
            duaaList = duaaList.filter(d => d.id !== item.id);
            saveDuaa();
            renderDuaa();
        });
        duaaGrid.appendChild(card);
    });
};

if (duaaForm) {
    duaaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = duaaInput.value.trim();
        if (!text) return;
        duaaList.unshift({
            id: Date.now(),
            text: text,
            category: duaaCategory.value,
            count: 0,
            answered: false
        });
        duaaInput.value = '';
        saveDuaa();
        renderDuaa();
    });
}

renderDuaa();


// 12. Finance & Charity Section
const financeForm = document.getElementById('finance-form');
const financeTitle = document.getElementById('finance-title');
const financeAmount = document.getElementById('finance-amount');
const financeType = document.getElementById('finance-type');
const financeListEl = document.getElementById('finance-list');
const setBudgetBtn = document.getElementById('set-budget-btn');
const totalCharityEl = document.getElementById('total-charity-amount');
const monthlyBudgetEl = document.getElementById('monthly-budget-amount');
const remainingBudgetEl = document.getElementById('remaining-budget-amount');

let monthlyBudget = parseFloat(localStorage.getItem('ramadan-budget')) || 1000;
let financeRecords = JSON.parse(localStorage.getItem('ramadan-finance')) || [];

const updateFinanceStats = () => {
    const totalCharity = financeRecords.filter(item => item.type === 'charity').reduce((sum, item) => sum + item.amount, 0);
    const totalSpent = financeRecords.reduce((sum, item) => sum + item.amount, 0);
    const remaining = monthlyBudget - totalSpent;

    if (totalCharityEl) totalCharityEl.textContent = totalCharity + ' ريال';
    if (monthlyBudgetEl) monthlyBudgetEl.textContent = monthlyBudget + ' ريال';
    if (remainingBudgetEl) {
        remainingBudgetEl.textContent = remaining + ' ريال';
        remainingBudgetEl.style.color = remaining < 0 ? '#EF4444' : 'var(--white-color)';
    }
    localStorage.setItem('ramadan-budget', monthlyBudget);
    localStorage.setItem('ramadan-finance', JSON.stringify(financeRecords));
};

const renderFinanceRecords = () => {
    if (!financeListEl) return;
    financeListEl.innerHTML = '';
    if (financeRecords.length === 0) {
        financeListEl.innerHTML = '<p class="empty-tasks-msg">لا توجد عمليات مسجلة حالياً.. ابدأ بتسجيل أول صدقة أو مصروف فوق! 💚</p>';
        updateFinanceStats();
        return;
    }
    financeRecords.forEach(record => {
        const isCharity = record.type === 'charity';
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML =
            '<div class="finance-info">' +
            '<span class="task-text">' + record.title + '</span>' +
            '<span class="finance-date">' + record.date + ' • ' + (isCharity ? 'صدقة' : 'مصروف') + '</span>' +
            '</div>' +
            '<div class="task-left">' +
            '<span class="finance-amount-badge ' + (isCharity ? 'charity' : 'expense') + '">' + record.amount + ' ريال</span>' +
            '<button class="delete-task-btn" title="حذف"><i class="bx bx-trash"></i></button>' +
            '</div>';

        item.querySelector('.delete-task-btn').addEventListener('click', () => {
            financeRecords = financeRecords.filter(r => r.id !== record.id);
            renderFinanceRecords();
        });
        financeListEl.appendChild(item);
    });
    updateFinanceStats();
};

if (financeForm) {
    financeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = financeTitle.value.trim();
        const amount = parseFloat(financeAmount.value);
        if (!title || isNaN(amount) || amount <= 0) return;
        const todayStr = new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short' }).format(new Date());
        financeRecords.unshift({
            id: Date.now(),
            title: title,
            amount: amount,
            type: financeType.value,
            date: todayStr
        });
        financeTitle.value = '';
        financeAmount.value = '';
        renderFinanceRecords();
    });
}

if (setBudgetBtn) {
    setBudgetBtn.addEventListener('click', () => {
        const newBudget = prompt('أدخل الميزانية الشهرية الجديدة بالريال:', monthlyBudget);
        if (newBudget !== null && !isNaN(parseFloat(newBudget)) && parseFloat(newBudget) >= 0) {
            monthlyBudget = parseFloat(newBudget);
            updateFinanceStats();
        }
    });
}

renderFinanceRecords();


// 13. Health & Sports Section
const waterCupsGrid = document.getElementById('water-cups-grid');
const waterBadge = document.getElementById('water-badge');
const addWaterBtn = document.getElementById('add-water-btn');
const removeWaterBtn = document.getElementById('remove-water-btn');
const sleepHoursDisplay = document.getElementById('sleep-hours-display');
const sleepStatusBadge = document.getElementById('sleep-status-badge');
const decreaseSleepBtn = document.getElementById('decrease-sleep-btn');
const increaseSleepBtn = document.getElementById('increase-sleep-btn');
const energyBtns = document.querySelectorAll('.energy-btn');
const workoutForm = document.getElementById('workout-form');
const workoutNameInput = document.getElementById('workout-name');
const workoutDurationInput = document.getElementById('workout-duration');
const workoutTimeSelect = document.getElementById('workout-time');
const workoutsListEl = document.getElementById('workouts-list');
const resetHealthBtn = document.getElementById('reset-health-btn');

let healthData = JSON.parse(localStorage.getItem('ramadan-health')) || {
    waterCups: 0,
    sleepHours: 7,
    energy: '',
    workouts: []
};

const saveHealthData = () => {
    localStorage.setItem('ramadan-health', JSON.stringify(healthData));
};

const renderWaterCups = () => {
    if (!waterCupsGrid) return;
    waterCupsGrid.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
        const isFilled = i <= healthData.waterCups;
        const cup = document.createElement('div');
        cup.className = 'water-cup ' + (isFilled ? 'filled' : '');
        cup.innerHTML = '<i class="bx bxs-droplet"></i><span>كوب ' + i + '</span>';
        cup.addEventListener('click', () => {
            healthData.waterCups = (healthData.waterCups === i) ? i - 1 : i;
            saveHealthData();
            renderWaterCups();
        });
        waterCupsGrid.appendChild(cup);
    }
    if (waterBadge) {
        waterBadge.textContent = healthData.waterCups + ' / 8 أكواب';
    }
};

if (addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
        if (healthData.waterCups < 8) {
            healthData.waterCups++;
            saveHealthData();
            renderWaterCups();
        }
    });
}

if (removeWaterBtn) {
    removeWaterBtn.addEventListener('click', () => {
        if (healthData.waterCups > 0) {
            healthData.waterCups--;
            saveHealthData();
            renderWaterCups();
        }
    });
}

const updateSleepAndEnergyUI = () => {
    if (sleepHoursDisplay) {
        sleepHoursDisplay.textContent = healthData.sleepHours;
    }
    if (sleepStatusBadge) {
        if (healthData.sleepHours >= 7) {
            sleepStatusBadge.textContent = 'نوم ممتاز ✨';
        } else if (healthData.sleepHours >= 5) {
            sleepStatusBadge.textContent = 'نوم مقبول 👍';
        } else {
            sleepStatusBadge.textContent = 'يحتاج راحة 😴';
        }
    }
    energyBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.energy === healthData.energy);
    });
};

if (increaseSleepBtn) {
    increaseSleepBtn.addEventListener('click', () => {
        if (healthData.sleepHours < 16) {
            healthData.sleepHours++;
            saveHealthData();
            updateSleepAndEnergyUI();
        }
    });
}

if (decreaseSleepBtn) {
    decreaseSleepBtn.addEventListener('click', () => {
        if (healthData.sleepHours > 0) {
            healthData.sleepHours--;
            saveHealthData();
            updateSleepAndEnergyUI();
        }
    });
}

energyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        healthData.energy = btn.dataset.energy;
        saveHealthData();
        updateSleepAndEnergyUI();
    });
});

const renderWorkouts = () => {
    if (!workoutsListEl) return;
    workoutsListEl.innerHTML = '';
    if (healthData.workouts.length === 0) {
        workoutsListEl.innerHTML = '<p class="empty-tasks-msg">لم تسجل أي تمرين اليوم.. ابدأ بنشاطك الرياضي الآن! 💪</p>';
        return;
    }
    healthData.workouts.forEach(workout => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML =
            '<div class="finance-info">' +
            '<span class="task-text">' + workout.name + '</span>' +
            '<span class="finance-date">الوقت: ' + workout.time + '</span>' +
            '</div>' +
            '<div class="task-left">' +
            '<span class="task-badge">' + workout.duration + ' دقيقة</span>' +
            '<button class="delete-task-btn" title="حذف"><i class="bx bx-trash"></i></button>' +
            '</div>';

        item.querySelector('.delete-task-btn').addEventListener('click', () => {
            healthData.workouts = healthData.workouts.filter(w => w.id !== workout.id);
            saveHealthData();
            renderWorkouts();
        });
        workoutsListEl.appendChild(item);
    });
};

if (workoutForm) {
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = workoutNameInput.value.trim();
        const duration = parseInt(workoutDurationInput.value);
        if (!name || isNaN(duration) || duration <= 0) return;
        healthData.workouts.unshift({
            id: Date.now(),
            name: name,
            duration: duration,
            time: workoutTimeSelect.value
        });
        workoutNameInput.value = '';
        workoutDurationInput.value = '';
        saveHealthData();
        renderWorkouts();
    });
}

if (resetHealthBtn) {
    resetHealthBtn.addEventListener('click', () => {
        healthData = { waterCups: 0, sleepHours: 7, energy: '', workouts: [] };
        saveHealthData();
        renderWaterCups();
        updateSleepAndEnergyUI();
        renderWorkouts();
    });
}

renderWaterCups();
updateSleepAndEnergyUI();
renderWorkouts();


// 14. Statistics & Reports Section
const refreshStatsBtn = document.getElementById('refresh-stats-btn');

const setRingProgress = (ringId, percentage, radius = 42) => {
    const ring = document.getElementById(ringId);
    if (!ring) return;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = circumference;
    const offset = circumference - (percentage / 100) * circumference;
    setTimeout(() => {
        ring.style.strokeDashoffset = offset;
    }, 100);
};

const updateAllStatistics = () => {
    const prayersObj = JSON.parse(localStorage.getItem('ramadan-prayers')) || {};
    const totalPrayersDone = Object.values(prayersObj).filter(Boolean).length;
    const prayersPct = Math.round((totalPrayersDone / 8) * 100);
    setRingProgress('stat-prayers-ring', prayersPct, 42);

    const readSurahsArr = JSON.parse(localStorage.getItem('ramadan-read-surahs')) || [];
    const quranPct = Math.round((readSurahsArr.length / 114) * 100);
    setRingProgress('stat-quran-ring', quranPct, 42);

    const athkarTotal = parseInt(localStorage.getItem('ramadan-daily-athkar')) || 0;
    const athkarBar = document.getElementById('stat-athkar-bar');
    if (athkarBar) athkarBar.style.width = Math.min((athkarTotal / 100) * 100, 100) + '%';

    const tasksArr = JSON.parse(localStorage.getItem('ramadan-tasks')) || [];
    const completedTasks = tasksArr.filter(t => t.completed).length;
    const tasksPct = tasksArr.length > 0 ? Math.round((completedTasks / tasksArr.length) * 100) : 0;
    setRingProgress('stat-tasks-ring', tasksPct, 42);

    const budgetVal = parseFloat(localStorage.getItem('ramadan-budget')) || 1000;
    const financeArr = JSON.parse(localStorage.getItem('ramadan-finance')) || [];
    const charitySum = financeArr.filter(i => i.type === 'charity').reduce((s, i) => s + i.amount, 0);

    const healthObj = JSON.parse(localStorage.getItem('ramadan-health')) || { waterCups: 0, workouts: [] };
    const waterPct = Math.round(((healthObj.waterCups || 0) / 8) * 100);

    const overallPct = Math.round((prayersPct + quranPct + tasksPct + waterPct) / 4);
    setRingProgress('overall-ring', overallPct, 52);
};

if (refreshStatsBtn) {
    refreshStatsBtn.addEventListener('click', updateAllStatistics);
}
updateAllStatistics();


// 15. Mobile Sidebar Toggle & Responsive Navigation
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebarEl = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuIcon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;

const toggleMobileMenu = (forceClose = false) => {
    if (!sidebarEl || !sidebarOverlay) return;
    const isOpen = forceClose ? false : !sidebarEl.classList.contains('open');
    sidebarEl.classList.toggle('open', isOpen);
    sidebarOverlay.classList.toggle('active', isOpen);
    if (mobileMenuIcon) {
        mobileMenuIcon.className = isOpen ? 'bx bx-x' : 'bx bx-menu';
    }
};

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => toggleMobileMenu(true));
}