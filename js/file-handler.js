const FileHandler = {
    loadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    },

    processData(albums) {
        return albums.map(album => ({
            ...album,
            tracks: album.tracks.map(this.processTrack)
        }));
    },

    processTrack(track) {
        const processedTrack = {
            track: track.track,
            composers: [],
            arrangers: [],
            others: []
        };

        for (let role in track) {
            if (role === 'track') continue;
            let name = track[role];
            if (typeof name === 'string' && name.trim() !== '') {
                const lowerRole = role.toLowerCase();
                if (lowerRole.includes('作曲') || lowerRole.includes('composer')) {
                    processedTrack.composers.push({ role, name });
                } else if (lowerRole.includes('编曲') || lowerRole.includes('arranger') ||
                    lowerRole.includes('orchestrator') || lowerRole.includes('配器') ||
                    lowerRole.includes('编配')) {
                    processedTrack.arrangers.push({ role, name });
                } else {
                    processedTrack.others.push({ role, name });
                }
            }
        }

        return processedTrack;
    }
};