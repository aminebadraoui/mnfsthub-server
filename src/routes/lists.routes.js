import express from 'express';
import { getLists, createList, getListById, updateList, deleteList } from '../services/lists.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all lists
router.get('/', async (req, res) => {
    try {
        // Get tenantId from query parameters or authenticated user
        const tenantId = req.query.tenant_id || req.user?.tenantId;

        if (!tenantId) {
            return res.status(400).json({ error: 'No tenant ID found. Please provide tenant_id in the query parameters or ensure you are authenticated.' });
        }

        const lists = await getLists({ tenantId });
        res.json(lists);
    } catch (error) {
        console.error('Error getting lists:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Create a new list
router.post('/', async (req, res) => {
    try {
        // Use tenant_id from request body
        const listData = {
            ...req.body
        };

        if (!listData.tenant_id) {
            return res.status(400).json({ error: 'tenant_id is required' });
        }

        const list = await createList(listData);
        res.status(201).json(list);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a list by ID
router.get('/:id', async (req, res) => {
    try {
        const list = await getListById(req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if the list belongs to the user's tenant
        if (list.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a list
router.put('/:id', async (req, res) => {
    try {
        const list = await getListById(req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if the list belongs to the user's tenant
        if (list.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const updatedList = await updateList(req.params.id, req.body);
        res.json(updatedList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a list
router.delete('/:id', async (req, res) => {
    try {
        const list = await getListById(req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if the list belongs to the user's tenant
        if (list.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const success = await deleteList(req.params.id);
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 