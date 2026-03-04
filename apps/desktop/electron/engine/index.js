const fs = require('fs');
const path = require('path');
const os = require('os');
const { PDFDocument } = require('pdf-lib');

// 🤝 SHARED CORE LOGIC (Mirrored from src/utils/shared-core.ts)
const SHARED_ENGINE = {
    getOutputName: (originalName, suffix, ext) => {
        const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        return `${base}_${suffix}.${ext.replace('.', '')}`;
    },
    ENGINE_VERSION: 'Bozdemir Engine v2.0-Standalone'
};

/**
 * BOZDEMIR DESKTOP ENGINE - Premium Node.js Processing Core
 * providing native OS-level services.
 * Powered by Ilyas Bozdemir.
 */
class BozdemirEngine {
    constructor() {
        this.version = '1.2.0';
        this.buildId = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // YYYY-MM-DD HH:mm:ss
        this.id = 'BOZDEMIR_CORE_01';
        this.status = 'Ready';
        this.activeTasks = 0;
        this.tempDir = path.join(os.tmpdir(), 'bozdemir-engine-temp');
        
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async getStatus() {
        return {
            version: this.version,
            buildId: this.buildId,
            id: this.id,
            status: this.status,
            activeTasks: this.activeTasks,
            uptime: Math.round(process.uptime()),
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            platform: process.platform,
            arch: process.arch
        };
    }

    /**
     * NATIVE PDF MERGE - Performance over Browser
     */
    async nativeMergePdfs(buffers) {
        this.activeTasks++;
        try {
            const mergedPdf = await PDFDocument.create();
            for (const buffer of buffers) {
                const pdf = await PDFDocument.load(buffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            return await mergedPdf.save();
        } finally {
            this.activeTasks--;
        }
    }

    /**
     * NATIVE IMAGE TO PDF - High performance for large images
     */
    async imageToPdfNative(imageBuffer, ext) {
        this.activeTasks++;
        try {
            const pdfDoc = await PDFDocument.create();
            let image;
            if (ext === '.jpg' || ext === '.jpeg') {
                image = await pdfDoc.embedJpg(imageBuffer);
            } else if (ext === '.png') {
                image = await pdfDoc.embedPng(imageBuffer);
            } else {
                throw new Error('Unsupported image format for native PDF conversion');
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });

            return await pdfDoc.save();
        } finally {
            this.activeTasks--;
        }
    }

    /**
     * NATIVE PDF MERGE - Multi-file high performance
     */
    async nativeMergePdfs(pdfBuffers) {
        this.activeTasks++;
        try {
            const mergedPdf = await PDFDocument.create();
            for (const buffer of pdfBuffers) {
                const pdf = await PDFDocument.load(buffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const resultBuffer = await mergedPdf.save();
            return { success: true, buffer: resultBuffer };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            this.activeTasks--;
        }
    }

    /**
     * NATIVE FILE STATS - Safe OS Read
     */
    async getNativeFileStats(filePath) {
        if (!fs.existsSync(filePath)) return null;
        const stats = fs.statSync(filePath);
        return {
            size: stats.size,
            mtime: stats.mtime,
            atime: stats.atime,
            isDir: stats.isDirectory(),
            extension: path.extname(filePath).toLowerCase(),
            absolutePath: path.resolve(filePath)
        };
    }

    /**
     * NATIVE BUFFER TO BASE64 - High performance conversion
     */
    async bufferToBase64(buffer) {
        return buffer.toString('base64');
    }

    // Engine clean-up
    async purgeTemp() {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
            fs.unlinkSync(path.join(this.tempDir, file));
        }
        return true;
    }
}

module.exports = new BozdemirEngine();
