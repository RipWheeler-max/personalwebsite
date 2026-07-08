const fs = require('fs');
const path = require('path');

const frontendFiles = ['public/index.html', 'public/blog.html', 'public/about.html', 'public/projects.html'];
const adminFiles = ['admin/index.html', 'admin/login.html'];

frontendFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        content = content.replace(/<text y='\.9em' font-size='90'>⚡<\/text>/g, "<text y='.9em' font-size='90' fill='%2300f5ff'>懒</text>");
        fs.writeFileSync(filePath, content);
        console.log(`Updated frontend icon in ${file}`);
    }
});

adminFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Add favicon if not present
        if (!content.includes('<link rel="icon"')) {
            content = content.replace(
                /<title>(.*?)<\/title>/,
                `<title>$1</title>\n    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚙️</text></svg>">`
            );
        }

        // Update visual logo
        content = content.replace(/<span class="logo-icon">⚡<\/span>/g, '<span class="logo-icon"><i class="fas fa-terminal"></i></span>');
        content = content.replace(/<h1>⚡ ADMIN<\/h1>/g, '<h1><i class="fas fa-terminal" style="margin-right: 10px; color: var(--neon-blue);"></i>ADMIN</h1>');

        fs.writeFileSync(filePath, content);
        console.log(`Updated admin icons in ${file}`);
    }
});
