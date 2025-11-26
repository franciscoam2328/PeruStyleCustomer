export function getLogo({ width = "150", height = "40", textColor = "text-gray-900", accentColor = "text-primary" } = {}) {
    // Default colors if classes aren't sufficient (for inline styles)
    const darkColor = "#1f2937"; // gray-900
    const tealColor = "#2dd4bf"; // teal-400/primary approx

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
        <!-- Icon: Stylized Needles/Threads -->
        <g class="${accentColor}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <!-- Needle 1 -->
            <path d="M60 15 L30 45" class="text-teal-400" stroke="#2dd4bf" />
            <!-- Needle 2 -->
            <path d="M70 18 L35 42" class="text-teal-500" stroke="#14b8a6" />
            <!-- Thread curve -->
            <path d="M25 45 C 35 55, 65 55, 75 25" stroke="#2dd4bf" class="text-teal-400" stroke-width="2" />
        </g>

        <!-- Text: Peru -->
        <text x="10" y="45" font-family="'Montserrat', sans-serif" font-weight="700" font-size="32" class="${textColor}" fill="currentColor">Peru</text>
        
        <!-- Text: Style -->
        <text x="88" y="45" font-family="'Montserrat', sans-serif" font-weight="400" font-size="32" class="${accentColor}" fill="#2dd4bf">Style</text>
    </svg>
    `;
}

// Version for dark backgrounds (forces white text)
export function getLogoWhite({ width = "150", height = "40" } = {}) {
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
        <!-- Icon -->
        <g stroke-width="2.5" stroke-linecap="round">
            <path d="M60 15 L30 45" stroke="#2dd4bf" />
            <path d="M70 18 L35 42" stroke="#14b8a6" />
            <path d="M25 45 C 35 55, 65 55, 75 25" stroke="#2dd4bf" stroke-width="2" />
        </g>

        <!-- Text: Peru (White) -->
        <text x="10" y="45" font-family="'Montserrat', sans-serif" font-weight="700" font-size="32" fill="white">Peru</text>
        
        <!-- Text: Style (Teal) -->
        <text x="88" y="45" font-family="'Montserrat', sans-serif" font-weight="400" font-size="32" fill="#2dd4bf">Style</text>
    </svg>
    `;
}
