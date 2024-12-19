const express = require('express');
const baserowService = require('../services/baserow.service');

const router = express.Router();

// Lists routes
router.get('/lists', async (req, res) => {
    try {
        const { page = 1, size = 25 } = req.query;
        const filters = {};

        // Extract filters from query params
        Object.entries(req.query).forEach(([key, value]) => {
            if (key.startsWith('filters[') && key.endsWith(']')) {
                // Extract the field name from filters[Field Name]
                const fieldName = key.slice(8, -1);
                filters[fieldName] = value;
            }
        });

        const data = await baserowService.getLists({ filters, page, size });
        res.json(data);
    } catch (error) {
        console.error('Error getting lists:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/lists', async (req, res) => {
    try {
        const { 'Tenant ID': tenantId, Name, Tags, Active } = req.body;

        // Ensure Tenant ID is provided
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        // Create list data with correct field names
        const listData = {
            'Tenant ID': tenantId,
            'Name': Name,
            'Tags': Tags,
            'Active': Active
        };

        console.log('Creating list with data:', listData);
        const data = await baserowService.createList(listData);
        res.json(data);
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/lists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Tenant_ID } = req.body;

        // Ensure Tenant_ID is provided
        if (!Tenant_ID) {
            return res.status(400).json({ error: 'Tenant_ID is required' });
        }

        const data = await baserowService.updateList(id, req.body);
        res.json(data);
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Failed to update list in Baserow' });
    }
});

router.delete('/lists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Tenant_ID } = req.query;

        // Ensure Tenant_ID is provided
        if (!Tenant_ID) {
            return res.status(400).json({ error: 'Tenant_ID is required' });
        }

        await baserowService.deleteList(id);
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Failed to delete list from Baserow' });
    }
});

// Campaigns routes
router.get('/campaigns', async (req, res) => {
    try {
        const { page = 1, size = 25 } = req.query;
        const filters = {};

        // Extract filters from query params
        Object.entries(req.query).forEach(([key, value]) => {
            if (key.startsWith('filters[') && key.endsWith(']')) {
                // Extract the field name from filters[Field Name]
                const fieldName = key.slice(8, -1);
                filters[fieldName] = value;
            }
        });

        const data = await baserowService.getCampaigns({ filters, page, size });
        res.json(data);
    } catch (error) {
        console.error('Error getting campaigns:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/campaigns', async (req, res) => {
    try {
        const { Tenant_ID } = req.body;

        // Ensure Tenant_ID is provided
        if (!Tenant_ID) {
            return res.status(400).json({ error: 'Tenant_ID is required' });
        }

        const data = await baserowService.createCampaign(req.body);
        res.json(data);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign in Baserow' });
    }
});

router.patch('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Tenant_ID } = req.body;

        // Ensure Tenant_ID is provided
        if (!Tenant_ID) {
            return res.status(400).json({ error: 'Tenant_ID is required' });
        }

        const data = await baserowService.updateCampaign(id, req.body);
        res.json(data);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign in Baserow' });
    }
});

router.delete('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Tenant_ID } = req.query;

        // Ensure Tenant_ID is provided
        if (!Tenant_ID) {
            return res.status(400).json({ error: 'Tenant_ID is required' });
        }

        await baserowService.deleteCampaign(id);
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign from Baserow' });
    }
});

// Contacts routes
router.get('/contacts/count', async (req, res) => {
    try {
        const { 'Tenant ID': tenantId, 'List Name': listName } = req.query;

        // Ensure required fields are present
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }
        if (!listName) {
            return res.status(400).json({ error: 'List Name is required' });
        }

        const data = await baserowService.getContacts({
            filters: {
                'Tenant ID': tenantId,
                'List Name': listName
            },
            page: 1,
            size: 1 // We only need the count, so set size to 1 to minimize data transfer
        });

        res.json({ count: data.count });
    } catch (error) {
        console.error('Error getting contacts count:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/contacts', async (req, res) => {
    try {
        const { page = 1, size = 25, ...filters } = req.query;

        // Remove pagination params from filters
        delete filters.page;
        delete filters.size;

        const data = await baserowService.getContacts({ filters, page, size });
        res.json(data);
    } catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/contacts', async (req, res) => {
    try {
        const { 'Tenant ID': tenantId } = req.body;

        // Ensure Tenant ID is provided
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        // Log the incoming data
        console.log('Creating contact with data:', req.body);
        const data = await baserowService.createContact(req.body);
        res.json(data);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 