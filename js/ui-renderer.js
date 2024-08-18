const UIRenderer = {
    keyword: '',

    highlightText(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    },

    displayRoleInfo(track, roleType, roleTitle) {
        let roleInfo = '';
        if (track[roleType] && track[roleType].length > 0) {
            roleInfo += `<div class="role-category">${roleTitle}：</div>`;
            track[roleType].forEach(item => {
                roleInfo += `<div class="role">${item.role}: ${this.highlightText(item.name, this.keyword)}</div>`;
            });
        }
        return roleInfo;
    },

    displayResults(results, trackCount) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const albumMap = new Map();
        for (let result of results) {
            if (!albumMap.has(result.album.album)) {
                albumMap.set(result.album.album, []);
            }
            albumMap.get(result.album.album).push(result.track);
        }

        const sortOrder = document.getElementById('sortOrder').value;
        const sortedAlbums = Array.from(albumMap.entries()).sort((a, b) => {
            const dateA = new Date(a[1][0].album.date);
            const dateB = new Date(b[1][0].album.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        for (let [albumName, tracks] of sortedAlbums) {
            let albumInfo = `<div class="album-container">
                <div class="album" data-album-id="${albumName}">${this.highlightText(albumName, this.keyword)}</div>
                <div class="date">${tracks[0].album.date}</div>
                <div id="${albumName}" class="track-container" style="display: block;">`;

            for (let track of tracks) {
                const highlightedTrack = this.highlightText(track.track, this.keyword);
                albumInfo += `<div class="title" data-track-id="${albumName}-${track.track}">${highlightedTrack}</div>`;
                albumInfo += `<div id="${albumName}-${track.track}" class="role-container" style="display: block;">`;
                
                albumInfo += this.displayRoleInfo(track, 'composers', '作曲');
                albumInfo += this.displayRoleInfo(track, 'arrangers', '编曲');
                albumInfo += this.displayRoleInfo(track, 'others', '其他');

                albumInfo += `</div>`;
            }

            albumInfo += `</div></div>`;
            resultsDiv.innerHTML += albumInfo;
        }

        if (resultsDiv.innerHTML === '') {
            resultsDiv.innerHTML = '<p>未找到符合的結果。</p>';
        } else {
            resultsDiv.insertAdjacentHTML('afterbegin', `<p>找到 ${trackCount} 首曲目。</p>`);
        }
    },

    setKeyword(keyword) {
        this.keyword = keyword;
    }
};