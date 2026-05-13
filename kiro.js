import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import chalk from "chalk";
import gradient from "gradient-string";
import { input, select } from "@inquirer/prompts";
import dayjs from "dayjs";
import fs from "fs";
import { table } from "table";

chromium.use(stealth());


function displayBanner() {
    console.clear();
    const kiroGradient = gradient(['#00FFFF', '#0080FF', '#000080']);
    console.log(kiroGradient(`
    ██╗  ██╗██╗██████╗  ██████╗     ██████╗ ███████╗██╗   ██╗
    ██║ ██╔╝██║██╔══██╗██╔═══██╗    ██╔══██╗██╔════╝██║   ██║
    █████╔╝ ██║██████╔╝██║   ██║    ██║  ██║█████╗  ██║   ██║
    ██╔═██╗ ██║██╔══██╗██║   ██║    ██║  ██║██╔══╝  ╚██╗ ██╔╝
    ██║  ██╗██║██║  ██║╚██████╔╝    ██████╔╝███████╗ ╚████╔╝ 
    ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝     ╚═════╝ ╚══════╝  ╚═══╝  
    KIRO.DEV X AWS BUILDER - Protocol Injected
    By Paizutempest | Sniper Mode Active
    `));
}

const log = {
    info: (msg) => console.log(`${chalk.cyan('ℹ')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    success: (msg) => console.log(`${chalk.green('✔')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    warn: (msg) => console.log(`${chalk.yellow('⚠')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    error: (msg) => console.log(`${chalk.red('✖')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    process: (msg) => console.log(`${chalk.blue('⚙')} [${dayjs().format('HH:mm:ss')}] ${chalk.italic(msg)}...`)
};

function getDeepIdentity() {
    const devices = [
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', platform: 'Windows' },
        { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', platform: 'MacIntel' },
        { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', platform: 'Linux x86_64' },
        { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l' },
        { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', platform: 'iPhone' }
    ];
    const pick = devices[Math.floor(Math.random() * devices.length)];
    const screens = [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }];
    return { ...pick, screen: screens[Math.floor(Math.random() * screens.length)] };
}

async function getEmailFromGenerator(browserContext) {
    const page = await browserContext.newPage();
    try {
        log.process("Generating temporary email...");
        await page.goto('https://generator.email/', { waitUntil: 'networkidle' });
        await page.click('button.e7m:has-text("Generate new e-mail")');
        await page.waitForTimeout(2000);
        const email = await page.innerText('#email_ch_text');
        log.success(`Email Created: ${chalk.yellow(email)}`);
        return { email, emailPage: page };
    } catch (err) {
        log.error("Failed to get email: " + err.message);
        await page.close();
        return null;
    }
}

async function startEngine(count) {
    for (let i = 1; i <= count; i++) {
        const id = getDeepIdentity();
        log.process(`[Akun ${i}] Inisialisasi Deep Ocean Identity`);

        const browser = await chromium.launch({ 
            headless: true, 
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--disable-extensions',
                '--mute-audio', 
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });

        const context = await browser.newContext({ userAgent: id.ua, viewport: id.screen });
        const page = await context.newPage();

        // BLOCK RESOURCES - AGGRESSIVE MODE
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'media', 'font', 'stylesheet'].includes(type)) route.abort();
            else route.continue();
        });

        try {
            // 1. Ambil Email
            const genData = await getEmailFromGenerator(context);
            if (!genData) throw new Error("Email provider failed.");
            const { email, emailPage } = genData;

            // 2. Kiro Sign-in via Builder ID
            log.process("Navigasi ke Kiro Sign-in...");
            await page.goto('https://app.kiro.dev/signin', { waitUntil: 'networkidle' });
            await page.click('button:has-text("Builder ID")');

           // --- LOGIKA AWS BUILDER ID FLOW ---
            await page.waitForURL(/signin.aws|profile.aws/, { timeout: 30000 });
            log.success("AWS Section detected.");

            // 1. Cek & Klik Cookie Accept
            try {
                const acceptBtn = page.locator('button[data-id="awsccc-cb-btn-accept"]');
                if (await acceptBtn.isVisible({ timeout: 5000 })) {
                    log.info("Crushing cookie preferences...");
                    await acceptBtn.click();
                }
            } catch (e) {
                // Skip jika tidak muncul
            }

            // 2. DETEKSI ERROR AWS
            const isError = await page.isVisible('text="Sorry, there was an error processing your request"');
            if (isError) {
                log.error("AWS Error detected! Skipping and switching email...");
                throw new Error("AWS_PROCESS_ERROR_SKIP"); // Lempar ke catch untuk ganti iterasi
            }

            // 3. Input Email & Continue
            await page.fill('input[placeholder="username@example.com"]', email);
            await page.click('button[type="submit"]:has-text("Continue")');

            // 4. Input Name & Continue
            log.process("Waiting for name input page...");
            await page.waitForSelector('input[placeholder="Maria José Silva"]', { timeout: 15000 });
            
            await page.fill('input[placeholder="Maria José Silva"]', "Paizuuu Tempesttt " + Math.floor(Math.random() * 999));
            
            // Klik Continue
            const continueBtn = page.locator('button[type="submit"]').filter({ hasText: "Continue" });
            await continueBtn.click();
            log.info("Name submitted.");

            // 5. Catch OTP
            let otp = null;
            log.process("Sniffing OTP from generator.email...");
            for (let retry = 0; retry < 12; retry++) {
                await emailPage.reload({ waitUntil: 'networkidle' });
                const otpElement = await emailPage.$('div.code');
                if (otpElement) {
                    otp = (await otpElement.innerText()).trim();
                    break;
                }
                await page.waitForTimeout(5000);
            }

            if (!otp) throw new Error("OTP timeout.");
            log.success(`OTP Found: ${chalk.magenta(otp)}`);

            // 6. Submit OTP & Set Password
            await page.fill('input[placeholder="6-digit"]', otp);
            await page.click('button:has-text("Continue")');

            log.process("Waiting for password creation page...");
            
            // Gunakan selector ganda (Inggris/Indo) biar anti-stuck
            const passInput = page.locator('input[placeholder="Create password"], input[placeholder="Masukkan kata sandi"]');
            
            // Tunggu navigasi selesai atau selector muncul
            await Promise.race([
                passInput.waitFor({ state: 'visible', timeout: 45000 }),
                page.waitForSelector('text="Create your password"', { timeout: 45000 })
            ]).catch(() => {});

            const defaultPass = "Paizuu12345!!!";
            
            // Masukkan password pakai selector yang lebih luas
            log.info("Injecting password...");
            await page.locator('input[type="password"]').nth(0).fill(defaultPass, { force: true });
            await page.locator('input[type="password"]').nth(1).fill(defaultPass, { force: true });
            
            // Klik Lanjutkan / Continue
            const finalBtn = page.locator('button:has-text("Lanjutkan"), button:has-text("Continue")');
            await finalBtn.click({ force: true });
            
            log.success("Password set! Finalizing account...");

            // 7. Success & Stripe Checkout Capture
            await page.waitForURL('https://app.kiro.dev/account/usage', { timeout: 30000 });
            log.success("Kiro Dashboard Reached!");

            const [stripePage] = await Promise.all([
                context.waitForEvent('page'),
                page.click('button:has-text("Upgrade to Pro")')
            ]);

            await stripePage.waitForLoadState();
            const stripeUrl = stripePage.url();
            log.success(`Checkout Link: ${chalk.yellow(stripeUrl)}`);

            // 8. Simpan Data
            const data = { email, password: defaultPass, checkoutUrl: stripeUrl, date: dayjs().format('YYYY-MM-DD HH:mm') };
            let saved = fs.existsSync('kiro_accounts.json') ? JSON.parse(fs.readFileSync('kiro_accounts.json')) : [];
            saved.push(data);
            fs.writeFileSync('kiro_accounts.json', JSON.stringify(saved, null, 2));
            log.success(`Akun ${i} disimpan ke kiro_accounts.json`);

        } catch (err) {
            log.error(`Gagal pada akun ${i}: ${err.message}`);
        } finally {
            await browser.close();
            log.info("Sesi ditutup, jeda 5 detik...");
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

async function stripeCheckout(stripePage, cardData) {
    console.log(chalk.bgMagenta.white.bold("\n ⚔️  STRIPE MANUAL ASSIST PROTOCOL ⚔️ "));
    console.log(chalk.cyan("Silakan COPY-PASTE data di bawah ini ke browser yang terbuka:\n"));

    // Tampilkan Tabel Data agar enak dilihat
    const cardInfo = [
        ["CARD NUMBER", chalk.yellow.bold(cardData.number)],
        ["EXPIRY (MM/YY)", chalk.yellow.bold(cardData.expiry)],
        ["CVC", chalk.yellow.bold(cardData.cvc)],
        ["CARDHOLDER", chalk.green("Paizu Sniper")],
        ["ADDRESS", chalk.green("144 Commercial Street")],
        ["CITY", chalk.green("Braintree")],
        ["STATE", chalk.green("Massachusetts (MA)")],
        ["ZIP CODE", chalk.green("02184")],
        ["COUNTRY", chalk.green("United States (US)")]
    ];
    console.log(table(cardInfo));

    log.warn("Bot sedang MENUNGGU... Silakan isi form di atas secara manual.");
    log.info("Setelah lu klik 'Subscribe', bot bakal otomatis ngedeteksi kalau sukses.");

    try {
        // Bot nunggu sampe URL berubah ke arah sukses (Kiro Dashboard)
        // Timeout dibuat lama (2 menit) biar lu ada waktu buat ngetik
        await stripePage.waitForURL(/success|confirmation|usage/, { timeout: 120000 });
        
        log.success(chalk.bgGreen.black(" HIT DETECTED! ") + " Akun lu udah jadi PRO!");
        return true;
    } catch (err) {
        log.error("Waktu habis atau pembayaran gagal diisi.");
        return false;
    }
}
// Fungsi biar nomor kartu lolos validasi Luhn (Anti-Invalid)
function generateLuhnCC(bin) {
    let cc = bin;
    while (cc.length < 15) {
        cc += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < cc.length; i++) {
        let digit = parseInt(cc[cc.length - 1 - i]);
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return cc + checkDigit;
}
async function checkoutOnly() {
    if (!fs.existsSync("kiro_accounts.json")) return log.error("Data JSON tidak ditemukan.");
    
    const accounts = JSON.parse(fs.readFileSync("kiro_accounts.json"));
    log.info(`Ditemukan ${accounts.length} akun. Siap-siap Copas!`);

    const browser = await chromium.launch({ headless: false }); 
    const context = await browser.newContext();

    for (const acc of accounts) {
        if (acc.checkoutUrl) {
            // 1. GENERATE DATA
            const bin = "5154620022"; 
const validNumber = generateLuhnCC(bin); 

const cardData = {
    number: validNumber, 
    expiry: "12 / 28", 
    cvc: Math.floor(100 + Math.random() * 899).toString(), // CVC random 3 digit
    country: "US"
};

            // 2. TAMPILIN DI TERMINAL DETIK INI JUGA (Tanpa nunggu page load)
            console.log(chalk.bgMagenta.white.bold("\n ⚔️  DATA READY UNTUK COPY-PASTE ⚔️ "));
            const cardInfo = [
                ["TARGET EMAIL", chalk.cyan(acc.email)],
                ["CARD NUMBER", chalk.yellow.bold(cardData.number)],
                ["EXPIRY (MM/YY)", chalk.yellow.bold(cardData.expiry)],
                ["CVC", chalk.yellow.bold(cardData.cvc)],
                ["CARDHOLDER", chalk.green("Paizu Sniper")],
                ["ADDRESS", chalk.green("144 Commercial Street")],
                ["CITY", chalk.green("Braintree")],
                ["STATE", chalk.green("Massachusetts (MA)")],
                ["ZIP CODE", chalk.green("02184")],
                ["COUNTRY", chalk.green("United States (US)")]
            ];
            console.log(table(cardInfo));

            // 3. BARU JALANIN BROWSERNYA
            log.process(`Opening browser for: ${acc.email}`);
            const stripePage = await context.newPage();
            
            try {
                // Pake domcontentloaded biar lebih cepet muncul browsernya
                await stripePage.goto(acc.checkoutUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
                
                log.warn("Silakan Copas data di atas ke browser!");
                
                // Panggil fungsi nunggu sukses
                const isHit = await stripeCheckout(stripePage, cardData);

                if (isHit) {
                    fs.appendFileSync('kiro_hits.txt', `${acc.email}:${acc.password} | SUCCESS\n`);
                }

            } catch (err) {
                log.error(`Halaman error: ${err.message}`);
            } finally {
                await stripePage.close();
                console.log(chalk.gray("-------------------------------------------"));
            }
        }
    }
    await browser.close();
}

// --- MAIN MENU UPDATE ---
(async function main() {
    displayBanner();
    const menu = await select({
        message: 'Kiro.dev Menu:',
        choices: [
            { name: '1. Start Auto Register (Kiro Pro Builder)', value: 'run' },
            { name: '2. View Saved Accounts', value: 'view' },
            { name: '3. Kiro Auto Checkout (From JSON)', value: 'checkout_only' },
            { name: '4. Kiro Regist + Auto Checkout', value: 'full_auto' },
            { name: '0. Exit', value: 'exit' },
        ],
    });

    if (menu === 'run') {
        const jml = await input({ message: "Jumlah akun yang ingin dibuat:", default: "1" });
        await startEngine(parseInt(jml), false); // false = registrasi saja
    }

    if (menu === 'view') {
        if (!fs.existsSync("kiro_accounts.json")) return log.error("Data kosong.");
        const accounts = JSON.parse(fs.readFileSync("kiro_accounts.json"));
        const rows = accounts.map(a => [a.email, "Success", a.date]);
        console.log(table([["Email", "Status", "Date"], ...rows]));
    }

    if (menu === 'checkout_only') {
        await checkoutOnly();
    }

    if (menu === 'full_auto') {
        //const jml = await input({ message: "Berapa akun Full Auto (Regist+CO)?", default: "1" });
        //await startEngine(parseInt(jml), true); // true = langsung gas CO setelah regist
    log.warn("Menu ini masih dalam perbaikan deteksi Stripe!");
    }
    
    if (menu !== 'exit') {
        setTimeout(main, 2000);
    } else {
        process.exit();
    }
})();