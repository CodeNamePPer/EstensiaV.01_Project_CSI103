const globalImageCache = new Map();

async function getCachedImageUrl(url) {
    // ป้องกันการ fetch blob URL ซ้ำซ้อน ซึ่งอาจพังถ้า regex ไปเปลี่ยนเลขพอร์ต
    if (url.startsWith("blob:")) return url;

    if (globalImageCache.has(url)) {
        return globalImageCache.get(url);
    }
    // เริ่มพยายามโหลดภาพในแบคกราวด์เพื่อลด Request
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const objUrl = URL.createObjectURL(blob);
        globalImageCache.set(url, objUrl);
        return objUrl;
    } catch (e) {
        return url; // fallback กลับไปใช้ url เดิมถ้าโหลด fail
    }
}

export async function animate(src=null, frame=1, delay=50){
    const img = document.getElementById(src);
    if (!img) return;

    let baseSrc = img.getAttribute("data-original-src") || img.getAttribute("data-base-src") || img.getAttribute("src");
    
    if (!baseSrc || baseSrc.startsWith("blob:")) {
        return; // ทำงานไม่ได้ถ้าไม่รู้ path ไฟล์ดั้งเดิม
    }
    
    img.setAttribute("data-original-src", baseSrc);

    for (let i = 1; i <= frame; i++){
        const frame_num = String(i).padStart(4, "0");
        let newSrc;

        baseSrc.includes("0001")? newSrc = baseSrc.replace("0001", frame_num) : newSrc = baseSrc.replace(/(\d{4})/, frame_num);
        
        let cachedSrc = await getCachedImageUrl(newSrc);
        img.src = cachedSrc;
        
        await new Promise(r => setTimeout(r, delay));
    }
}

export async function animateLoop(src=null, frame=1, delay=50, isRunning=false){ 
    let i = 1;
    const img = document.getElementById(src);
    if (!img) return;

    let baseSrc = img.getAttribute("data-original-src") || img.getAttribute("src");
    
    if (!baseSrc || baseSrc.startsWith("blob:")) {
        return;
    }
    img.setAttribute("data-original-src", baseSrc);
    
    // พรีโหลดภาพล่วงหน้าสำหรับ baseSrc ตอนแรกสุด
    for (let p = 1; p <= frame; p++){
        const p_num = String(p).padStart(4, "0");
        let preSrc = baseSrc.includes("0001") ? baseSrc.replace("0001", p_num) : baseSrc.replace(/(\d{4})/, p_num);
        getCachedImageUrl(preSrc).catch(()=>{});
    }

    while (true){
        if(!isRunning()) break;

        // เช็คว่าถ้ามีการสลับรูปด้วยโค้ดอื่น เช่น เอาเมาส์ชี้ แล้วไป set รูปใหม่เป็น .png แบบชั่วคราว
        let currentAttr = img.getAttribute("src");
        if (currentAttr && !currentAttr.startsWith("blob:") && currentAttr !== baseSrc) {
            baseSrc = currentAttr;
            img.setAttribute("data-original-src", baseSrc);
            i = 1; // เปลี่ยนภาพเริ่มต้นจาก 1 ใหม่
        }
        
        const frame_num = String(i).padStart(4, "0");
        let newSrc;

        baseSrc.includes("0001")? newSrc = baseSrc.replace("0001", frame_num) : newSrc = baseSrc.replace(/(\d{4})/, frame_num);
        
        // ดึงภาพจาก cache
        let cachedSrc = await getCachedImageUrl(newSrc);
        img.src = cachedSrc;
        
        await new Promise(r => setTimeout(r, delay));

        i = (i % frame) + 1;
    }
}

export async function animateLoopStable(src=null, frame=1, delay=50, isRunning=false){ 
    let i = 1;
    const img = document.getElementById(src);
    if (!img) return;

    let baseSrc = img.getAttribute("data-original-src") || img.getAttribute("src");
    
    if (!baseSrc || baseSrc.startsWith("blob:")) {
        return;
    }
    img.setAttribute("data-original-src", baseSrc);
    
    // พรีโหลดภาพทั้งหมดล่วงหน้า
    for (let p = 1; p <= frame; p++){
        const p_num = String(p).padStart(4, "0");
        let preSrc = baseSrc.includes("0001") ? baseSrc.replace("0001", p_num) : baseSrc.replace(/(\d{4})/, p_num);
        getCachedImageUrl(preSrc).catch(()=>{});
    }

    while (true){
        if(!isRunning()) break;

        // เช็คเผื่อเมาส์ hover และสลับ src
        let currentAttr = img.getAttribute("src");
        if (currentAttr && !currentAttr.startsWith("blob:") && currentAttr !== baseSrc) {
            baseSrc = currentAttr;
            img.setAttribute("data-original-src", baseSrc);
            i = 1;
        }

        const frame_num = String(i).padStart(4, "0");
        let newSrc;

        baseSrc.includes("0001")? newSrc = baseSrc.replace("0001", frame_num) : newSrc = baseSrc.replace(/(\d{4})/, frame_num);
        
        let cachedSrc = await getCachedImageUrl(newSrc);
        img.src = cachedSrc;
        
        await new Promise(r => setTimeout(r, delay));

        i = (i % frame) + 1;
    }
}
