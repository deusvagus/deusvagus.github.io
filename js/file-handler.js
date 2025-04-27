const FileHandler = {
    async loadAllDataFiles() {
        try {
            // 預定義的資料夾列表
            const folders = [
                'data/原神',
                'data/星穹铁道'
            ];

            const dataPromises = folders.map(folder => 
                fetch(folder)
                    .then(response => response.text())
                    .then(text => {
                        const parser = new DOMParser();
                        const html = parser.parseFromString(text, 'text/html');
                        return Array.from(html.querySelectorAll('a'))
                            .map(a => a.href)
                            .filter(href => href.endsWith('.json'))
                            .map(file => fetch(file).then(response => response.json()));
                    })
                    .catch(error => {
                        console.error(`Error scanning folder ${folder}:`, error);
                        return [];
                    })
            );

            const folderResults = await Promise.all(dataPromises);
            const allData = await Promise.all(folderResults.flat());
            return allData.filter(data => data !== null);
        } catch (error) {
            console.error('Error loading data files:', error);
            return [];
        }
    },

    async scanDirectory(path) {
        try {
            const response = await fetch(path);
            const text = await response.text();
            const parser = new DOMParser();
            const html = parser.parseFromString(text, 'text/html');
            const links = Array.from(html.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.startsWith(path));

            const files = [];
            const subDirs = [];

            for (const link of links) {
                if (link.endsWith('.json')) {
                    files.push(link);
                } else if (!link.endsWith('/')) {
                    subDirs.push(link);
                }
            }

            // 遞歸掃描子資料夾
            for (const dir of subDirs) {
                const subFiles = await this.scanDirectory(dir);
                files.push(...subFiles);
            }

            return files;
        } catch (error) {
            console.error(`Error scanning directory ${path}:`, error);
            return [];
        }
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
                } else if (lowerRole.includes('编曲') || lowerRole.includes('arranger') || lowerRole.includes('Adoption') ||
                    lowerRole.includes('orchestrator') || lowerRole.includes('配器') || lowerRole.includes('改编') ||
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
