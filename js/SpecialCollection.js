const SpecialCollectionHandler = {
    collections: {},

    loadCollections(path) {
        return fetch(path)
            .then(response => response.json())
            .then(data => {
                this.collections = data;
                return data;
            })
            .catch(error => {
                console.error('Error loading special collections:', error);
                return {};
            });
    },
    populateCollectionSelect() {
        const select = document.getElementById('specialCollectionSelect');
        Object.keys(this.collections).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            select.appendChild(option);
        });
    },

    filterResults(results, collectionName) {
        if (!collectionName || !this.collections[collectionName]) {
            return results;
        }
        const collectionTracks = this.collections[collectionName];
        return results.filter(result => collectionTracks.includes(result.track.track));
    }
};