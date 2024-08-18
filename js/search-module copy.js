const SearchModule = {
    search(albums, keyword, type, filters) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        for (let album of albums) {
            if (!album.tracks || !Array.isArray(album.tracks)) {
                continue;
            }
            for (let track of album.tracks) {
                let matchFound = false;
                const filteredTrack = {
                    track: track.track,
                    composers: [],
                    arrangers: [],
                    others: [],
                    album: album
                };

                // 标题搜索
                if (type === 'title' || type === 'all') {
                    if (Utils.fuzzySearch(lowerKeyword, track.track.toLowerCase())) {
                        matchFound = true;
                        // filteredTrack.track = Utils.highlightText(track.track, keyword);
                    }
                }

                // 只有在"全部"搜索或特定类型搜索时才搜索其他字段
                if (type !== 'title') {
                    const searchInRole = (roleArray, roleType) => {
                        roleArray.forEach(item => {
                            if (Utils.fuzzySearch(lowerKeyword, item.name.toLowerCase())) {
                                matchFound = true;
                                filteredTrack[roleType].push({
                                    role: item.role,
                                    name: Utils.highlightText(item.name, keyword)
                                });
                            }
                        });
                    };

                    if (type === 'composer' || type === 'all') searchInRole(track.composers, 'composers');
                    if (type === 'arranger' || type === 'all') searchInRole(track.arrangers, 'arrangers');
                    if (type === 'other' || type === 'all') searchInRole(track.others, 'others');
                }

                // 处理空关键词的情况
                if (keyword === '') {
                    matchFound = true;
                    if (filters.composerChecked) filteredTrack.composers = track.composers;
                    if (filters.arrangerChecked) filteredTrack.arrangers = track.arrangers;
                    if (filters.otherChecked) filteredTrack.others = track.others;
                } else if (matchFound) {
                    // 如果找到匹配项，根据过滤器添加其他角色信息
                    if (filters.composerChecked && filteredTrack.composers.length === 0) {
                        filteredTrack.composers = track.composers;
                    }
                    if (filters.arrangerChecked && filteredTrack.arrangers.length === 0) {
                        filteredTrack.arrangers = track.arrangers;
                    }
                    if (filters.otherChecked && filteredTrack.others.length === 0) {
                        filteredTrack.others = track.others;
                    }
                }

                if (matchFound) {
                    results.push({ album: album, track: filteredTrack });
                }
            }
        }

        return results;
    }
};