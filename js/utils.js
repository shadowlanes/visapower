function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = [...countryCode.toUpperCase()].map(
        char => 127397 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
}

function showErrorMessage(message, resultsContainer) {
    resultsContainer.innerHTML = `<p class="empty-state" style="color: #e74c3c;">${message}</p>`;
}
