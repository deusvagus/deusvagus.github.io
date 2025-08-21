const FileHandler = {
    async loadAllDataFiles() {
        try {
            // 首先加載 data.json 來獲取文件列表
            const response = await fetch('data/data.json');
            if (!response.ok) {
                throw new Error('Failed to load data.json');
            }
            const fileList = await response.json();

            // 收集所有需要加載的文件
            const allFiles = [];
            for (const [folder, files] of Object.entries(fileList)) {
                allFiles.push(...files.map(file => `data/${file}`));
            }

            console.log('Attempting to load files:', allFiles);

            // 加載所有文件
            const dataPromises = allFiles.map(file => 
                fetch(file)
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`File not found: ${file}`);
                            return null;
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error(`Error loading ${file}:`, error);
                        return null;
                    })
            );

            const allData = await Promise.all(dataPromises);
            const validData = allData.filter(data => data !== null);
            
            if (validData.length === 0) {
                console.error('No valid data files found');
                return [];
            }

            console.log(`Successfully loaded ${validData.length} files`);
            return validData;
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
            console.log("REAL ROLE:", JSON.stringify(role),
              "CHARS:", [...role].map(c => c.charCodeAt(0).toString(16)),
              "VALUE:", JSON.stringify(name));
            if (typeof name === 'string' && name.trim() !== '') {
                const lowerRole = role.toLowerCase();
                if (lowerRole.includes('作曲') || lowerRole.includes('composer')) {
                    processedTrack.composers.push({ role, name });
                } else if (lowerRole.includes('编曲') || lowerRole.includes('arranger') || lowerRole.includes('adoption') ||
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
