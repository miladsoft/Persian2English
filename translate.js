const dictionary = {
    "سلام": "Hello",
    "خداحافظ": "Goodbye",
    "چطور": "How",
    "هستی": "are you",
    "خوب": "Good",
    "بد": "Bad"
    // می‌توانید دیکشنری را با کلمات بیشتر تکمیل کنید
};

export function translateText(text) {
    const words = text.split(' ');
    const translatedWords = words.map(word => dictionary[word] || word);
    return translatedWords.join(' ');
}
