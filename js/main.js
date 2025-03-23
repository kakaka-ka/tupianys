// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressionSettings = document.getElementById('compressionSettings');
const previewArea = document.getElementById('previewArea');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressionRatio = document.getElementById('compressionRatio');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片数据
let currentFile = null;
let originalImage = null;

// 文件大小格式化函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 图片压缩函数
function compressImage(file, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 保持原始尺寸
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0);
                
                // 压缩图片
                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    file.type,
                    quality / 100
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// 更新压缩预览
async function updateCompressedPreview() {
    if (!currentFile || !originalImage) return;
    
    const quality = parseInt(qualitySlider.value);
    const compressedBlob = await compressImage(currentFile, quality);
    
    // 更新压缩后的预览
    compressedPreview.src = URL.createObjectURL(compressedBlob);
    
    // 更新文件大小信息
    compressedSize.textContent = formatFileSize(compressedBlob.size);
    
    // 计算压缩比例
    const ratio = ((currentFile.size - compressedBlob.size) / currentFile.size * 100).toFixed(1);
    compressionRatio.textContent = `${ratio}%`;
    
    // 更新下载按钮
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        link.download = `compressed_${currentFile.name}`;
        link.click();
    };
}

// 处理文件上传
function handleFileUpload(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }
    
    currentFile = file;
    
    // 显示原始图片信息
    originalSize.textContent = formatFileSize(file.size);
    
    // 预览原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            originalPreview.src = e.target.result;
            originalDimensions.textContent = `${originalImage.width} x ${originalImage.height}`;
            
            // 显示压缩设置和预览区域
            compressionSettings.style.display = 'block';
            previewArea.style.display = 'block';
            
            // 更新压缩预览
            updateCompressedPreview();
        };
    };
    reader.readAsDataURL(file);
}

// 事件监听器
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#0071e3';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#e0e0e0';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e0e0e0';
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    updateCompressedPreview();
}); 