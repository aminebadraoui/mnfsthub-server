const axios = require('axios');

const BASEROW_API_URL = 'https://space.mnfstai.com/api';

const TABLES = {
    LISTS: '621',
    CAMPAIGNS: '622',
    CONTACTS: '609'
};

const DEFAULT_PAGE_SIZE = 25;

class BaserowService {
    constructor() {
        this.config = {
            headers: {
                'Authorization': `Token ${process.env.BASEROW_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
    }

    // Generic method to get rows with filters and pagination
    async getFilteredRows(tableId, { filters = {}, page = 1, size = DEFAULT_PAGE_SIZE } = {}) {
        try {
            const offset = (page - 1) * size;
            let url = `${BASEROW_API_URL}/database/rows/table/${tableId}/?user_field_names=true&size=${size}&offset=${offset}`;

            // Add filter parameters
            if (Object.keys(filters).length > 0) {
                const filterParams = Object.entries(filters)
                    .map(([key, value]) => {
                        if (value !== undefined && value !== '' && value !== 'N/A') {
                            // Convert spaces to underscores and add field_ prefix
                            const fieldName = key.replace(/\s+/g, '_');
                            return `filter__field_${fieldName}__equal=${encodeURIComponent(value)}`;
                        }
                        return null;
                    })
                    .filter(Boolean)
                    .join('&');

                if (filterParams) {
                    url += `&${filterParams}`;
                }
            }

            console.log('Making request to URL:', url);
            const response = await axios.get(url, this.config);
            return {
                results: response.data.results,
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page,
                totalPages: Math.ceil(response.data.count / size),
                pageSize: size
            };
        } catch (error) {
            console.error(`Error fetching rows from table ${tableId}:`, error);
            throw error;
        }
    }

    // Generic CRUD methods
    async createRow(tableId, data) {
        try {
            const response = await axios.post(
                `${BASEROW_API_URL}/database/rows/table/${tableId}/?user_field_names=true`,
                data,
                this.config
            );
            return response.data;
        } catch (error) {
            console.error(`Error creating row in table ${tableId}:`, error);
            throw error;
        }
    }

    async updateRow(tableId, rowId, data) {
        try {
            const response = await axios.patch(
                `${BASEROW_API_URL}/database/rows/table/${tableId}/${rowId}/?user_field_names=true`,
                data,
                this.config
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating row ${rowId} in table ${tableId}:`, error);
            throw error;
        }
    }

    async deleteRow(tableId, rowId) {
        try {
            await axios.delete(
                `${BASEROW_API_URL}/database/rows/table/${tableId}/${rowId}/`,
                this.config
            );
            return true;
        } catch (error) {
            console.error(`Error deleting row ${rowId} from table ${tableId}:`, error);
            throw error;
        }
    }

    // Lists methods
    async getLists(options = {}) {
        return this.getFilteredRows(TABLES.LISTS, options);
    }

    async createList(data) {
        try {
            console.log('Creating list with data:', data);
            const response = await axios.post(
                `${BASEROW_API_URL}/database/rows/table/${TABLES.LISTS}/?user_field_names=true`,
                data,
                this.config
            );
            console.log('Baserow response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating list:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.config?.headers,
                data: error.config?.data
            });
            throw error;
        }
    }

    async updateList(id, data) {
        return this.updateRow(TABLES.LISTS, id, data);
    }

    async deleteList(id) {
        return this.deleteRow(TABLES.LISTS, id);
    }

    // Campaigns methods
    async getCampaigns(options = {}) {
        return this.getFilteredRows(TABLES.CAMPAIGNS, options);
    }

    async createCampaign(data) {
        return this.createRow(TABLES.CAMPAIGNS, data);
    }

    async updateCampaign(id, data) {
        return this.updateRow(TABLES.CAMPAIGNS, id, data);
    }

    async deleteCampaign(id) {
        return this.deleteRow(TABLES.CAMPAIGNS, id);
    }

    // Contacts methods
    async getContacts({ filters = {}, page = 1, size = DEFAULT_PAGE_SIZE } = {}) {
        try {
            const offset = (page - 1) * size;
            let url = `${BASEROW_API_URL}/database/rows/table/${TABLES.CONTACTS}/?user_field_names=true&size=${size}&offset=${offset}`;

            // Add filter parameters
            if (Object.keys(filters).length > 0) {
                const filterParams = Object.entries(filters)
                    .map(([key, value]) => {
                        if (value !== undefined && value !== '' && value !== 'N/A') {
                            // Use the field name directly without any prefix
                            return `filter__${key}__equal=${encodeURIComponent(value)}`;
                        }
                        return null;
                    })
                    .filter(Boolean)
                    .join('&');

                if (filterParams) {
                    url += `&${filterParams}`;
                }
            }

            console.log('Fetching contacts with URL:', url);
            console.log('Filters used:', filters);
            const response = await axios.get(url, this.config);
            console.log('Response data:', {
                count: response.data.count,
                results: response.data.results.length,
                filters: filters
            });
            return {
                results: response.data.results,
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous
            };
        } catch (error) {
            console.error('Error getting contacts:', error);
            throw error;
        }
    }

    async createContact(data) {
        try {
            // Log the incoming data
            console.log('Incoming contact data:', data);

            // Filter out N/A values and create a clean object
            const contactData = {};
            Object.entries(data).forEach(([key, value]) => {
                if (value && value !== '' && value !== 'N/A') {
                    // Keep exact field names from Baserow
                    contactData[key] = value;
                }
            });

            // Log the data being sent to Baserow
            console.log('Sending to Baserow:', contactData);
            const url = `${BASEROW_API_URL}/database/rows/table/${TABLES.CONTACTS}/?user_field_names=true`;
            console.log('URL:', url);

            const response = await axios.post(
                url,
                contactData,
                this.config
            );

            // Log the response
            console.log('Baserow response:', response.data);
            return response.data;
        } catch (error) {
            // Enhanced error logging
            console.error('Error creating contact:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.config?.headers,
                data: error.config?.data
            });
            throw error;
        }
    }

    async updateContact(id, data) {
        try {
            const response = await axios.patch(
                `${BASEROW_API_URL}/database/rows/table/${TABLES.CONTACTS}/${id}/?user_field_names=true`,
                data,
                this.config
            );
            return response.data;
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    }

    async deleteContact(id) {
        try {
            await axios.delete(
                `${BASEROW_API_URL}/database/rows/table/${TABLES.CONTACTS}/${id}/`,
                this.config
            );
            return true;
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    }
}

module.exports = new BaserowService(); 