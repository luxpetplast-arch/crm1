const fs = require('fs');
const path = require('path');

// Google Drive ga yuklash uchun tayyor fayl
function prepareForGoogleDrive() {
    const backupDir = path.join(__dirname, 'backup');
    const files = fs.readdirSync(backupDir);
    
    console.log('📱 Google Drive ga yuklash uchun tayyor fayllar:');
    
    files.forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        console.log(`📄 ${file}`);
        console.log(`   📊 Hajmi: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   📅 Yaratilgan: ${stats.mtime.toLocaleString('uz-UZ')}`);
        console.log(`   📍 Manzil: ${filePath}`);
        console.log('');
    });
    
    console.log('📤 Google Drive ga yuklash usullari:');
    console.log('1. 🌐 https://drive.google.com ga boring');
    console.log('2. 📁 backup papkasini oching');
    console.log('3. ⬆️ Fayllarni torting yoki "Upload" tugmasini bosing');
    console.log('4. 📱 Google Drive mobil ilovasidan foydalaning');
    
    console.log('\n🎯 Fayllar tayyor - Google Drive ga yuklang!');
}

// Skriptni ishga tushirish
if (require.main === module) {
    prepareForGoogleDrive();
}

module.exports = { prepareForGoogleDrive };
