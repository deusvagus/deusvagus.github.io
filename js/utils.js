const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    highlightText(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    },

    fuzzySearch(query, text) {
        const pattern = query.split('').map(char => `(?=.*${char})`).join('');
        const regex = new RegExp(pattern, 'i');
        return regex.test(text);
    }
};